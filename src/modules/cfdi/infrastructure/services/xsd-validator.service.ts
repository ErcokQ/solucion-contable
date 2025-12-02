import { validateXML } from 'xsd-schema-validator';
import { ApiError } from '@shared/error/ApiError';
import path from 'node:path';
import crypto from 'node:crypto';
import { injectable } from 'tsyringe';
import { XmlValidatorPort } from '@cfdi/application/ports/xml-validator.port';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

interface XsdValidationResult {
  valid: boolean;
  result?: unknown;
  messages?: unknown;
}

interface XsdValidationError extends Error {
  valid?: boolean;
  result?: unknown;
  messages?: unknown;
}

@injectable()
export class XsdValidatorService implements XmlValidatorPort {
  private readonly xsdPath: string = path.resolve(
    __dirname,
    '../../../../resources/esquemas/cfdi_4_0.xsd',
  );

  // que quede en modules/cfdi/tmp (dev y prod)
  private readonly tmpDir: string = path.resolve(__dirname, '../../tmp');

  private readonly fixedXsdPath: string;

  // toggle para probar XSD crudo vs XSD reparado
  private readonly useRawXsd: boolean = process.env.XSD_USE_RAW === '1';

  constructor() {
    console.log('========== [XSD-CONSTRUCTOR INICIO] ==========');
    console.log('[XSD-CONSTRUCTOR] __dirname:', __dirname);
    console.log('[XSD-CONSTRUCTOR] xsdPath:', this.xsdPath);
    console.log('[XSD-CONSTRUCTOR] tmpDir:', this.tmpDir);
    console.log('[XSD-CONSTRUCTOR] XSD_USE_RAW:', this.useRawXsd);

    if (!existsSync(this.tmpDir)) {
      mkdirSync(this.tmpDir, { recursive: true });
      console.log('[XSD-CONSTRUCTOR] tmpDir creado');
    } else {
      console.log('[XSD-CONSTRUCTOR] tmpDir ya existía');
    }

    const original: string = readFileSync(this.xsdPath, 'utf8');
    console.log(
      '[XSD-CONSTRUCTOR] XSD original leído. Longitud:',
      original.length,
    );

    // Hash del XSD original para comparar entre entornos
    const originalHash = crypto
      .createHash('sha256')
      .update(original, 'utf8')
      .digest('hex');

    console.log('[XSD-CONSTRUCTOR] original SHA256:', originalHash);

    // preview para ver que sea el XSD correcto
    console.log('[XSD-CONSTRUCTOR] XSD preview:', original.slice(0, 200));

    // "Reparar" patterns problemáticos
    const fixed: string = original.replace(
      /(<xs:pattern[^>]*value=")([^"]*)(")/g,
      (_match: string, open: string, inner: string, close: string): string => {
        let escaped: string = inner.replace(/"/g, '&quot;');
        escaped = escaped.replace(/&(?![a-zA-Z]+;)/g, '&amp;');
        return open + escaped + close;
      },
    );

    const fixedHash = crypto
      .createHash('sha256')
      .update(fixed, 'utf8')
      .digest('hex');

    console.log('[XSD-CONSTRUCTOR] fixed   SHA256:', fixedHash);
    console.log(
      '[XSD-CONSTRUCTOR] ¿cambió el XSD al “arreglarlo”?',
      original !== fixed,
    );

    this.fixedXsdPath = path.join(this.tmpDir, 'fixed-schema.xsd');
    writeFileSync(this.fixedXsdPath, fixed, 'utf8');

    console.log(
      '[XSD-CONSTRUCTOR] XSD reparado guardado en:',
      this.fixedXsdPath,
      'longitud:',
      fixed.length,
    );
    console.log('========== [XSD-CONSTRUCTOR FIN] ==========');
  }

  async validate(xml: string): Promise<void> {
    let xmlToValidate: string = xml;

    // quitar BOM si llega
    if (xmlToValidate.length > 0 && xmlToValidate.charCodeAt(0) === 0xfeff) {
      xmlToValidate = xmlToValidate.slice(1);
    }

    const schemaPath = this.useRawXsd ? this.xsdPath : this.fixedXsdPath;

    console.log('========== [XSD-VALIDATE INICIO] ==========');
    console.log('[XSD-VALIDATE] Config:', {
      useRawXsd: this.useRawXsd,
      schemaPath,
    });
    console.log('[XSD-VALIDATE] Datos XML:', {
      xmlLength: xmlToValidate.length,
      xmlHead: xmlToValidate.slice(0, 200),
      xmlTail: xmlToValidate.slice(-200),
    });

    try {
      const result = (await validateXML(xmlToValidate, schemaPath, {
        insecure: true,
      })) as XsdValidationResult;

      const { valid, result: status, messages } = result;

      console.log('[XSD-VALIDATE RESULT]', {
        valid,
        status,
        messages,
      });

      console.log('========== [XSD-VALIDATE FIN OK] ==========');

      if (!valid) {
        throw new ApiError(400, 'INVALID_XML');
      }
    } catch (error: unknown) {
      const err = error as XsdValidationError;

      // log crudo del error que viene del validador / Java
      try {
        console.error(
          '[XSD RAW ERROR OBJ]',
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
        );
      } catch {
        console.error('[XSD RAW ERROR OBJ] no serializable');
      }

      console.error('[XSD VALIDATOR ERROR DETALLE]', {
        message: err.message,
        stack: err.stack,
        valid: err.valid,
        result: err.result,
        messages: err.messages,
      });

      console.error('========== [XSD-VALIDATE FIN ERROR] ==========');

      throw new ApiError(409, 'INVALID_XML');
    }
  }
}
