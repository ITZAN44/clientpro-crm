# 🏗️ Backend Module Skill (NestJS)

> **Propósito**: Generar un módulo completo de NestJS siguiendo los patrones establecidos del proyecto.
> **Basado en**: `AGENTS.md` + estructura de módulos existentes (clientes, negocios, actividades)

---

## 📋 ¿Cuándo usar este Skill?

Invoca este skill cuando:
- Necesites crear un nuevo módulo backend completo
- Quieras scaffold de Controller + Service + Module + DTOs
- Debas seguir el patrón establecido del proyecto
- Necesites CRUD completo para una nueva entidad

**Comando de invocación**: `/new-backend-module [nombre]` o "crear módulo NestJS de [entidad]"

**Ejemplo**: `/new-backend-module tareas` → Genera módulo completo de Tareas

---

## 🎯 Input Requerido

### **Información Básica:**
```typescript
{
  moduleName: string;        // Nombre del módulo (plural): "tareas", "productos"
  entityName: string;        // Nombre de la entidad (singular): "tarea", "producto"
  description: string;       // Descripción breve: "Gestión de tareas del CRM"
}
```

### **Propiedades del Modelo (Prisma):**
```typescript
{
  id: number;                // Siempre presente (auto)
  // ... propiedades específicas del modelo
  createdAt: Date;           // Siempre presente (auto)
  updatedAt: Date;           // Siempre presente (auto)
}
```

**Ejemplo para "Tareas":**
```typescript
model Tarea {
  id          Int      @id @default(autoincrement())
  titulo      String
  descripcion String?
  prioridad   PrioridadTarea
  estado      EstadoTarea @default(PENDIENTE)
  fechaVencimiento DateTime?
  usuarioId   Int
  clienteId   Int?
  usuario     Usuario  @relation(fields: [usuarioId], references: [id])
  cliente     Cliente? @relation(fields: [clienteId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum PrioridadTarea {
  BAJA
  MEDIA
  ALTA
  URGENTE
}

enum EstadoTarea {
  PENDIENTE
  EN_PROGRESO
  COMPLETADA
  CANCELADA
}
```

---

## 🛠️ Workflow del Skill

### **PASO 1: Crear Modelo en Prisma Schema**

**Archivo**: `backend/prisma/schema.prisma`

**Acción**:
1. Agregar el modelo al schema
2. Agregar enums si son necesarios
3. Definir relaciones con otros modelos

**Template**:
```prisma
model [EntityName] {
  id          Int      @id @default(autoincrement())
  [propiedades específicas]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  [relaciones con otros modelos]
}

// Enums si son necesarios
enum [EnumName] {
  VALOR1
  VALOR2
  VALOR3
}
```

**Después de modificar schema**:
```bash
cd backend
npx prisma generate          # Genera tipos TypeScript
npx prisma migrate dev       # Crea migración (solo si DB conectada)
```

---

### **PASO 2: Crear Estructura de Carpetas**

**Ubicación**: `backend/src/[module-name]/`

**Estructura a crear**:
```
backend/src/[module-name]/
├── dto/
│   ├── create-[entity].dto.ts
│   ├── update-[entity].dto.ts
│   ├── query-[entity].dto.ts
│   └── [entity]-response.dto.ts
├── [module-name].controller.ts
├── [module-name].service.ts
└── [module-name].module.ts
```

**Comando**:
```bash
mkdir -p backend/src/[module-name]/dto
```

---

### **PASO 3: Crear DTOs**

#### **a) create-[entity].dto.ts**

**Propósito**: Validación al crear nueva entidad

**Template**:
```typescript
// backend/src/[module-name]/dto/create-[entity].dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { [EnumName] } from '@prisma/client';

export class Create[EntityName]Dto {
  @IsString()
  @IsNotEmpty()
  [campo1]: string;

  @IsString()
  @IsOptional()
  [campo2]?: string;

  @IsEnum([EnumName])
  [campoEnum]: [EnumName];

  @IsInt()
  [relacionId]: number;

  @IsOptional()
  @IsDateString()
  [campoFecha]?: string;
}
```

**Ejemplo real (Tareas)**:
```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { PrioridadTarea, EstadoTarea } from '@prisma/client';

export class CreateTareaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(PrioridadTarea)
  prioridad: PrioridadTarea;

  @IsEnum(EstadoTarea)
  @IsOptional()
  estado?: EstadoTarea;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsInt()
  usuarioId: number;

  @IsInt()
  @IsOptional()
  clienteId?: number;
}
```

---

#### **b) update-[entity].dto.ts**

**Propósito**: Validación al actualizar entidad (todos los campos opcionales)

**Template**:
```typescript
// backend/src/[module-name]/dto/update-[entity].dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { Create[EntityName]Dto } from './create-[entity].dto';

export class Update[EntityName]Dto extends PartialType(Create[EntityName]Dto) {}
```

---

#### **c) query-[entity].dto.ts**

**Propósito**: Parámetros de búsqueda/filtrado

**Template**:
```typescript
// backend/src/[module-name]/dto/query-[entity].dto.ts
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { [EnumName] } from '@prisma/client';

export class Query[EntityName]Dto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum([EnumName])
  [filtroEnum]?: [EnumName];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  [filtroRelacion]?: number;
}
```

**Ejemplo real (Tareas)**:
```typescript
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoTarea, PrioridadTarea } from '@prisma/client';

export class QueryTareaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(EstadoTarea)
  estado?: EstadoTarea;

  @IsOptional()
  @IsEnum(PrioridadTarea)
  prioridad?: PrioridadTarea;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  usuarioId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  clienteId?: number;
}
```

---

#### **d) [entity]-response.dto.ts**

**Propósito**: Definir estructura de respuesta (con relaciones incluidas)

**Template**:
```typescript
// backend/src/[module-name]/dto/[entity]-response.dto.ts
import { [EntityName], [RelatedEntity] } from '@prisma/client';

export class [EntityName]ResponseDto implements [EntityName] {
  id: number;
  [campo1]: string;
  [campo2]: string | null;
  [campoEnum]: [EnumName];
  [relacionId]: number;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones (opcional)
  [relacion]?: [RelatedEntity];
}
```

---

### **PASO 4: Crear Service**

**Archivo**: `backend/src/[module-name]/[module-name].service.ts`

**Template completo**:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Create[EntityName]Dto } from './dto/create-[entity].dto';
import { Update[EntityName]Dto } from './dto/update-[entity].dto';
import { Query[EntityName]Dto } from './dto/query-[entity].dto';
import { [EntityName]ResponseDto } from './dto/[entity]-response.dto';

@Injectable()
export class [ModuleName]Service {
  constructor(private prisma: PrismaService) {}

  async create(createDto: Create[EntityName]Dto): Promise<[EntityName]ResponseDto> {
    return this.prisma.[entityName].create({
      data: createDto,
      include: {
        // Incluir relaciones si es necesario
        [relacion]: true,
      },
    });
  }

  async findAll(query: Query[EntityName]Dto): Promise<[EntityName]ResponseDto[]> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    return this.prisma.[entityName].findMany({
      skip,
      take: limit,
      where: filters,
      include: {
        [relacion]: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<[EntityName]ResponseDto> {
    const entity = await this.prisma.[entityName].findUnique({
      where: { id },
      include: {
        [relacion]: true,
      },
    });

    if (!entity) {
      throw new NotFoundException(`[EntityName] con id ${id} no encontrado`);
    }

    return entity;
  }

  async update(id: number, updateDto: Update[EntityName]Dto): Promise<[EntityName]ResponseDto> {
    await this.findOne(id); // Valida que existe

    return this.prisma.[entityName].update({
      where: { id },
      data: updateDto,
      include: {
        [relacion]: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Valida que existe
    await this.prisma.[entityName].delete({ where: { id } });
  }
}
```

---

### **PASO 5: Crear Controller**

**Archivo**: `backend/src/[module-name]/[module-name].controller.ts`

**Template completo**:
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { [ModuleName]Service } from './[module-name].service';
import { Create[EntityName]Dto } from './dto/create-[entity].dto';
import { Update[EntityName]Dto } from './dto/update-[entity].dto';
import { Query[EntityName]Dto } from './dto/query-[entity].dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('[module-name]')
@UseGuards(JwtAuthGuard)
export class [ModuleName]Controller {
  constructor(private readonly service: [ModuleName]Service) {}

  @Post()
  create(@Body() createDto: Create[EntityName]Dto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query() query: Query[EntityName]Dto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Update[EntityName]Dto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

---

### **PASO 6: Crear Module**

**Archivo**: `backend/src/[module-name]/[module-name].module.ts`

**Template**:
```typescript
import { Module } from '@nestjs/common';
import { [ModuleName]Service } from './[module-name].service';
import { [ModuleName]Controller } from './[module-name].controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [[ModuleName]Controller],
  providers: [[ModuleName]Service],
  exports: [[ModuleName]Service], // Exportar si otros módulos lo necesitan
})
export class [ModuleName]Module {}
```

---

### **PASO 7: Registrar en App Module**

**Archivo**: `backend/src/app.module.ts`

**Acción**: Agregar el nuevo módulo a imports

```typescript
import { [ModuleName]Module } from './[module-name]/[module-name].module';

@Module({
  imports: [
    // ... otros módulos
    [ModuleName]Module, // ← AGREGAR AQUÍ
  ],
})
export class AppModule {}
```

---

## ✅ Validación del Módulo

### **Checklist de Validación:**

#### **1. Prisma**
- [ ] Modelo agregado a `schema.prisma`
- [ ] Enums agregados (si aplica)
- [ ] Relaciones definidas correctamente
- [ ] `npx prisma generate` ejecutado sin errores
- [ ] Migración creada (si DB conectada)

#### **2. Estructura de Archivos**
- [ ] Carpeta `backend/src/[module-name]/` creada
- [ ] Subcarpeta `dto/` creada
- [ ] 4 DTOs creados (create, update, query, response)
- [ ] Service creado
- [ ] Controller creado
- [ ] Module creado

#### **3. Compilación**
- [ ] **Ejecutar `get_errors`** para validar TypeScript
- [ ] 0 errores de importación
- [ ] 0 errores de tipos
- [ ] Todos los decoradores correctos

#### **4. Testing Manual**
- [ ] Backend compila sin errores (`npm run start:dev`)
- [ ] Módulo registrado en `app.module.ts`
- [ ] Endpoints accesibles:
  - `POST /[module-name]` - Crear
  - `GET /[module-name]` - Listar
  - `GET /[module-name]/:id` - Obtener uno
  - `PATCH /[module-name]/:id` - Actualizar
  - `DELETE /[module-name]/:id` - Eliminar

#### **5. Testing con Cliente REST**
```powershell
# Crear entidad
Invoke-RestMethod -Uri "http://localhost:4000/[module-name]" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{ "campo1": "valor" }'

# Listar entidades
Invoke-RestMethod -Uri "http://localhost:4000/[module-name]" `
  -Headers @{ Authorization = "Bearer $token" }

# Obtener una entidad
Invoke-RestMethod -Uri "http://localhost:4000/[module-name]/1" `
  -Headers @{ Authorization = "Bearer $token" }
```

---

## 📊 Output Esperado

**Al completar este skill, debes tener:**

1. ✅ **7 archivos nuevos creados**:
   - `prisma/schema.prisma` (modificado)
   - `src/[module]/dto/create-[entity].dto.ts`
   - `src/[module]/dto/update-[entity].dto.ts`
   - `src/[module]/dto/query-[entity].dto.ts`
   - `src/[module]/dto/[entity]-response.dto.ts`
   - `src/[module]/[module].service.ts`
   - `src/[module]/[module].controller.ts`
   - `src/[module]/[module].module.ts`

2. ✅ **1 archivo modificado**:
   - `src/app.module.ts` (registro del módulo)

3. ✅ **Validación exitosa**:
   - Compilación sin errores (`get_errors`)
   - 5 endpoints funcionando
   - CRUD completo validado

---

## 🔗 Referencias

- **Patrón base**: Módulos existentes (`clientes`, `negocios`, `actividades`)
- **Documentación**: `AGENTS.md` sección "Module Structure Pattern"
- **Convenciones**: `AGENTS.md` sección "Naming Conventions"

---

## 🎓 Tips y Best Practices

1. **Nombres en plural** para módulos/controllers (`tareas`, `productos`)
2. **Nombres en singular** para entidades/DTOs (`Tarea`, `Producto`)
3. **Siempre usar `get_errors`** después de crear archivos
4. **Incluir relaciones** en `findAll()` y `findOne()`
5. **Validar existencia** antes de update/delete (usar `findOne()`)
6. **Exportar service** si otros módulos lo necesitarán

---

**Última actualización**: 30 Enero 2026  
**Versión**: 1.0.0  
**Autor**: ClientPro CRM Team
