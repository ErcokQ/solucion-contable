import { validateXML } from 'xsd-schema-validator';
import { ApiError } from '@shared/error/ApiError';
import path from 'node:path';
import { injectable } from 'tsyringe';
import { XmlValidatorPort } from '@cfdi/application/ports/xml-validator.port';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import crypto from 'node:crypto';

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
  // en runtime ya estamos en dist, así que resolvemos desde dist
  private readonly xsdPath: string = path.resolve(
    __dirname,
    '../../../../resources/esquemas/cfdi_4_0.xsd',
  );

  private readonly tmpDir: string = path.resolve(__dirname, '../../tmp');
  private readonly useRawXsd: boolean =
    process.env.XSD_USE_RAW === 'true' || false;

  private readonly fixedXsdPath: string;

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

    const shaOriginal = crypto
      .createHash('sha256')
      .update(original, 'utf8')
      .digest('hex');

    console.log('[XSD-CONSTRUCTOR] original SHA256:', shaOriginal);
    console.log(
      '[XSD-CONSTRUCTOR] XSD preview:',
      original.slice(0, 200).replace(/\r?\n/g, '\\n'),
    );

    // --- DEBUG: schemaLocations encontrados ---
    const schemaLocations = [
      ...original.matchAll(/schemaLocation="([^"]+)"/g),
    ].map((m) => m[1]);
    console.log('[XSD-CONSTRUCTOR] schemaLocations:', schemaLocations);

    let fixed = original;

    // Forzar que los imports del SAT usen rutas locales (por si quedan viejos)
    fixed = fixed.replace(
      /schemaLocation="http:\/\/www\.sat\.gob\.mx\/sitio_internet\/cfd\/catalogos\/catCFDI\.xsd"/,
      'schemaLocation="./catCFDI.xsd"',
    );

    fixed = fixed.replace(
      /schemaLocation="http:\/\/www\.sat\.gob\.mx\/sitio_internet\/cfd\/tipoDatos\/tdCFDI\.xsd"/,
      'schemaLocation="./tdCFDI.xsd"',
    );

    const shaFixed = crypto
      .createHash('sha256')
      .update(fixed, 'utf8')
      .digest('hex');

    console.log('[XSD-CONSTRUCTOR] fixed   SHA256:', shaFixed);
    console.log(
      '[XSD-CONSTRUCTOR] ¿cambió el XSD al “arreglarlo”?',
      shaOriginal !== shaFixed,
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

    // quitar BOM si viene
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

      if (!valid) {
        console.error('[XSD-VALIDATE] NO VÁLIDO, lanzando ApiError 400');
        throw new ApiError(400, 'INVALID_XML');
      }

      console.log('========== [XSD-VALIDATE FIN OK] ==========');
    } catch (error: unknown) {
      const err = error as XsdValidationError;

      console.error('[XSD RAW ERROR OBJ]', JSON.stringify(err, null, 2));

      console.error('[XSD VALIDATOR ERROR DETALLE]', {
        message: err.message,
        stack: err.stack,
        valid: err.valid,
        result: err.result,
        messages: err.messages,
      });

      console.log('========== [XSD-VALIDATE FIN ERROR] ==========');

      throw new ApiError(409, 'INVALID_XML');
    }
  }
}
