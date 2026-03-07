-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('ADMIN', 'MANAGER', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "etapa_negocio" AS ENUM ('PROSPECTO', 'CONTACTO_REALIZADO', 'PROPUESTA', 'NEGOCIACION', 'GANADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "tipo_actividad" AS ENUM ('LLAMADA', 'EMAIL', 'REUNION', 'TAREA');

-- CreateEnum
CREATE TYPE "tipo_notificacion" AS ENUM ('NEGOCIO_ASIGNADO', 'TAREA_VENCIMIENTO', 'NEGOCIO_GANADO', 'NEGOCIO_PERDIDO', 'CLIENTE_ASIGNADO', 'MENCION', 'ACTIVIDAD_ASIGNADA', 'NEGOCIO_ACTUALIZADO', 'ACTIVIDAD_VENCIDA', 'ACTIVIDAD_COMPLETADA', 'CLIENTE_NUEVO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "tipo_moneda" AS ENUM ('MXN', 'USD', 'EUR');

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "avatar_url" TEXT,
    "rol" "rol_usuario" NOT NULL DEFAULT 'VENDEDOR',
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login" TIMESTAMP(3),
    "equipo_id" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "empresa" TEXT,
    "puesto" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "sitio_web" TEXT,
    "notas" TEXT,
    "propietario_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negocios" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "moneda" "tipo_moneda" NOT NULL DEFAULT 'MXN',
    "etapa" "etapa_negocio" NOT NULL DEFAULT 'PROSPECTO',
    "probabilidad" INTEGER NOT NULL DEFAULT 0,
    "fecha_cierre_esperada" DATE,
    "fecha_cierre_real" DATE,
    "cliente_id" TEXT NOT NULL,
    "propietario_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "cerrado_en" TIMESTAMP(3),

    CONSTRAINT "negocios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "tipo" "tipo_actividad" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_vencimiento" TIMESTAMP(3),
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "completada_en" TIMESTAMP(3),
    "negocio_id" TEXT,
    "cliente_id" TEXT,
    "asignado_a" TEXT NOT NULL,
    "creado_por" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "email_origen" TEXT NOT NULL,
    "email_destino" TEXT NOT NULL,
    "emails_cc" TEXT[],
    "enviado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente_id" TEXT NOT NULL,
    "negocio_id" TEXT,
    "usuario_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas" (
    "id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fijada" BOOLEAN NOT NULL DEFAULT false,
    "cliente_id" TEXT,
    "negocio_id" TEXT,
    "autor_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "tipo" "tipo_notificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" TEXT NOT NULL,
    "negocio_relacionado_id" TEXT,
    "cliente_relacionado_id" TEXT,
    "actividad_relacionada_id" TEXT,
    "url_accion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "equipos_nombre_idx" ON "equipos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_equipo_id_idx" ON "usuarios"("equipo_id");

-- CreateIndex
CREATE INDEX "usuarios_rol_idx" ON "usuarios"("rol");

-- CreateIndex
CREATE INDEX "clientes_propietario_id_idx" ON "clientes"("propietario_id");

-- CreateIndex
CREATE INDEX "clientes_email_idx" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "clientes_empresa_idx" ON "clientes"("empresa");

-- CreateIndex
CREATE INDEX "clientes_nombre_idx" ON "clientes"("nombre");

-- CreateIndex
CREATE INDEX "negocios_cliente_id_idx" ON "negocios"("cliente_id");

-- CreateIndex
CREATE INDEX "negocios_propietario_id_idx" ON "negocios"("propietario_id");

-- CreateIndex
CREATE INDEX "negocios_etapa_idx" ON "negocios"("etapa");

-- CreateIndex
CREATE INDEX "negocios_fecha_cierre_esperada_idx" ON "negocios"("fecha_cierre_esperada");

-- CreateIndex
CREATE INDEX "negocios_creado_en_idx" ON "negocios"("creado_en");

-- CreateIndex
CREATE INDEX "actividades_asignado_a_idx" ON "actividades"("asignado_a");

-- CreateIndex
CREATE INDEX "actividades_fecha_vencimiento_idx" ON "actividades"("fecha_vencimiento");

-- CreateIndex
CREATE INDEX "actividades_completada_idx" ON "actividades"("completada");

-- CreateIndex
CREATE INDEX "actividades_negocio_id_idx" ON "actividades"("negocio_id");

-- CreateIndex
CREATE INDEX "actividades_cliente_id_idx" ON "actividades"("cliente_id");

-- CreateIndex
CREATE INDEX "actividades_tipo_idx" ON "actividades"("tipo");

-- CreateIndex
CREATE INDEX "emails_cliente_id_idx" ON "emails"("cliente_id");

-- CreateIndex
CREATE INDEX "emails_negocio_id_idx" ON "emails"("negocio_id");

-- CreateIndex
CREATE INDEX "emails_usuario_id_idx" ON "emails"("usuario_id");

-- CreateIndex
CREATE INDEX "emails_enviado_en_idx" ON "emails"("enviado_en");

-- CreateIndex
CREATE INDEX "notas_cliente_id_idx" ON "notas"("cliente_id");

-- CreateIndex
CREATE INDEX "notas_negocio_id_idx" ON "notas"("negocio_id");

-- CreateIndex
CREATE INDEX "notas_autor_id_idx" ON "notas"("autor_id");

-- CreateIndex
CREATE INDEX "notas_creado_en_idx" ON "notas"("creado_en" DESC);

-- CreateIndex
CREATE INDEX "notificaciones_usuario_id_idx" ON "notificaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "notificaciones_leida_idx" ON "notificaciones"("leida");

-- CreateIndex
CREATE INDEX "notificaciones_creado_en_idx" ON "notificaciones"("creado_en" DESC);

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_asignado_a_fkey" FOREIGN KEY ("asignado_a") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_negocio_id_fkey" FOREIGN KEY ("negocio_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_negocio_relacionado_id_fkey" FOREIGN KEY ("negocio_relacionado_id") REFERENCES "negocios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_cliente_relacionado_id_fkey" FOREIGN KEY ("cliente_relacionado_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_actividad_relacionada_id_fkey" FOREIGN KEY ("actividad_relacionada_id") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
