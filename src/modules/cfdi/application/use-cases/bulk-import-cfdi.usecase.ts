// src/modules/cfdi/application/use-cases/bulk-import-cfdi.usecase.ts
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

@injectable()
export class BulkImportCfdiUseCase {
  constructor(
    @inject('XmlValidator') private readonly validator: XmlValidatorPort,
    @inject('FileStorage') private readonly storage: FileStoragePort,
    @inject('CfdiRepo') private readonly repo: CfdiRepositoryPort,
    @inject('CfdiQueue') private readonly queue: QueueProducerPort,
  ) {}

  async execute(zipBuffer: Buffer, userId: number): Promise<BulkResult[]> {
    // 1️⃣ escribir ZIP a temporal
    const tmpPath = path.join(os.tmpdir(), `bulk-${Date.now()}.zip`);
    await fs.writeFile(tmpPath, zipBuffer);

    // 2️⃣ abrir ZIP
    const zip = new StreamZip({ file: tmpPath, storeEntries: true });
    await new Promise<void>((resolve, reject) => {
      zip.on('ready', () => resolve());
      zip.on('error', (e) => reject(e));
    });

    const entries = zip.entries();
    const limit = pLimit(10);

    const unfiltered = await Promise.all<BulkResult | null>(
      Object.values(entries).map((entry) =>
        limit(async () => {
          if (entry.isDirectory || !entry.name.toLowerCase().endsWith('.xml'))
            return null;

          // leer entrada
          const stream = await new Promise<NodeJS.ReadableStream>((res, rej) =>
            zip.stream(entry.name, (err, stm) => (err ? rej(err) : res(stm!))),
          );
          let xmlStr = '';
          for await (const chunk of stream) {
            xmlStr += chunk.toString('utf8');
          }

          // validar XSD
          try {
            await this.validator.validate(xmlStr);
          } catch (err) {
            return {
              file: entry.name,
              status: 'invalid_xml',
              error: (err as Error).message,
            };
          }

          // parse mínimo
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
          });
          const json = parser.parse(xmlStr);
          const cfdi = json['cfdi:Comprobante'];
          if (!cfdi) {
            return {
              file: entry.name,
              status: 'invalid_xml',
              error: 'INVALID_CFDI',
            };
          }

          const timbre = cfdi['cfdi:Complemento']?.['tfd:TimbreFiscalDigital'];
          const uuid = timbre?.['@_UUID'];
          if (!uuid) {
            return {
              file: entry.name,
              status: 'invalid_xml',
              error: 'UUID_NOT_FOUND',
            };
          }

          // unicidad
          if (await this.repo.existsByUuid(uuid)) {
            // ➊ usamos findByUuid para obtener el ID
            const existing = await this.repo.findByUuid(uuid);
            return {
              file: entry.name,
              status: 'already_imported',
              id: existing.id,
            };
          }

          // extraer campos obligatorios
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
          const lugarExp = cfdi['@_LugarExpedicion'];
          const nombreEmisor = emisor?.['@_Nombre'] ?? null;
          const nombreReceptor = receptor?.['@_Nombre'] ?? null;

          // guardar XML
          const storedPath = await this.storage.save(
            Buffer.from(xmlStr, 'utf8'),
            `${uuid}.xml`,
          );

          // crear header
          const header = new CfdiHeader();
          header.uuid = uuid;
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
          header.lugarExpedicion = lugarExp;
          header.xmlPath = storedPath;
          header.nombreEmisor = nombreEmisor;
          header.nombreReceptor = nombreReceptor;
          header.status = 'PENDING';
          header.user = Object.assign(new User(), { id: userId });

          await this.repo.save(header);

          // encolar
          await this.queue.addJob('process-cfdi', {
            cfdiId: header.id,
            path: storedPath,
            uuid: header.uuid,
            originalFilename: entry.name,
          });

          return { file: entry.name, status: 'enqueued', id: header.id };
        }),
      ),
    );

    zip.close();
    await fs.unlink(tmpPath);

    // filtrar nulos y ordenar grupos: invalid_xml → already_imported → skipped → enqueued
    const flat = unfiltered.filter((r): r is BulkResult => r !== null);
    const order: Record<BulkResult['status'], number> = {
      invalid_xml: 0,
      already_imported: 1,
      skipped: 2,
      enqueued: 3,
    };
    return flat.sort((a, b) => order[a.status] - order[b.status]);
  }
}
