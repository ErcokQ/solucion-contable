// src/app/shared/pipes/money.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import {
  CurrencyPipe,
  registerLocaleData,
  getLocaleCurrencyCode,
} from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';

/* ------------------------------------------------------------------
 *  Registramos los datos de localización SOLO si aún no existen
 *  (Angular guarda internamente una tabla por locale).
 * -----------------------------------------------------------------*/
const LOCALE = 'es-MX';
try {
  getLocaleCurrencyCode(LOCALE);
} catch {
  registerLocaleData(localeEsMx, LOCALE);
}

@Pipe({
  name: 'money',
  standalone: true, // ✅  se importa directo en los componentes
})
export class MoneyPipe implements PipeTransform {
  private cp = new CurrencyPipe(LOCALE);

  /**
   * Formatea un número como moneda.
   * @param value   Número (o string numérico) a formatear.
   * @param code    Código ISO de moneda.  Default: 'MXN'.
   * @param digits  Formato de dígitos.     Default: '1.2-2'.
   */
  transform(
    value: unknown,
    code: string = 'MXN',
    digits: string = '1.2-2',
  ): string {
    const num = +value! || 0; // fuerza 0 si NaN / null / ''
    return this.cp.transform(num, code, 'symbol', digits) ?? '';
  }
}
