import { validateXML } from 'xsd-schema-validator';
import { ApiError } from '@shared/error/ApiError';
import path from 'node:path';
import { injectable } from 'tsyringe';
import { XmlValidatorPort } from '@cfdi/application/ports/xml-validator.port';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

@injectable()
export class XsdValidatorService implements XmlValidatorPort {
  private readonly xsdPath = path.resolve(
    __dirname,
    '../../../../resources/esquemas/cfdi_4_0.xsd',
  );

  private readonly tmpDir = path.resolve(__dirname, 'tmp');

  // XSD ya “arreglado” y listo para usar
  private readonly fixedXsdPath: string;

  constructor() {
    // 1) Asegurar carpeta tmp una sola vez
    if (!existsSync(this.tmpDir)) {
      mkdirSync(this.tmpDir, { recursive: true });
    }

    // 2) Leer XSD original una sola vez
    const original = readFileSync(this.xsdPath, 'utf8');

    // 3) Arreglar patterns una sola vez
    const fixed = original.replace(
      /(<xs:pattern[^>]*value=")([^"]*)(")/g,
      (_, open, inner, close) => {
        let escaped = inner.replace(/"/g, '&quot;');
        escaped = escaped.replace(/&(?![a-zA-Z]+;)/g, '&amp;');
        return open + escaped + close;
      },
    );

    // 4) Guardar XSD fijo
    this.fixedXsdPath = path.join(this.tmpDir, 'fixed-schema.xsd');
    writeFileSync(this.fixedXsdPath, fixed, 'utf8');
  }

  async validate(xml: string): Promise<void> {
    // quitar BOM si existe
    if (xml.charCodeAt(0) === 0xfeff) {
      xml = xml.slice(1);
    }

    try {
      const { valid } = await validateXML(xml, this.fixedXsdPath, {
        insecure: true,
      });

      if (!valid) {
        throw new ApiError(400, 'INVALID_XML');
      }
    } catch (e) {
      console.error('[XSD VALIDATOR ERROR]', e);
      throw new ApiError(409, 'INVALID_XML');
    }
  }
}
