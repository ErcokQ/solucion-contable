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

  // ahora el “tmp” es el MISMO directorio del XSD original
  private readonly xsdDir: string = path.dirname(this.xsdPath);

  private readonly fixedXsdPath: string;

  constructor() {
    console.log('[XSD-CONSTRUCTOR] __dirname:', __dirname);
    console.log('[XSD-CONSTRUCTOR] xsdPath esperado:', this.xsdPath);
    console.log('[XSD-CONSTRUCTOR] xsdDir:', this.xsdDir);

    if (!existsSync(this.xsdDir)) {
      // en teoría siempre existe, pero por si acaso
      mkdirSync(this.xsdDir, { recursive: true });
      console.log('[XSD-CONSTRUCTOR] xsdDir creado');
    }

    const original: string = readFileSync(this.xsdPath, 'utf8');
    console.log(
      '[XSD-CONSTRUCTOR] XSD original leído. Longitud:',
      original.length,
    );

    const fixed: string = original.replace(
      /(<xs:pattern[^>]*value=")([^"]*)(")/g,
      (_match: string, open: string, inner: string, close: string): string => {
        let escaped: string = inner.replace(/"/g, '&quot;');
        escaped = escaped.replace(/&(?![a-zA-Z]+;)/g, '&amp;');
        return open + escaped + close;
      },
    );

    // 🔴 OJO: ahora el XSD arreglado queda en el MISMO directorio
    this.fixedXsdPath = path.join(this.xsdDir, 'cfdi_4_0.fixed.xsd');
    writeFileSync(this.fixedXsdPath, fixed, 'utf8');

    console.log(
      '[XSD-CONSTRUCTOR] XSD reparado guardado en:',
      this.fixedXsdPath,
    );
  }

  async validate(xml: string): Promise<void> {
    let xmlToValidate: string = xml;

    if (xmlToValidate.length > 0 && xmlToValidate.charCodeAt(0) === 0xfeff) {
      xmlToValidate = xmlToValidate.slice(1);
    }

    console.log('[XSD-VALIDATE] Inicio validación XML', {
      xsdPath: this.fixedXsdPath,
      xmlLength: xmlToValidate.length,
      xmlPreview: xmlToValidate.slice(0, 200),
    });

    try {
      const rawResult = await validateXML(xmlToValidate, this.fixedXsdPath, {
        insecure: true,
      });

      const result = rawResult as XsdValidationResult;

      console.log('[XSD-VALIDATE] Resultado validator:', result);

      if (!result.valid) {
        console.warn('[XSD-VALIDATE] XML marcado como inválido por XSD', {
          result: result.result,
          messages: result.messages,
        });
        throw new ApiError(400, 'INVALID_XML');
      }
    } catch (error: unknown) {
      const err = error as XsdValidationError;

      console.error('[XSD VALIDATOR ERROR DETALLE]', {
        message: err.message,
        stack: err.stack,
        valid: err.valid,
        result: err.result,
        messages: err.messages,
      });

      throw new ApiError(409, 'INVALID_XML');
    }
  }
}
