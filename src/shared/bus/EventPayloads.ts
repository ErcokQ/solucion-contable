/**
 * Esta interfaz define la estructura de los payloads de eventos
 * Usa la estructura comentada para definir los eventos que se pueden emitir
 */
export interface EventPayloads {
  /* ──────────── AUTH PAYLOADS ──────────── */
  /** Un usuario se registra (self-signup) o un admin lo crea */
  UserCreated: {
    userId: number;
    email: string;
    fullname: string;
    provider: 'local' | 'oauth';
    roles: string[];
  };

  /** El usuario solicitó reinicio de contraseña */
  PasswordResetRequested: {
    userId: number;
    email: string;
    token: string;
    expiresAt: Date;
  };
  /** Token validado y contraseña cambiada */
  PasswordChanged: {
    userId: number;
    method: 'reset' | 'manual';
  };
  /** Un rol fue asignado o revocado */
  RoleChanged: {
    userId: number;
    role: string;
    action: 'assigned' | 'revoked';
  };
  /* ──────────── CFDI PAYLOADS ──────────── */
  /** XML aceptado y guardado en carpeta de pendientes */
  CfdiUploaded: {
    filePath: string;
    uploaderId: number;
    rfcEmisor: string;
  };
  /** Empieza el parseo del XML */
  CfdiProcessingStarted: {
    uuid: string;
    filePath: string;
  };
  /** Parsing OK y datos persistidos en CFDI_HEADERS */
  CfdiProcessed: {
    uuid: string;
    rfcEmisor: string;
    rfcReceptor: string;
    fecha: Date;
    total: number;
    conceptos: number; // rows insertadas en CFDI_CONCEPTS
  };
  /** Error al procesar el XML */
  CfdiProcessingFailed: {
    filePath: string;
    reason: string;
    stack?: string;
  };
  /* ──────────── PAGOS (Complemento de Pagos) PAYLOADS ──────────── */
  /** Encabezado de pago insertado en PAYMENT_HEADERS  */
  PaymentRegistered: {
    paymentId: number;
    cfdiUuid: string;
    fechaPago: Date;
    monto: number;
  };

  /* ──────────── NÓMINA (Complemento de Nómina) PAYLOADS ──────────── */
  /** Recibo de nómina generado (PAYROLL_HEADERS)*/
  PayrollCreated: {
    payrollId: number;
    cfdiUuid: string;
    tipoNomina: string;
    fechaPago: Date;
    totalPercepciones: number;
    totalDeducciones: number;
  };
}
