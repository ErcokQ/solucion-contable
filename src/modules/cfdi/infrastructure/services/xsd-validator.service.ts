import { validateXML } from 'xsd-schema-validator';
import { ApiError } from '@shared/error/ApiError';
import path from 'node:path';
import { injectable } from 'tsyringe';
import { XmlValidatorPort } from '@cfdi/application/ports/xml-validator.port';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

interface XsdValidationResult {
  valid: boolean;
  result?: unknown;
  messages?: unknown;
}

@injectable()
export class XsdValidatorService implements XmlValidatorPort {
  private readonly xsdPath: string = path.resolve(
    __dirname,
    '../../../../resources/esquemas/cfdi_4_0.xsd',
  );

  // ahora el tmp queda en modules/cfdi/tmp (en dev y prod)
  private readonly tmpDir: string = path.resolve(__dirname, '../../tmp');

  private readonly fixedXsdPath: string;

  constructor() {
    if (!existsSync(this.tmpDir)) {
      mkdirSync(this.tmpDir, { recursive: true });
    }

    const original: string = readFileSync(this.xsdPath, 'utf8');

    const fixed: string = original.replace(
      /(<xs:pattern[^>]*value=")([^"]*)(")/g,
      (_match: string, open: string, inner: string, close: string): string => {
        let escaped: string = inner.replace(/"/g, '&quot;');
        escaped = escaped.replace(/&(?![a-zA-Z]+;)/g, '&amp;');
        return open + escaped + close;
      },
    );

    this.fixedXsdPath = path.join(this.tmpDir, 'fixed-schema.xsd');
    writeFileSync(this.fixedXsdPath, fixed, 'utf8');
  }

  async validate(xml: string): Promise<void> {
    let xmlToValidate: string = xml;

    // quitar BOM si existe
    if (xmlToValidate.length > 0 && xmlToValidate.charCodeAt(0) === 0xfeff) {
      xmlToValidate = xmlToValidate.slice(1);
    }

    try {
      const result = (await validateXML(xmlToValidate, this.fixedXsdPath, {
        insecure: true,
      })) as XsdValidationResult;

      const { valid, result: status, messages } = result;

      console.log('[XSD-VALIDATE RESULT]', {
        valid,
        status,
        messages,
      });

      if (!valid) {
        throw new ApiError(400, 'INVALID_XML');
      }
    } catch (error) {
      console.error('[XSD VALIDATOR ERROR]', error);
      throw new ApiError(409, 'INVALID_XML');
    }
  }
}
