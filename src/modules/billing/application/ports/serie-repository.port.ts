// modules/billing/application/ports/serie-repository.port.ts
import { BillingSerie } from '@billing/domain/entities/billing-serie.entity';

export interface SerieRepositoryPort {
  nextFolio(serieId: number): Promise<{ serie: BillingSerie; folio: string }>;
}
