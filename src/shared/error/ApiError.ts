export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string, // p.ej. 'EMAIL_ALREADY_EXISTS'
    public details?: unknown, // opcional: info extra
  ) {
    super(code); // mensaje = code por defecto
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
