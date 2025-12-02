import { validateXML } from 'xsd-schema-validator';
import { ApiError } from '@shared/error/ApiError';
import path from 'node:path';
import { injectable } from 'tsyringe';
import { XmlValidatorPort } from '@cfdi/application/ports/xml-validator.port';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
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
  // En runtime (__dirname) estamos en:
  //  - src/modules/cfdi/infrastructure/services   (dev con ts-node-dev)
  //  - dist/modules/cfdi/infrastructure/services  (build)
  // Con este resolve llegamos a:
  //  - src/resources/esquemas/cfdi_4_0.xsd
  //  - dist/resources/esquemas/cfdi_4_0.xsd
  private readonly xsdPath: string = path.resolve(
    __dirname,
    '../../../../resources/esquemas/cfdi_4_0.xsd',
  );

  // Directorio raíz de esquemas (aquí están cfdi_4_0.xsd y complementos/)
  private readonly xsdDir: string = path.dirname(this.xsdPath);

  // Permite forzar el uso del XSD tal cual (sin "fix") si se pone XSD_USE_RAW=true
  private readonly useRawXsd: boolean =
    process.env.XSD_USE_RAW === 'true' || false;

  private readonly fixedXsdPath: string;

  constructor() {
    console.log('========== [XSD-CONSTRUCTOR INICIO] ==========');
    console.log('[XSD-CONSTRUCTOR] __dirname:', __dirname);
    console.log('[XSD-CONSTRUCTOR] xsdPath:', this.xsdPath);
    console.log('[XSD-CONSTRUCTOR] xsdDir:', this.xsdDir);
    console.log('[XSD-CONSTRUCTOR] XSD_USE_RAW:', this.useRawXsd);

    if (!existsSync(this.xsdPath)) {
      console.error(
        '[XSD-CONSTRUCTOR] ERROR: xsdPath no existe:',
        this.xsdPath,
      );
    }

    // 1) Arreglamos TODOS los .xsd del directorio de esquemas (incluye complementos/)
    console.log(
      '[XSD-CONSTRUCTOR] Iniciando fix recursivo de .xsd en:',
      this.xsdDir,
    );
    this.fixAllXsds(this.xsdDir);
    console.log('[XSD-CONSTRUCTOR] Fix recursivo de .xsd terminado');

    // 2) Leemos el principal (ya arreglado) sólo para loguear y hacer una copia fija
    const original: string = readFileSync(this.xsdPath, 'utf8');
    console.log(
      '[XSD-CONSTRUCTOR] XSD principal leído. Longitud:',
      original.length,
    );

    const shaOriginal = crypto
      .createHash('sha256')
      .update(original, 'utf8')
      .digest('hex');

    console.log('[XSD-CONSTRUCTOR] SHA256 principal:', shaOriginal);
    console.log(
      '[XSD-CONSTRUCTOR] Preview principal:',
      original.slice(0, 200).replace(/\r?\n/g, '\\n'),
    );

    const schemaLocations = [
      ...original.matchAll(/schemaLocation="([^"]+)"/g),
    ].map((m) => m[1]);
    console.log(
      '[XSD-CONSTRUCTOR] schemaLocations principales:',
      schemaLocations,
    );

    // Por simplicidad, la "versión fija" del principal es igual al archivo actual
    const fixed = original;

    this.fixedXsdPath = path.join(this.xsdDir, 'fixed-schema.xsd');
    writeFileSync(this.fixedXsdPath, fixed, 'utf8');

    console.log(
      '[XSD-CONSTRUCTOR] fixed-schema.xsd guardado en:',
      this.fixedXsdPath,
      'longitud:',
      fixed.length,
    );
    console.log('========== [XSD-CONSTRUCTOR FIN] ==========');
  }

  /**
   * Recorre recursivamente un directorio y aplica fixXsPatterns
   * a todos los archivos .xsd que encuentre.
   */
  private fixAllXsds(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.fixAllXsds(fullPath);
        continue;
      }

      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.xsd')) {
        continue;
      }

      const original = readFileSync(fullPath, 'utf8');
      const shaBefore = crypto
        .createHash('sha256')
        .update(original, 'utf8')
        .digest('hex');

      const { fixed, replacements } = this.fixXsPatterns(original);

      const shaAfter = crypto
        .createHash('sha256')
        .update(fixed, 'utf8')
        .digest('hex');

      if (shaBefore !== shaAfter) {
        writeFileSync(fullPath, fixed, 'utf8');
        console.log(
          `[XSD-FIX] Archivo modificado: ${fullPath}\n` +
            `  patterns reparados: ${replacements}\n` +
            `  SHA antes: ${shaBefore}\n` +
            `  SHA después: ${shaAfter}`,
        );
      } else {
        if (replacements > 0) {
          console.log(
            `[XSD-FIX] Archivo sin cambios efectivos (patrones ya OK): ${fullPath} (patterns encontrados: ${replacements})`,
          );
        } else {
          console.log(`[XSD-FIX] Archivo sin xs:pattern: ${fullPath}`);
        }
      }
    }
  }

  /**
   * Arregla los <xs:pattern ... value="..."> que traen caracteres
   * que a Xerces no le gustan (como '<', '&' sueltos o comillas dobles).
   */
  private fixXsPatterns(xsd: string): { fixed: string; replacements: number } {
    let replacements = 0;

    const fixed = xsd.replace(
      /(<xs:pattern\b[^>]*\svalue=")([^"]*)(")/g,
      (_match, open, inner, close) => {
        replacements++;

        let escaped = inner;

        // Escapar comillas dentro del value (deben ser &quot;)
        escaped = escaped.replace(/"/g, '&quot;');

        // Escapar '&' que no sean entidades (&algo;)
        escaped = escaped.replace(/&(?![a-zA-Z]+;)/g, '&amp;');

        // Escapar '<' que estén en el value
        escaped = escaped.replace(/</g, '&lt;');

        return open + escaped + close;
      },
    );

    return { fixed, replacements };
  }

  async validate(xml: string): Promise<void> {
    let xmlToValidate: string = xml;

    // Quitar BOM si viene
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
