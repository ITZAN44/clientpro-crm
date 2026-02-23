# 🔧 ClientPro CRM - Backend API

API REST construida con NestJS y Prisma ORM.

**Estado actual**: ✅ Base de datos conectada, Prisma Client generado, listo para desarrollo de módulos

## 📦 Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma 7.2.0 (con @prisma/adapter-pg)
- **Database**: PostgreSQL - clientpro_crm ✅ ACTIVA
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Configuration**: @nestjs/config

## 📁 Estructura

```
backend/
├── src/
│   ├── auth/              # Módulo de autenticación
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── dto/           # DTOs de autenticación
│   ├── usuarios/          # Módulo de usuarios
│   │   ├── usuarios.controller.ts
│   │   ├── usuarios.service.ts
│   │   ├── usuarios.module.ts
│   │   └── dto/
│   ├── clientes/          # Módulo de clientes
│   ├── negocios/          # Módulo de negocios (deals)
│   ├── actividades/       # Módulo de actividades
│   ├── notificaciones/    # Módulo de notificaciones
│   ├── prisma/            # Servicio Prisma ✅ CREADO
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts      # Módulo raíz
│   └── main.ts            # Entry point
├── prisma/
│   ├── schema.prisma      # Schema en español ✅ ACTUALIZADO
│   └── migrations/        # Migraciones
├── test/                  # Tests e2e
├── .env                   # Variables de entorno
├── .env.example           # Template
└── nest-cli.json          # Configuración NestJS
```

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev        # Hot reload en http://localhost:4000

# Producción
npm run build            # Build
npm run start:prod       # Servidor producción

# Prisma
npx prisma generate      # Generar cliente
npx prisma migrate dev   # Crear migración
npx prisma studio        # UI para ver DB

# Tests
npm run test             # Unit tests
npm run test:e2e         # E2E tests
```

## 🗄️ Base de Datos

**Estado**: ✅ Base de datos clientpro_crm activa con datos de prueba
- 7 usuarios, 6 clientes, 6 negocios ($1,085,000 MXN en pipeline)
- Schema en español (equipos, usuarios, clientes, negocios, actividades, emails, notas, notificaciones)
- Prisma Client generado y conectado

### Ver datos con Prisma Studio

```bash
npx prisma studio
```

### Sincronizar con base de datos existente

Si modificas la base de datos directamente:

```bash
npx prisma db pull    # Leer el schema de la DB
npx prisma generate   # Regenerar el cliente
```

### Crear migración (si modificas schema.prisma)

```bash
npx prisma migrate dev --name nombre_migracion
```

## 🔐 Autenticación

JWT con Passport:
- `/auth/login` - Login (POST)
- `/auth/register` - Registro (POST)
- Headers protegidos: `Authorization: Bearer <token>`

## 📡 Endpoints (Ejemplo)

```typescript
// Públicos
POST   /auth/login
POST   /auth/register

// Protegidos (requieren JWT)
GET    /usuarios/me
GET    /clientes
POST   /clientes
GET    /clientes/:id
PUT    /clientes/:id
DELETE /clientes/:id

GET    /negocios
POST   /negocios
GET    /negocios/:id
PUT    /negocios/:id

GET    /actividades
POST   /actividades
PUT    /actividades/:id
```

## 🛠️ Desarrollo

### Crear un nuevo módulo

```bash
nest generate module nombre
nest generate controller nombre
nest generate service nombre
```

### Ejemplo de DTO

```typescript
// src/clientes/dto/crear-cliente.dto.ts
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CrearClienteDto {
  @IsString()
  nombre: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  empresa?: string;
}
```

## 📝 Prisma Client

```typescript
// Usar en servicios
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cliente.findMany({
      include: {
        propietario: true,
        negocios: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.cliente.findUnique({
      where: { id },
      include: {
        propietario: { select: { nombre: true, email: true } },
        negocios: { where: { etapa: 'GANADO' } },
        actividades: { where: { completada: false } },
      },
    });
  }
}
```

## 🔧 Variables de Entorno

Ver `.env.example` para la configuración completa.

Importante:
- `DATABASE_URL`: Conexión a PostgreSQL
- `JWT_SECRET`: Secret para tokens
- `PORT`: Puerto del servidor (default: 4000)
