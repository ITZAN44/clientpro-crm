export class ClienteResponseDto {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  puesto?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  sitioWeb?: string;
  notas?: string;
  propietarioId: string;
  propietario?: {
    id: string;
    nombre: string;
    email: string;
  };
  creadoEn: Date;
  actualizadoEn: Date;
}
