export interface IvaReportRow {
  UUID: string;
  Fecha: Date;
  RFC_Emisor: string;
  RFC_Receptor: string;
  Base: number;
  Tasa: number;
  IVA: number;
  TipoFactor: string;
  Tipo: 'acreditable' | 'trasladado';
}

export interface ReportsRepositoryPort {
  getIvaReport(dto: {
    tipo: 'emitidos' | 'recibidos';
    rfc: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<IvaReportRow[]>;
}
