import 'node-stream-zip';

declare module 'node-stream-zip' {
  // Le añadimos a la interfaz oficial esta propiedad opcional
  interface StreamZipOptions {
    buffer?: Buffer;
  }
}
