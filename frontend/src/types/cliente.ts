export interface Cliente {
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
  propietario: {
    id: string;
    nombre: string;
    email: string;
  };
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateClienteDto {
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
  propietarioId?: string;
}

export interface UpdateClienteDto {
  nombre?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  puesto?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  sitioWeb?: string;
  notas?: string;
  propietarioId?: string;
}

export interface ClientesResponse {
  data: Cliente[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
