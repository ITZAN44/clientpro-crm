import { Cliente, CreateClienteDto, UpdateClienteDto, ClientesResponse } from '@/types/cliente';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Esta función será llamada desde el componente que tiene acceso a la sesión
export async function getClientes(
  token: string,
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<ClientesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`${API_URL}/clientes?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener clientes');
  }

  return response.json();
}

export async function getCliente(token: string, id: string): Promise<Cliente> {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener cliente');
  }

  return response.json();
}

export async function createCliente(token: string, data: CreateClienteDto): Promise<Cliente> {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear cliente');
  }

  return response.json();
}

export async function updateCliente(token: string, id: string, data: UpdateClienteDto): Promise<Cliente> {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar cliente');
  }

  return response.json();
}

export async function deleteCliente(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar cliente');
  }
}
