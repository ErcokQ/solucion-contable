// src/modules/cfdi/application/use-cases/import-cfdi.usecase.ts
import { injectable, inject } from 'tsyringe';
import { UploadCfdiDto } from '../dto/upload-cfdi.dto';
import { XmlValidatorPort } from '../ports/xml-validator.port';
import { FileStoragePort } from '../ports/storage.port';
import { CfdiRepositoryPort } from '../ports/cfdi-repository.port';
import { QueueProducerPort } from '../ports/queue-producer.port';
import { ApiError } from '@shared/error/ApiError';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { XMLParser } from 'fast-xml-parser';

@injectable()
export class ImportCfdiUseCase {
  constructor(
    @inject('XmlValidator') private readonly validator: XmlValidatorPort,
    @inject('FileStorage') private readonly storage: FileStoragePort,
    @inject('CfdiRepo') private readonly repo: CfdiRepositoryPort,
    @inject('CfdiQueue') private readonly queue: QueueProducerPort,
  ) {}

  async execute(dto: UploadCfdiDto) {
    /* 1. Obtener XML como string */
    const xml = dto.file
      ? dto.file.toString()
      : Buffer.from(dto.xmlBase64!, 'base64').toString();

    /* 2. Validar XSD y estructura CFDI */
    await this.validator.validate(xml);

    /* 3. Parsear mínimo para obtener UUID y campos básicos */
    const parser = new XMLParser({
      ignoreAttributes: false, // ← necesario para leer @_
      attributeNamePrefix: '@_',
    });
    const json = parser.parse(xml);
    const comprobante = json['cfdi:Comprobante'];
    if (!comprobante) throw new ApiError(400, 'INVALID_CFDI');

    const timbre = comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital'];
    const uuid = timbre?.['@_UUID'];
    if (!uuid) throw new ApiError(400, 'UUID_NOT_FOUND');

    /* 4. Unicidad */
    if (await this.repo.existsByUuid(uuid))
      throw new ApiError(409, 'CFDI_ALREADY_IMPORTED');

    /* 5. Guardar archivo */
    const storedPath = await this.storage.save(Buffer.from(xml), `${uuid}.xml`);

    /* 6. Crear registro header */
    const emisor = comprobante['cfdi:Emisor'];
    const receptor = comprobante['cfdi:Receptor'];
    const header = Object.assign(new CfdiHeader(), {
      uuid,
      // Toma siempre el Rfc desde el nodo Emisor, y si no existe, usa el del timbre
      rfcEmisor:
        emisor?.['@_Rfc'] ??
        timbre?.['@_RfcProvCertif'] ??
        (() => {
          throw new ApiError(400, 'RFC_EMISOR_NOT_FOUND');
        })(),
      // Toma siempre el Rfc desde el nodo Receptor
      rfcReceptor:
        receptor?.['@_Rfc'] ??
        (() => {
          throw new ApiError(400, 'RFC_RECEPTOR_NOT_FOUND');
        })(),
      subTotal: parseFloat(comprobante['@_SubTotal']),
      descuento: parseFloat(comprobante['@_Descuento'] ?? '0'),
      total: parseFloat(comprobante['@_Total']),
      fecha: new Date(comprobante['@_Fecha']),
      moneda: comprobante['@_Moneda'],
      tipoCambio: parseFloat(comprobante['@_TipoCambio'] ?? '1'),
      formaPago: comprobante['@_FormaPago'],
      metodoPago: comprobante['@_MetodoPago'],
      lugarExpedicion: comprobante['@_LugarExpedicion'],
      xmlPath: storedPath,
      user: { id: dto.userId },
    });

    await this.repo.save(header);

    /* 7. Encolar para procesamiento detallado */
    await this.queue.addJob('process-cfdi', {
      cfdiId: header.id,
      path: storedPath,
      uuid: uuid,
    });

    return { id: header.id, uuid };
  }
}
