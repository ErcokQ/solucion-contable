import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import StreamZip from 'node-stream-zip';
import pLimit from 'p-limit';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { XMLParser } from 'fast-xml-parser';

import { XmlValidatorPort } from '../ports/xml-validator.port';
import { FileStoragePort } from '../ports/storage.port';
import { CfdiRepositoryPort } from '../ports/cfdi-repository.port';
import { QueueProducerPort } from '../ports/queue-producer.port';
import { ApiError } from '@shared/error/ApiError';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { User } from '@auth/domain/entities/user.entity';

type BulkResult =
  | { file: string; status: 'invalid_xml'; error: string }
  | { file: string; status: 'skipped' }
  | { file: string; status: 'already_imported'; id: number }
  | { file: string; status: 'enqueued'; id: number };

type ParsedCfdi = {
  file: string;
  uuid: string;
  xmlBuffer: Buffer;
  headerData: {
    rfcEmisor: string;
    rfcReceptor: string;
    subTotal: number;
    descuento: number;
    total: number;
    fecha: Date;
    moneda: string;
    tipoCambio: number;
    formaPago?: string;
    metodoPago?: string;
    lugarExpedicion?: string;
    nombreEmisor: string | null;
    nombreReceptor: string | null;
  };
};

type Intermediate =
  | { kind: 'parsed'; value: ParsedCfdi }
  | { kind: 'invalid'; value: BulkResult }
  | null;

@injectable()
export class BulkImportCfdiUseCase {
  private static readonly BATCH_SIZE = 200; // ajustable según memoria / tamaño ZIP

  constructor(
    @inject('XmlValidator') private readonly validator: XmlValidatorPort,
    @inject('FileStorage') private readonly storage: FileStoragePort,
    @inject('CfdiRepo') private readonly repo: CfdiRepositoryPort,
    @inject('CfdiQueue') private readonly queue: QueueProducerPort,
  ) {}

  private async readEntryAsBuffer(
    zip: StreamZip,
    entryName: string,
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      zip.stream(entryName, (err, stm) => {
        if (err || !stm) return reject(err ?? new Error('Empty stream'));

        const chunks: Buffer[] = [];
        stm.on('data', (chunk) => chunks.push(chunk as Buffer));
        stm.on('end', () => resolve(Buffer.concat(chunks)));
        stm.on('error', reject);
      });
    });
  }

  async execute(zipBuffer: Buffer, userId: number): Promise<BulkResult[]> {
    const tmpPath = path.join(os.tmpdir(), `bulk-${Date.now()}.zip`);
    await fs.writeFile(tmpPath, zipBuffer);

    const zip = new StreamZip({ file: tmpPath, storeEntries: true });

    try {
      await new Promise<void>((resolve, reject) => {
        zip.on('ready', () => resolve());
        zip.on('error', (e) => reject(e));
      });

      const allEntries = Object.values(zip.entries());
      const xmlEntries = allEntries.filter(
        (entry) =>
          !entry.isDirectory && entry.name.toLowerCase().endsWith('.xml'),
      );

      const results: BulkResult[] = [];

      for (
        let i = 0;
        i < xmlEntries.length;
        i += BulkImportCfdiUseCase.BATCH_SIZE
      ) {
        const batch = xmlEntries.slice(i, i + BulkImportCfdiUseCase.BATCH_SIZE);
        const batchResults = await this.processBatch(zip, batch, userId);
        results.push(...batchResults);
      }

      const order: Record<BulkResult['status'], number> = {
        invalid_xml: 0,
        already_imported: 1,
        skipped: 2,
        enqueued: 3,
      };

      return results.sort((a, b) => order[a.status] - order[b.status]);
    } finally {
      zip.close();
      try {
        await fs.unlink(tmpPath);
      } catch {
        // ignore
      }
    }
  }

  private async processBatch(
    zip: StreamZip,
    entries: StreamZip.ZipEntry[],
    userId: number,
  ): Promise<BulkResult[]> {
    // Ahora el parse NO llama al validador, así que puede ser más concurrente
    const limitParse = pLimit(8); // CPU-bound JS
    // Aquí sí incluimos validación XSD + IO, mejor concurrencia baja
    const limitSave = pLimit(2);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    // FASE 1: leer + parsear + extraer datos (SIN XSD)
    const intermediate = await Promise.all<Intermediate>(
      entries.map((entry) =>
        limitParse(async () => {
          try {
            const xmlBuffer = await this.readEntryAsBuffer(zip, entry.name);
            const xmlStr = xmlBuffer.toString('utf8');

            const json = parser.parse(xmlStr);
            const cfdi = json['cfdi:Comprobante'];
            if (!cfdi) {
              return {
                kind: 'invalid',
                value: {
                  file: entry.name,
                  status: 'invalid_xml',
                  error: 'INVALID_CFDI',
                } as BulkResult,
              };
            }

            const timbre =
              cfdi['cfdi:Complemento']?.['tfd:TimbreFiscalDigital'];
            const uuid = timbre?.['@_UUID'];
            if (!uuid) {
              return {
                kind: 'invalid',
                value: {
                  file: entry.name,
                  status: 'invalid_xml',
                  error: 'UUID_NOT_FOUND',
                } as BulkResult,
              };
            }

            const emisor = cfdi['cfdi:Emisor'];
            const receptor = cfdi['cfdi:Receptor'];

            const rfcEmisor =
              emisor?.['@_Rfc'] ??
              timbre?.['@_RfcProvCertif'] ??
              (() => {
                throw new ApiError(400, 'RFC_EMISOR_NOT_FOUND');
              })();

            const rfcReceptor =
              receptor?.['@_Rfc'] ??
              (() => {
                throw new ApiError(400, 'RFC_RECEPTOR_NOT_FOUND');
              })();

            const subTotal = parseFloat(cfdi['@_SubTotal']);
            const descuento = parseFloat(cfdi['@_Descuento'] ?? '0');
            const total = parseFloat(cfdi['@_Total']);
            const fecha = new Date(cfdi['@_Fecha']);
            const moneda = cfdi['@_Moneda'];
            const tipoCambio = parseFloat(cfdi['@_TipoCambio'] ?? '1');
            const formaPago = cfdi['@_FormaPago'];
            const metodoPago = cfdi['@_MetodoPago'];
            const lugarExpedicion = cfdi['@_LugarExpedicion'];
            const nombreEmisor = emisor?.['@_Nombre'] ?? null;
            const nombreReceptor = receptor?.['@_Nombre'] ?? null;

            const parsed: ParsedCfdi = {
              file: entry.name,
              uuid,
              xmlBuffer,
              headerData: {
                rfcEmisor,
                rfcReceptor,
                subTotal,
                descuento,
                total,
                fecha,
                moneda,
                tipoCambio,
                formaPago,
                metodoPago,
                lugarExpedicion,
                nombreEmisor,
                nombreReceptor,
              },
            };

            return { kind: 'parsed', value: parsed };
          } catch (err) {
            const errorMsg =
              err instanceof ApiError || err instanceof Error
                ? err.message
                : 'UNKNOWN_ERROR';

            return {
              kind: 'invalid',
              value: {
                file: entry.name,
                status: 'invalid_xml',
                error: errorMsg,
              } as BulkResult,
            };
          }
        }),
      ),
    );

    const invalidResults: BulkResult[] = [];
    const parsedCfdis: ParsedCfdi[] = [];

    for (const item of intermediate) {
      if (!item) continue;
      if (item.kind === 'invalid') invalidResults.push(item.value);
      else parsedCfdis.push(item.value);
    }

    // FASE 2: consulta masiva de UUID existentes solo para este batch
    const uniqueUuids = Array.from(new Set(parsedCfdis.map((p) => p.uuid)));

    const existingRows = await this.repo.findExistingByUuids(uniqueUuids);
    const existingMap = new Map<string, number>(
      existingRows.map((row) => [row.uuid, row.id]),
    );

    // FASE 3: validar XSD SOLO los nuevos + guardar + encolar jobs
    const saveResults = await Promise.all<BulkResult>(
      parsedCfdis.map((item) =>
        limitSave(async () => {
          const existingId = existingMap.get(item.uuid);
          if (existingId) {
            // CFDI ya importado: NO corremos el validador XSD ni tocamos disco/BD
            return {
              file: item.file,
              status: 'already_imported',
              id: existingId,
            };
          }

          // validar contra XSD solo si es nuevo
          const xmlStr = item.xmlBuffer.toString('utf8');
          try {
            await this.validator.validate(xmlStr);
          } catch (err) {
            const errorMsg =
              err instanceof ApiError || err instanceof Error
                ? err.message
                : 'INVALID_XML';

            return {
              file: item.file,
              status: 'invalid_xml',
              error: errorMsg,
            };
          }

          const {
            rfcEmisor,
            rfcReceptor,
            subTotal,
            descuento,
            total,
            fecha,
            moneda,
            tipoCambio,
            formaPago,
            metodoPago,
            lugarExpedicion,
            nombreEmisor,
            nombreReceptor,
          } = item.headerData;

          const storedPath = await this.storage.save(
            item.xmlBuffer,
            `${item.uuid}.xml`,
          );

          const header = new CfdiHeader();
          header.uuid = item.uuid;
          header.rfcEmisor = rfcEmisor;
          header.rfcReceptor = rfcReceptor;
          header.subTotal = subTotal;
          header.descuento = descuento;
          header.total = total;
          header.fecha = fecha;
          header.moneda = moneda;
          header.tipoCambio = tipoCambio;
          header.formaPago = formaPago;
          header.metodoPago = metodoPago;
          header.lugarExpedicion = lugarExpedicion;
          header.xmlPath = storedPath;
          header.nombreEmisor = nombreEmisor;
          header.nombreReceptor = nombreReceptor;
          header.status = 'PENDING';
          header.user = Object.assign(new User(), { id: userId });

          await this.repo.save(header);

          await this.queue.addJob('process-cfdi', {
            cfdiId: header.id,
            path: storedPath,
            uuid: header.uuid,
            originalFilename: item.file,
          });

          return { file: item.file, status: 'enqueued', id: header.id };
        }),
      ),
    );

    return [...invalidResults, ...saveResults];
  }
}
