export class AuthResponseDto {
  access_token: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    avatarUrl?: string;
  };
}
