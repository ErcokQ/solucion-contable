import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';

/**
 * Datos que el front necesita para cada fila de la lista CFDI.
 * - todas las columnas de CfdiHeader
 * - más los UUID de relación (pueden ser null)
 */
export interface CfdiRow extends CfdiHeader {
  uuidSustituto: string | null;
  uuidSustituido: string | null;
}
