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

  async validate(xml: string): Promise<void> {
    // Quitar BOM si existe
    if (xml.charCodeAt(0) === 0xfeff) xml = xml.slice(1);

    // Pre-procesado del XSD
    const original = readFileSync(this.xsdPath, 'utf8');

    // Asegura tmp dir
    if (!existsSync(this.tmpDir)) mkdirSync(this.tmpDir);

    // Reemplaza los patterns de value="…"
    const fixed = original.replace(
      /(<xs:pattern[^>]*value=")([^"]*)(")/g,
      (_, open, inner, close) => {
        // Primero escapamos comillas internas
        let escaped = inner.replace(/"/g, '&quot;');
        // Luego escapamos ampersands solos (que no formen parte de &xxx;)
        escaped = escaped.replace(/&(?![a-zA-Z]+;)/g, '&amp;');
        return open + escaped + close;
      },
    );

    // Escritura temporal
    const fixedXsd = path.join(this.tmpDir, `fixed-schema.xsd`);
    writeFileSync(fixedXsd, fixed, 'utf8');

    try {
      const { valid } = await validateXML(xml, fixedXsd, {
        insecure: true,
      });
      if (!valid) throw new ApiError(400, 'INVALID_XML');
    } catch (e) {
      console.error(e);
      throw new ApiError(409, 'INVALID_XML');
    }
  }
}
