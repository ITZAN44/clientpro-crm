# Backend Developer Roadmap 2026 - Guía Educativa

**Fuente**: roadmap.sh/backend  
**Idioma**: Español  
**Propósito**: Explicar cada concepto del roadmap de forma clara, con analogías y ejemplos prácticos.

---

## Índice

1. [Version Control Systems](#1-version-control-systems)
2. [Repo Hosting Services](#2-repo-hosting-services)
3. [Relational Databases](#3-relational-databases)
4. [Learn about APIs](#4-learn-about-apis)
5. [Caching](#5-caching)
6. [Learn about Web Servers](#6-learn-about-web-servers)
7. [CI / CD](#7-ci--cd)
8. [More about Databases](#8-more-about-databases)
9. [Testing](#9-testing)
10. [Containerization](#10-containerization)
11. [Message Brokers](#11-message-brokers)
12. [Architectural Patterns](#12-architectural-patterns)
13. [Search Engines](#13-search-engines)
14. [Real-Time Data](#14-real-time-data)
15. [Scaling Databases](#15-scaling-databases)
16. [NoSQL Databases](#16-nosql-databases)
17. [Building For Scale](#17-building-for-scale)

---

## 1. Version Control Systems

### ¿Qué es?

Un sistema de control de versiones (VCS) guarda el historial completo de cambios de tu código. Piénsalo como el historial de "deshacer" de Word, pero para todo tu proyecto y para múltiples personas trabajando al mismo tiempo.

**Analogía**: Es como Google Docs con historial de versiones, pero para código. Puedes ver quién cambió qué, cuándo, y por qué.

### Git

Git es el VCS más usado en el mundo. Es una herramienta local que se instala en tu computadora.

**Conceptos clave:**

- **Repositorio (repo)**: La carpeta de tu proyecto con todo su historial.
- **Commit**: Una foto instantánea de tu código en un momento dado. Cada commit tiene un mensaje que describe qué cambiaste.
- **Branch (rama)**: Una línea de desarrollo paralela. Puedes trabajar en una feature nueva sin afectar el código principal.
- **Merge**: Combinar los cambios de una rama con otra.
- **Pull**: Traer cambios del servidor a tu máquina.
- **Push**: Enviar tus commits del local al servidor.

**Flujo básico:**

```bash
git init                           # Inicializar un repo desde cero
git add .                          # Preparar todos los cambios para commit
git commit -m "feat: add login"    # Guardar snapshot con mensaje descriptivo
git push origin main               # Enviar al servidor remoto
```

**Por qué importa**: Sin Git, no puedes colaborar profesionalmente. Es la herramienta #1 que todo empleador da por sentada.

### ¿Por qué usar Git y no solo hacer copias?

```
Sin Git:                     Con Git:
proyecto_v1/                 git log
proyecto_v2/                 abc1234 feat: add login
proyecto_v2_final/           def5678 fix: password hash
proyecto_v2_FINAL_ok/        gh9012  feat: initial setup
proyecto_USAESTO/
```

---

## 2. Repo Hosting Services

### ¿Qué es?

Son plataformas en la nube que alojan tu repositorio Git. Tu código vive en un servidor centralizado accesible desde cualquier lugar.

**Analogía**: Git es la cámara, el hosting service es el álbum de fotos en la nube (Google Photos, iCloud). Puedes compartir el álbum con otros.

### GitHub

La plataforma más popular del mundo para alojar código. Tiene:

- **Pull Requests (PR)**: Propuesta formal de cambios. Tu equipo revisa el código antes de integrarlo.
- **Issues**: Sistema de tickets para bugs y features.
- **Actions**: CI/CD integrado (ver bloque 7).
- **Forks**: Copia pública de un repositorio ajeno para contribuir.
- **GitHub Pages**: Hosting gratuito para sitios estáticos.

**Flujo profesional típico con GitHub:**

```
1. Creas branch: feature/login
2. Haces commits en esa branch
3. Abres Pull Request
4. Tu equipo revisa y aprueba
5. Se hace merge a main
```

### GitLab

Alternativa a GitHub, especialmente popular en empresas que quieren self-hosting. Incluye CI/CD más poderoso integrado nativamente.

### ¿Cuál usar?

| Aspecto      | GitHub                | GitLab                  |
| ------------ | --------------------- | ----------------------- |
| Popularidad  | Mayor en open source  | Mayor en empresas       |
| CI/CD        | GitHub Actions        | GitLab CI (más potente) |
| Self-hosting | GitHub Enterprise ($) | GitLab CE (gratis)      |
| Ecosistema   | Enorme                | Sólido                  |

**Por qué importa**: Un repo en GitHub es tu portafolio. Los reclutadores ven tus commits, proyectos y contribuciones. Sin GitHub, eres invisible.

---

## 3. Relational Databases

### ¿Qué es una base de datos relacional?

Almacena datos en tablas (como hojas de Excel) relacionadas entre sí. Usa SQL (Structured Query Language) para consultar datos.

**Analogía**: Una hoja de cálculo con múltiples pestañas que pueden referenciarse entre sí. La pestaña "Clientes" tiene una columna `id`, y la pestaña "Órdenes" tiene una columna `clienteId` que apunta a ese id.

### PostgreSQL

La base de datos relacional open-source más avanzada. Destaca por:

- **Robustez**: Soporta millones de registros.
- **Extensibilidad**: JSON, búsqueda full-text, geoespacial.
- **ACID**: Garantías de integridad de datos (ver bloque 8).
- **Gratuita**: 100% open source.

```sql
-- Crear una tabla
CREATE TABLE clientes (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  email     VARCHAR(150) UNIQUE NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Insertar datos
INSERT INTO clientes (nombre, email) VALUES ('Ana García', 'ana@email.com');

-- Consultar con JOIN (relacionar tablas)
SELECT c.nombre, n.titulo
FROM clientes c
JOIN negocios n ON n.cliente_id = c.id
WHERE c.email = 'ana@email.com';
```

### Migrations (Migraciones)

Las migraciones son scripts versionados que modifican el esquema de la base de datos de forma controlada.

**Analogía**: Las migraciones son como commits de Git, pero para la estructura de la base de datos. Cada cambio queda registrado y puede revertirse.

**Sin migraciones** (malo):

```bash
# Alguien agrega una columna manualmente en producción
# Otro entorno no tiene esa columna
# El equipo pierde sincronía → bugs misteriosos
```

**Con migraciones** (correcto):

```bash
# Crear migración
npx prisma migrate dev --name "add-telefono-to-clientes"

# El archivo generado:
# ALTER TABLE clientes ADD COLUMN telefono VARCHAR(20);

# Todos los entornos ejecutan la misma migración
npx prisma migrate deploy
```

### N+1 Problem

Uno de los problemas de performance más comunes con bases de datos relacionales.

**¿Qué es?**

Cuando consultas una lista de elementos (1 query) y luego haces una query adicional por cada elemento (N queries), en lugar de traer todo de una vez.

```typescript
// ❌ N+1 Problem: 1 query para clientes + 1 por cada cliente
const clientes = await db.query('SELECT * FROM clientes'); // 1 query
for (const cliente of clientes) {
  const negocios = await db.query(
    // N queries
    'SELECT * FROM negocios WHERE cliente_id = $1',
    [cliente.id]
  );
}
// Si hay 100 clientes → 101 queries a la DB

// ✅ Solución con JOIN: siempre 1 sola query
const clientes = await db.query(`
  SELECT c.*, n.*
  FROM clientes c
  LEFT JOIN negocios n ON n.cliente_id = c.id
`); // 1 query, sin importar cuántos clientes hay
```

**Con Prisma ORM**, la solución es usar `include`:

```typescript
// ✅ Prisma resuelve N+1 con include
const clientes = await prisma.cliente.findMany({
  include: { negocios: true }, // Un solo query optimizado
});
```

---

## 4. Learn about APIs

### ¿Qué es una API?

**API** (Application Programming Interface) es el contrato que define cómo dos sistemas se comunican. Es como un menú de restaurante: defines qué puedes pedir y cómo recibirás la respuesta.

---

### Estilos de API

#### REST (Representational State Transfer)

El estilo más popular para APIs web. Usa HTTP y sus verbos (GET, POST, PUT, PATCH, DELETE).

**Principios clave:**

- **Stateless**: Cada request contiene toda la información necesaria. El servidor no recuerda el request anterior.
- **Recursos**: Cada URL representa un recurso (clientes, órdenes, usuarios).
- **Verbos HTTP**: Definen la acción sobre el recurso.

```
GET    /clientes          → Listar todos los clientes
GET    /clientes/42       → Ver cliente con id 42
POST   /clientes          → Crear nuevo cliente
PATCH  /clientes/42       → Actualizar parcialmente cliente 42
DELETE /clientes/42       → Eliminar cliente 42
```

**Status codes importantes:**

| Código | Significado                                |
| ------ | ------------------------------------------ |
| 200    | OK - Éxito                                 |
| 201    | Created - Recurso creado                   |
| 400    | Bad Request - Datos inválidos enviados     |
| 401    | Unauthorized - No autenticado              |
| 403    | Forbidden - Autenticado pero sin permiso   |
| 404    | Not Found - Recurso no existe              |
| 500    | Internal Server Error - Error del servidor |

#### JSON APIs

Formato de intercambio de datos más usado con REST. JSON es legible por humanos y fácil de procesar.

```json
{
  "id": 42,
  "nombre": "Ana García",
  "email": "ana@empresa.com",
  "negocios": [{ "id": 1, "titulo": "Contrato Anual", "valor": 50000 }]
}
```

#### SOAP

Protocolo más antiguo basado en XML. Más verbose que REST pero con contratos estrictos. Se usa mucho en sistemas bancarios y gubernamentales legacy.

```xml
<!-- Request SOAP (vs JSON de REST, mucho más verboso) -->
<soap:Envelope>
  <soap:Body>
    <GetCliente>
      <Id>42</Id>
    </GetCliente>
  </soap:Body>
</soap:Envelope>
```

#### gRPC

Protocolo de Google para comunicación entre servicios (microservices). Usa Protocol Buffers (binario, muy eficiente) en lugar de JSON. Más rápido que REST pero más complejo de implementar.

**Cuándo usarlo**: Comunicación interna entre microservicios donde la performance es crítica.

#### GraphQL

Lenguaje de consulta desarrollado por Facebook. El cliente decide exactamente qué datos recibir. Resuelve el over-fetching (recibir más datos de los necesarios) y under-fetching (tener que hacer múltiples requests).

```graphql
# Con REST necesitarías 3 requests separados
# Con GraphQL, 1 sola query que pide exactamente lo que necesitas
query {
  cliente(id: 42) {
    nombre
    email
    negocios {
      titulo
      valor
    }
  }
}
```

---

### Authentication (Autenticación)

La autenticación verifica **quién eres**. La autorización verifica **qué puedes hacer**.

#### JWT (JSON Web Tokens)

El método más popular para APIs stateless. Un token firmado que contiene información del usuario.

**Estructura del token**: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjQyfQ.abc123xyz
    └── Header           └── Payload         └── Firma
    (algoritmo)          (datos del usuario)  (verifica integridad)
```

**Flujo:**

```
1. Usuario hace login (email + password)
2. Servidor verifica credenciales
3. Servidor genera JWT firmado y lo devuelve
4. Cliente guarda el token
5. En cada request, cliente envía: Authorization: Bearer <token>
6. Servidor verifica firma del token
```

```typescript
// Generar token
const token = jwt.sign(
  { userId: 42, email: 'ana@email.com', rol: 'ADMIN' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verificar token
const payload = jwt.verify(token, process.env.JWT_SECRET);
console.log(payload.userId); // 42
```

**Ventaja**: No necesitas consultar la DB en cada request para saber quién es el usuario. El payload está en el token.

#### OAuth

Framework de autorización que permite que aplicaciones externas accedan a recursos de un usuario sin revelar su contraseña. El "Iniciar sesión con Google/GitHub" usa OAuth.

**Flujo:**

```
Usuario → Tu App → Google (OAuth provider)
                      ↓ "¿Autorizas que esta app lea tu email?"
Usuario aprueba → Google devuelve token → Tu app accede a recursos
```

#### Basic Authentication

El método más simple. Envía `usuario:contraseña` en base64 en cada request. Inseguro sin HTTPS porque se puede decodificar fácilmente. Solo para uso interno o APIs muy simples.

#### Cookie-Based Auth

El servidor crea una sesión y envía una cookie con el session ID. El navegador guarda la cookie y la envía automáticamente en cada request. Más apropiado para web apps tradicionales (no SPAs/mobile).

#### OpenID Connect (OIDC)

Capa de identidad sobre OAuth 2.0. OAuth solo autoriza acceso a recursos; OIDC también autentica (identifica al usuario). El "Sign in with Google" técnicamente usa OIDC.

#### SAML

Protocolo XML para Single Sign-On (SSO) en entornos empresariales. Permite que los empleados usen las credenciales corporativas para acceder a múltiples aplicaciones.

---

### Web Security

#### Hashing Algorithms

**¿Por qué no guardar contraseñas en texto plano?**

Si la DB es hackeada, todos los passwords quedan expuestos. El hashing los transforma de forma irreversible.

```
"mi_password" → bcrypt → "$2b$10$abc...xyz" (hash)
```

- **MD5**: Obsoleto, no usar para passwords.
- **SHA-256**: Para checksums, no para passwords.
- **bcrypt**: El estándar para passwords. Lento a propósito (dificulta ataques de fuerza bruta). Incluye "salt" automático.
- **scrypt / Argon2**: Más modernos que bcrypt, resistentes a ataques con GPU.

```typescript
// bcrypt en Node.js
const hash = await bcrypt.hash('mi_password', 10); // 10 = salt rounds
const isValid = await bcrypt.compare('mi_password', hash); // true
```

#### HTTPS / SSL/TLS

HTTP transfiere datos en texto plano. HTTPS cifra la comunicación entre cliente y servidor usando TLS (Transport Layer Security).

```
HTTP:  Los datos viajan como texto → Cualquiera puede leer la conversación
HTTPS: Los datos viajan cifrados  → Solo el receptor puede leerlos
```

**TLS** es el protocolo criptográfico. El **certificado SSL/TLS** es el "pasaporte" que identifica al servidor. Sin HTTPS, interceptar contraseñas es trivial en redes públicas.

#### OWASP Top 10

OWASP (Open Web Application Security Project) publica los 10 riesgos de seguridad más críticos. Los más importantes:

| Riesgo                    | Descripción                                | Solución                              |
| ------------------------- | ------------------------------------------ | ------------------------------------- |
| SQL Injection             | Insertar SQL malicioso en inputs           | Usar ORM / queries parametrizadas     |
| Broken Authentication     | Tokens débiles, sessiones no expiradas     | JWT con expiración, bcrypt            |
| XSS                       | Inyectar JavaScript en páginas             | Escapar HTML, Content Security Policy |
| IDOR                      | Acceder a recursos de otros usuarios       | Verificar ownership en cada endpoint  |
| Security Misconfiguration | Credenciales por defecto, puertos abiertos | Principle of least privilege          |

#### CORS (Cross-Origin Resource Sharing)

Los navegadores bloquean por defecto requests de un origen (dominio) a otro diferente. CORS es el mecanismo para permitir esas requests de forma controlada.

```typescript
// Backend: Solo permite requests de localhost:3000
app.enableCors({
  origin: 'https://miapp.com', // Solo este origen puede consultar la API
  credentials: true, // Permite enviar cookies
});
```

**Sin CORS**: cualquier sitio malicioso podría hacer requests a tu API usando las cookies del usuario.

#### CSP (Content Security Policy)

Header HTTP que le dice al navegador qué recursos puede cargar y de dónde. Mitiga ataques XSS especificando fuentes permitidas para scripts, estilos, imágenes, etc.

```http
Content-Security-Policy: script-src 'self' https://trusted.com
```

---

### Open API Specs (Swagger)

Estándar para documentar APIs REST. Swagger UI genera una interfaz interactiva donde puedes ver y probar todos los endpoints.

```typescript
// Con Swagger en NestJS
const config = new DocumentBuilder().setTitle('Mi API').setVersion('1.0').addBearerAuth().build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
// → Accede en http://localhost:4000/api
```

**Por qué importa**: Sin documentación, los consumidores de tu API no saben cómo usarla. Swagger hace la documentación automáticamente desde el código.

---

## 5. Caching

### ¿Qué es el caché?

Guardar resultados costosos (queries a DB, cálculos) en memoria temporal para servirlos instantáneamente en requests siguientes.

**Analogía**: La caché es como tu mente memorizando la ruta al trabajo. La primera vez consultas Google Maps (caro), después sabes el camino de memoria (instantáneo). Si cambia la ruta (datos actualizados), invalidas y vuelves a consultar.

**El problema que resuelve**:

```
Sin caché:
Request → Servidor → DB (50ms) → Response    (cada vez)

Con caché:
Request → Servidor → Redis (1ms) → Response  (si está en caché)
Request → Servidor → DB (50ms) → Redis → Response (si expiró)
```

---

### Redis

Base de datos in-memory (en RAM) que actúa como caché ultrarrápido. Soporta estructuras de datos: strings, hashes, listas, sets.

**Operaciones básicas:**

```bash
# Guardar con TTL (Time To Live)
SET clientes:all "[ {...}, {...} ]"  EX 300  # Expira en 5 minutos

# Obtener
GET clientes:all

# Eliminar
DEL clientes:all

# Eliminar por patrón
KEYS clientes:*  →  DEL clientes:1, clientes:2, ...
```

**Patrón típico en un servicio:**

```typescript
async findAll(): Promise<Cliente[]> {
  // 1. Intentar obtener del caché
  const cached = await redis.get('clientes:all');
  if (cached) return JSON.parse(cached);  // Retorno instantáneo

  // 2. Si no está en caché, consultar DB
  const clientes = await prisma.cliente.findMany();

  // 3. Guardar en caché por 5 minutos
  await redis.set('clientes:all', JSON.stringify(clientes), 'EX', 300);

  return clientes;
}

// Cuando un cliente cambia, invalidar caché
async update(id: number, data: UpdateDto) {
  const result = await prisma.cliente.update({ where: { id }, data });
  await redis.del('clientes:all');  // Invalidar caché
  await redis.del(`clientes:${id}`);
  return result;
}
```

**Casos de uso:**

- Resultados de queries costosas
- Sesiones de usuario
- Rate limiting
- Leaderboards / contadores

### Memcached

Alternativa más simple a Redis. Solo soporta strings. Buen rendimiento para casos simples, pero Redis es generalmente preferido por su versatilidad.

| Característica       | Redis                          | Memcached    |
| -------------------- | ------------------------------ | ------------ |
| Estructuras de datos | Strings, Hash, List, Set, etc. | Solo strings |
| Persistencia         | Sí (opcional)                  | No           |
| Replicación          | Sí                             | No           |
| Popularidad          | Mayor                          | Menor        |

### HTTP Caching

Los servidores web pueden decirle al navegador cuánto tiempo puede guardar una respuesta sin volver a pedirla.

```http
# Header que el servidor envía:
Cache-Control: max-age=3600    # El navegador cachea por 1 hora
ETag: "abc123"                  # Identificador del contenido actual

# En el siguiente request:
If-None-Match: "abc123"         # Navegador pregunta: ¿cambió?
→ Servidor responde 304 Not Modified (sin body) si no cambió
```

**Por qué importa**: Reduce el tráfico de red y mejora la velocidad percibida por el usuario.

---

## 6. Learn about Web Servers

### ¿Qué es un Web Server?

Software que recibe requests HTTP y devuelve responses. Es la "puerta de entrada" a tu aplicación.

**Analogía**: El web server es como la recepción de un hotel. Recibe a todos los visitantes, los dirige al piso correcto, y maneja el tráfico general.

---

### Nginx

El web server más popular del mundo. Destaca por su eficiencia manejando miles de conexiones simultáneas con bajo uso de memoria.

**Roles principales:**

**1. Reverse Proxy**: Recibe requests del exterior y los redirige a los servidores internos.

```nginx
# nginx.conf
server {
    listen 80;

    # Requests a / van al frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
    }

    # Requests a /api/ van al backend (NestJS)
    location /api/ {
        proxy_pass http://localhost:4000;
    }
}
```

**2. Load Balancer**: Distribuye el tráfico entre múltiples instancias del servidor.

```nginx
upstream backend {
    server backend1:4000;
    server backend2:4000;
    server backend3:4000;
}
```

**3. Servir archivos estáticos**: Mucho más eficiente que Node.js para servir imágenes, CSS, JS.

**4. SSL Termination**: Maneja HTTPS y pasa HTTP plano al servidor interno.

### Apache

El web server más antiguo y ampliamente usado históricamente. Más flexible con módulos (`.htaccess`). Nginx es más eficiente para alto tráfico, Apache para configuraciones complejas por directorio.

### Caddy

Web server moderno con HTTPS automático (obtiene y renueva certificados Let's Encrypt sin configuración).

```caddyfile
# Caddyfile - HTTPS automático
miapp.com {
    reverse_proxy /api/* localhost:4000
    reverse_proxy localhost:3000
}
```

**Arquitectura típica de producción:**

```
Internet
    ↓
  Nginx (puerto 80/443)
  ├── /api/* → NestJS (:4000) → PostgreSQL
  └── /*     → Next.js (:3000)
```

---

## 7. CI / CD

### ¿Qué es CI/CD?

**CI (Continuous Integration)**: Cada vez que un desarrollador hace push de código, se ejecutan automáticamente los tests, linters y build para detectar errores inmediatamente.

**CD (Continuous Delivery/Deployment)**: Después de que los tests pasan, el código se despliega automáticamente a staging o producción.

**Analogía**: Es como una línea de ensamblaje con control de calidad automático. Cada pieza que entra pasa por todas las verificaciones antes de llegar al producto final. Sin CI/CD, desplegar código es manual, propenso a errores y lento.

---

### GitHub Actions

Sistema de CI/CD integrado en GitHub. Se configura con archivos YAML en `.github/workflows/`.

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      # 1. Descargar el código
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Configurar Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # 3. Instalar dependencias
      - name: Install dependencies
        run: npm install

      # 4. Linting
      - name: Run linter
        run: npm run lint

      # 5. Tests
      - name: Run tests
        run: npm test

      # 6. Build
      - name: Build
        run: npm run build

  deploy:
    needs: test # Solo se ejecuta si tests pasaron
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        run: ./deploy.sh
```

### Pipeline típico:

```
Developer hace push
        ↓
GitHub Actions dispara pipeline
        ↓
1. Install dependencies   ✅ / ❌
2. Lint code              ✅ / ❌
3. Run tests              ✅ / ❌
4. Build application      ✅ / ❌
        ↓
Si todo ✅:
5. Deploy a staging       ✅ / ❌
6. Run E2E tests          ✅ / ❌
7. Deploy a producción    ✅
```

**Por qué importa**: Sin CI/CD, el "funciona en mi máquina" destruye proyectos. CI garantiza que el código que llega a producción fue verificado automáticamente.

---

## 8. More about Databases

### Transactions (Transacciones)

Una transacción agrupa múltiples operaciones de DB en una unidad atómica: o todas se ejecutan, o ninguna.

**Analogía**: Una transferencia bancaria debe hacer dos cosas: restar de cuenta A y sumar a cuenta B. Si falla en el medio, no puedes quedarte a la mitad (A restó pero B no sumó).

```typescript
// Sin transacción (peligroso)
await db.query('UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1');
// ERROR AQUÍ → cuenta 1 perdió $100 pero cuenta 2 no ganó nada
await db.query('UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2');

// Con transacción (correcto)
await prisma.$transaction([
  prisma.cuenta.update({ where: { id: 1 }, data: { saldo: { decrement: 100 } } }),
  prisma.cuenta.update({ where: { id: 2 }, data: { saldo: { increment: 100 } } }),
]);
// Si alguna falla, ambas se revierten automáticamente
```

---

### ORMs (Object-Relational Mapping)

Abstracción que permite interactuar con la DB usando código orientado a objetos en lugar de SQL raw.

**Sin ORM (SQL raw):**

```typescript
const result = await db.query(
  'SELECT c.*, u.nombre as vendedor FROM clientes c JOIN usuarios u ON c.vendedor_id = u.id WHERE c.id = $1',
  [id]
);
return result.rows[0];
```

**Con ORM (Prisma):**

```typescript
const cliente = await prisma.cliente.findUnique({
  where: { id },
  include: { vendedor: true }, // Más legible, type-safe
});
```

**Ventajas del ORM:**

- Código más legible y mantenible
- Autocompletado de IDE (TypeScript)
- Protección automática contra SQL injection
- Generación de tipos desde el schema

**Desventajas:**

- Para queries muy complejas o críticas de performance, SQL raw puede ser necesario
- Capa de abstracción puede ocultar problemas de eficiencia

---

### ACID

Conjunto de propiedades que garantizan la fiabilidad de las transacciones en bases de datos:

| Propiedad       | Significado                             | Ejemplo                                             |
| --------------- | --------------------------------------- | --------------------------------------------------- |
| **A**tomicity   | Todo o nada                             | La transferencia bancaria o completa o se revierte  |
| **C**onsistency | Los datos siempre son válidos           | No puedes tener saldo negativo si hay constraint    |
| **I**solation   | Las transacciones no se interfieren     | Dos usuarios editando el mismo registro no se pisan |
| **D**urability  | Una vez confirmado, sobrevive a crashes | Un commit guardado persiste aunque se corte la luz  |

PostgreSQL y la mayoría de bases de datos relacionales garantizan ACID por diseño.

---

### Normalization (Normalización)

Proceso de diseñar el schema de la DB para reducir redundancia y mejorar integridad.

**Sin normalizar (datos duplicados):**

```
tabla: ordenes
| cliente_nombre | cliente_email | cliente_ciudad | producto | precio |
|----------------|---------------|----------------|----------|--------|
| Ana García     | ana@email.com | Bogotá         | Laptop   | 1500   |
| Ana García     | ana@email.com | Bogotá         | Mouse    | 25     |
```

**Normalizado (3NF):**

```
tabla: clientes          tabla: ordenes
| id | nombre  | email        | ciudad |     | id | cliente_id | producto | precio |
|----|---------|--------------|--------|     |----|------------|----------|--------|
| 1  | Ana García | ana@email.com | Bogotá |  | 1  | 1          | Laptop   | 1500   |
                                             | 2  | 1          | Mouse    | 25     |
```

Si Ana García cambia de ciudad, solo se actualiza en un lugar, no en todas las órdenes.

---

### Failure Modes (Modos de Fallo)

¿Qué pasa cuando algo sale mal? Los sistemas robustos anticipan y manejan los fallos:

- **Timeouts**: La DB tarda demasiado → devolver error al cliente.
- **Connection pool exhausted**: Demasiadas conexiones abiertas → queue de espera.
- **Deadlocks**: Dos transacciones se bloquean mutuamente → reintentar.
- **Replication lag**: La réplica de lectura tiene datos desactualizados → leer del master.

---

### Profiling Performance

Analizar qué queries son lentas y por qué.

```sql
-- PostgreSQL: EXPLAIN ANALYZE muestra el plan de ejecución
EXPLAIN ANALYZE
SELECT * FROM clientes
WHERE nombre LIKE '%García%';

-- Output:
-- Seq Scan on clientes (cost=0.00..1850.00 rows=5 width=150)
--   Filter: (nombre LIKE '%García%')
-- Planning Time: 0.5 ms
-- Execution Time: 45.2 ms  ← ¡Tardó 45ms en escanear TODA la tabla!
```

Si la query es lenta, probablemente necesitas un índice (ver bloque 15).

---

## 9. Testing

### ¿Por qué testear?

Los tests verifican automáticamente que tu código hace lo que debe hacer. Sin tests, cada cambio puede romper algo y solo lo descubres en producción.

**Analogía**: Los tests son como los airbags de un auto. Esperas no necesitarlos, pero cuando ocurre un accidente (bug), te protegen.

---

### Unit Testing (Pruebas Unitarias)

Prueban la unidad más pequeña de código (una función, un método) de forma aislada. Las dependencias externas (DB, APIs) se reemplazan con "mocks".

```typescript
// Función a testear
function calcularDescuento(precio: number, porcentaje: number): number {
  return precio - (precio * porcentaje) / 100;
}

// Unit test con Jest
describe('calcularDescuento', () => {
  it('debería aplicar 10% de descuento', () => {
    expect(calcularDescuento(100, 10)).toBe(90);
  });

  it('debería devolver el mismo precio con 0% descuento', () => {
    expect(calcularDescuento(100, 0)).toBe(100);
  });

  it('debería manejar precio 0', () => {
    expect(calcularDescuento(0, 50)).toBe(0);
  });
});
```

**Mocks**: Reemplazos de dependencias reales para tests aislados.

```typescript
// Mock de la base de datos para no necesitar Postgres en los tests
const prismaMock = {
  cliente: {
    findMany: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Test' }]),
    findUnique: jest.fn(),
  },
};
```

---

### Integration Testing

Prueban cómo múltiples componentes trabajan juntos. Menos aislado que unit testing, más realista.

```typescript
// Testea el endpoint completo (controller → service → db mock)
describe('GET /clientes', () => {
  it('debería retornar lista de clientes', async () => {
    const response = await request(app.getHttpServer())
      .get('/clientes')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('nombre');
  });
});
```

---

### Functional / E2E Testing

Prueban el flujo completo del sistema desde la perspectiva del usuario, incluyendo DB real y servicios reales.

```typescript
// E2E: Simula el flujo real del usuario
test('usuario puede crear y ver un cliente', async () => {
  // 1. Login
  const { token } = await loginUser('admin@test.com', 'password');

  // 2. Crear cliente
  const newCliente = await createCliente(token, { nombre: 'Nuevo Cliente' });
  expect(newCliente.id).toBeDefined();

  // 3. Verificar que aparece en la lista
  const clientes = await getClientes(token);
  expect(clientes.find((c) => c.id === newCliente.id)).toBeDefined();
});
```

**Pirámide de testing:**

```
         /\
        /  \    E2E (pocos, lentos, costosos)
       /----\
      /      \  Integration (moderados)
     /--------\
    /          \ Unit (muchos, rápidos, baratos)
   /____________\
```

---

## 10. Containerization

### ¿Qué es la containerización?

Empaquetar una aplicación junto con todas sus dependencias (OS, runtime, librerías) en un contenedor portable que se ejecuta idénticamente en cualquier entorno.

**Analogía**: Un contenedor de envío estándar. El puerto no sabe ni le importa qué hay dentro. El contenedor funciona igual en cualquier barco, tren o camión.

**El problema que resuelve**: "Funciona en mi máquina" → Con contenedores, la "máquina" viaja junto con el código.

---

### Docker

La herramienta de containerización más popular. Define la imagen en un `Dockerfile` y la ejecuta como contenedor.

**Conceptos:**

- **Imagen**: La plantilla inmutable (como un .exe). Contiene el sistema operativo, runtime y código.
- **Contenedor**: Instancia en ejecución de una imagen.
- **Dockerfile**: Receta para construir la imagen.
- **Docker Hub**: Registro público de imágenes.

```dockerfile
# backend/Dockerfile
FROM node:20-alpine              # Imagen base: Node.js 20 sobre Alpine Linux

WORKDIR /app                     # Directorio de trabajo dentro del contenedor

COPY package*.json ./            # Copiar primero para aprovechar cache
RUN npm install                  # Instalar dependencias

COPY . .                         # Copiar el código fuente
RUN npm run build                # Compilar TypeScript

EXPOSE 4000                      # Documentar que usa el puerto 4000

CMD ["npm", "run", "start:prod"] # Comando para iniciar la app
```

```bash
# Construir imagen
docker build -t mi-backend:1.0 .

# Ejecutar contenedor
docker run -p 4000:4000 mi-backend:1.0
```

### Docker Compose

Orquestación de múltiples contenedores para desarrollo local.

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: clientpro_crm
      POSTGRES_PASSWORD: secreto
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data # Persistir datos

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  backend:
    build: ./backend
    ports:
      - '4000:4000'
    environment:
      DATABASE_URL: postgresql://postgres:secreto@postgres:5432/clientpro_crm
      REDIS_HOST: redis
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - '3000:3000'
    depends_on:
      - backend

volumes:
  postgres_data:
```

```bash
docker-compose up -d    # Levantar todo en background
docker-compose down     # Detener y remover contenedores
docker-compose logs -f  # Ver logs en tiempo real
```

### LXC (Linux Containers)

Tecnología de containerización más antigua y de más bajo nivel que Docker. Docker usa LXC internamente (entre otras tecnologías). No se usa directamente en la mayoría de proyectos modernos.

### Kubernetes (K8s)

Sistema de orquestación de contenedores para producción. Gestiona automáticamente el despliegue, escalado y recuperación de contenedores en clústeres de servidores.

**Cuándo lo necesitas**: Cuando tienes múltiples servicios, necesitas alta disponibilidad, escalado automático y orquestación avanzada.

```yaml
# kubernetes/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3 # 3 instancias corriendo simultáneamente
  selector:
    matchLabels:
      app: backend
  template:
    spec:
      containers:
        - name: backend
          image: mi-backend:1.0
          resources:
            limits:
              memory: '256Mi'
              cpu: '500m'
```

---

## 11. Message Brokers

### ¿Qué es un Message Broker?

Intermediario que gestiona la comunicación asíncrona entre servicios. Un servicio publica mensajes, otro los consume. Los mensajes se persisten y tienen garantías de entrega.

**Analogía**: El correo postal. El remitente deposita la carta (mensaje) en el buzón (broker). El destinatario la recoge cuando puede. Si el destinatario no está disponible, la carta espera. No necesitan estar conectados simultáneamente.

**vs WebSockets** (conexión directa):

```
WebSocket:  Remitente → [Canal directo] → Destinatario  (sincrono, sin persistencia)
Broker:     Remitente → [Cola/Topic]   → Destinatario  (asíncrono, persistente, con retry)
```

---

### RabbitMQ

Message broker basado en colas (AMQP). Ideal para tareas background, emails, procesamiento de imágenes.

```typescript
// Publicar mensaje (productor)
const channel = await connection.createChannel();
await channel.assertQueue('email-queue');
channel.sendToQueue(
  'email-queue',
  Buffer.from(
    JSON.stringify({
      to: 'usuario@email.com',
      subject: 'Bienvenido',
      body: '...',
    })
  )
);

// Consumir mensaje (consumidor)
channel.consume('email-queue', async (msg) => {
  const emailData = JSON.parse(msg.content.toString());
  await sendEmail(emailData); // Enviar email real
  channel.ack(msg); // Confirmar que se procesó
});
```

**Características clave:**

- **Persistencia**: Los mensajes sobreviven a reinicios del broker.
- **Acknowledgment**: El consumidor confirma que procesó el mensaje.
- **Dead Letter Queue**: Los mensajes fallidos van a una cola especial para análisis.
- **Retry automático**: Si el consumidor falla, el mensaje se re-encola.

### Apache Kafka

Plataforma de streaming de eventos distribuida. Diseñada para alto rendimiento (millones de mensajes/segundo) y retención de eventos históricos.

**Kafka vs RabbitMQ:**

| Aspecto     | RabbitMQ                     | Kafka                               |
| ----------- | ---------------------------- | ----------------------------------- |
| Caso de uso | Tareas asíncronas            | Streaming de eventos, logs          |
| Rendimiento | Alto (miles/seg)             | Muy alto (millones/seg)             |
| Retención   | Hasta que se consumen        | Semanas/meses (configurable)        |
| Complejidad | Media                        | Alta                                |
| Ideal para  | Emails, notificaciones, jobs | Analytics, ML pipelines, audit logs |

**Casos de uso de message brokers:**

- Envío de emails masivos sin bloquear el request HTTP
- Procesamiento de imágenes en background
- Notificaciones push
- Sincronización entre microservicios
- Event sourcing

---

## 12. Architectural Patterns

### Monolith (Monolito)

Toda la aplicación en un único código base y proceso. El patrón más simple y punto de partida natural.

```
Monolito:
┌─────────────────────────────────────┐
│           MiAplicacion              │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ Auth     │  │ Clientes         │ │
│  ├──────────┤  ├──────────────────┤ │
│  │ Negocios │  │ Reportes         │ │
│  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────┘
             │
         PostgreSQL
```

**Ventajas**: Simple de desarrollar, desplegar y debuggear. Un solo proceso, sin latencia de red entre módulos.

**Desventajas**: A gran escala, un bug en un módulo puede derribar toda la app. Difícil de escalar selectivamente.

---

### Microservices (Microservicios)

La aplicación se divide en servicios pequeños e independientes, cada uno con su propia DB y proceso.

```
Microservicios:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │ Client Svc   │  │ Report Svc   │
│ :3001        │  │ :3002        │  │ :3003        │
│ PostgreSQL   │  │ PostgreSQL   │  │ MongoDB      │
└──────────────┘  └──────────────┘  └──────────────┘
        │               │                 │
        └───────────────┴─────────────────┘
                         │
                   API Gateway (:80)
```

**Ventajas**: Escalar solo el servicio que lo necesita, deploys independientes, tecnologías distintas por servicio.

**Desventajas**: Complejidad operacional enorme. Solo justificado en equipos grandes con servicios que necesitan escalar de forma independiente.

**Regla de oro**: Empieza con un monolito. Extrae microservicios cuando el problema sea real, no especulativo.

---

### Serverless

El código se despliega como funciones que se ejecutan en respuesta a eventos. No gestionas servidores. Pagas por ejecución, no por tiempo activo.

```typescript
// AWS Lambda function
export const handler = async (event) => {
  const { clienteId } = event.pathParameters;
  const cliente = await db.findById(clienteId);
  return {
    statusCode: 200,
    body: JSON.stringify(cliente),
  };
};
```

**Cuándo usar**: APIs de bajo tráfico o tráfico muy variable, webhooks, procesamiento de eventos.

**Cuándo NO usar**: Conexiones persistentes, procesamiento largo, WebSockets, alto tráfico constante.

---

### Twelve Factor Apps

Metodología para construir aplicaciones web modernas, escalables y mantenibles. 12 principios:

| Factor                 | Descripción                                                  |
| ---------------------- | ------------------------------------------------------------ |
| 1. Codebase            | Un repositorio, múltiples deploys                            |
| 2. Dependencies        | Dependencias declaradas explícitamente (package.json)        |
| 3. Config              | Configuración en variables de entorno (.env), no hardcodeada |
| 4. Backing services    | Tratar DB, Redis, etc. como recursos adjuntables             |
| 5. Build, release, run | Separar build de deploy de ejecución                         |
| 6. Processes           | Procesos stateless (sin estado en memoria)                   |
| 7. Port binding        | La app exporta servicios via puerto                          |
| 8. Concurrency         | Escalar horizontalmente (más instancias, no más grande)      |
| 9. Disposability       | Inicio rápido, shutdown graceful                             |
| 10. Dev/prod parity    | Entornos lo más similares posible                            |
| 11. Logs               | Logs como streams de eventos (stdout)                        |
| 12. Admin processes    | Tasks de gestión como procesos one-off                       |

---

## 13. Search Engines

### ¿Cuándo la DB no es suficiente?

Las bases de datos relacionales son excelentes para búsquedas exactas, pero tienen limitaciones para búsqueda de texto:

```sql
-- Funciona, pero:
-- ❌ No hay ranking por relevancia
-- ❌ No maneja errores de tipeo ("Garsia" no encuentra "García")
-- ❌ Sin sinónimos ("auto" no encuentra "carro")
-- ❌ Lento en tablas muy grandes sin índices especializados
SELECT * FROM articulos WHERE contenido LIKE '%inteligencia artificial%';
```

---

### Elasticsearch

Motor de búsqueda distribuido basado en Apache Lucene. Permite búsqueda full-text con relevancia, faceting, analytics, y más.

```typescript
// Indexar un documento
await elastic.index({
  index: 'clientes',
  id: '42',
  document: {
    nombre: 'Ana García',
    email: 'ana@empresa.com',
    notas: 'Interesada en plan enterprise...',
  },
});

// Búsqueda con relevancia
const results = await elastic.search({
  index: 'clientes',
  query: {
    multi_match: {
      query: 'ana garcia',
      fields: ['nombre^3', 'email', 'notas'], // nombre tiene 3x más peso
      fuzziness: 'AUTO', // Tolera errores de tipeo
    },
  },
});
// Encuentra "Ana García", "ana_garcia", "Ana Garcia" (sin acento), etc.
```

**Características:**

- **Relevance scoring**: Los resultados más relevantes primero.
- **Full-text search**: Entiende el lenguaje natural.
- **Faceted search**: Filtros por categorías con conteos.
- **Auto-suggest**: Sugerencias mientras escribes.
- **Aggregations**: Analytics en tiempo real.

### Solr

Alternativa a Elasticsearch, también basado en Lucene. Históricamente popular en empresas; Elasticsearch tiene mayor adopción moderna.

**Cuándo usar motores de búsqueda dedicados:**

- Búsqueda en millones de documentos
- Necesitas relevance ranking
- Búsqueda multiidioma
- E-commerce con búsqueda de productos

---

## 14. Real-Time Data

### ¿Qué es la comunicación en tiempo real?

El servidor puede enviar datos al cliente sin que el cliente los solicite explícitamente. Esencial para chat, notificaciones, dashboards en vivo, juegos.

---

### WebSockets

Protocolo que establece una conexión bidireccional persistente entre cliente y servidor. Ambos pueden enviar datos en cualquier momento.

**Analogía**: Una llamada telefónica (ambos pueden hablar cuando quieran) vs. HTTP que es como enviar cartas (esperas respuesta a cada carta).

```typescript
// Backend (NestJS + Socket.io)
@WebSocketGateway({ cors: true })
export class NotificacionesGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Cliente conectado
    console.log(`Cliente conectado: ${client.id}`);
  }

  // Emitir evento a un usuario específico
  emitirNotificacion(usuarioId: number, mensaje: string) {
    this.server.to(`usuario:${usuarioId}`).emit('notificacion', {
      mensaje,
      timestamp: new Date(),
    });
  }
}

// Frontend (React + socket.io-client)
const socket = io('http://localhost:4000', {
  auth: { token: localStorage.getItem('access_token') },
});

socket.on('notificacion', (data) => {
  console.log('Nueva notificación:', data.mensaje);
  toast.info(data.mensaje);
});
```

**Casos de uso:** Chat en tiempo real, notificaciones push, dashboards live, colaboración simultánea (Google Docs), juegos online.

---

### Server-Sent Events (SSE)

Conexión unidireccional: solo el servidor envía eventos al cliente. Más simple que WebSockets cuando no necesitas envío desde el cliente.

```typescript
// Backend: endpoint SSE
@Get('/events')
serverSentEvents(@Res() res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  // Enviar evento cada segundo
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
  }, 1000);

  res.on('close', () => clearInterval(interval));
}

// Frontend: escuchar SSE
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.timestamp);
};
```

**Casos de uso:** Barras de progreso, feeds de noticias, actualizaciones de estado, logs en vivo.

---

### Long Polling

Técnica que simula tiempo real con HTTP. El cliente hace un request y el servidor lo mantiene abierto hasta que hay datos nuevos (o hasta timeout).

```typescript
// Cliente hace request y espera...
const response = await fetch('/api/messages/poll?since=timestamp');
// El servidor puede tardar hasta 30 segundos en responder si no hay mensajes nuevos
// Cuando hay mensajes, responde inmediatamente
// El cliente inmediatamente hace otro request (polling continuo)
```

**Comparación:**

| Técnica       | Bidireccional         | Overhead                    | Casos de uso                     |
| ------------- | --------------------- | --------------------------- | -------------------------------- |
| WebSockets    | Sí                    | Bajo (conexión persistente) | Chat, juegos, notificaciones     |
| SSE           | Solo servidor→cliente | Muy bajo                    | Feeds, progreso, logs            |
| Long Polling  | Solo cliente→servidor | Alto (muchos requests)      | Fallback cuando WS no disponible |
| Short Polling | No (cliente pregunta) | Muy alto                    | Simple, no recomendado           |

---

## 15. Scaling Databases

### ¿Cuándo escalar la base de datos?

Cuando una sola instancia de DB no puede manejar la carga: queries lentas, demasiadas conexiones, tamaño de datos inmanejable.

---

### Database Indexes

Un índice es una estructura de datos adicional que permite encontrar registros más rápido, a cambio de más espacio en disco y escrituras más lentas.

**Analogía**: El índice de un libro. Sin él, buscar "PostgreSQL" requiere leer cada página. Con él, vas directamente a la página correcta.

```sql
-- Sin índice: Escanea TODA la tabla para encontrar un email
-- En 1 millón de registros → 1,000,000 comparaciones (lento)
SELECT * FROM usuarios WHERE email = 'ana@email.com';

-- Crear índice
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Con índice: B-tree busca en ~20 comparaciones (logarítmico)
-- En 1 millón de registros → ~20 comparaciones (instantáneo)
SELECT * FROM usuarios WHERE email = 'ana@email.com';
```

**Tipos de índices en PostgreSQL:**

- **B-tree**: Default, para comparaciones `=`, `<`, `>`, `BETWEEN`.
- **Hash**: Solo para igualdad exacta `=`.
- **GIN**: Para búsqueda full-text y arrays.
- **Índice compuesto**: Múltiples columnas para filtros combinados.

```sql
-- Índice compuesto para queries frecuentes
CREATE INDEX idx_negocios_cliente_etapa ON negocios(cliente_id, etapa);
-- Optimiza: WHERE cliente_id = X AND etapa = 'PROPUESTA'
```

**Regla**: No pongas índices en todo. Cada índice ralentiza las escrituras (INSERT/UPDATE/DELETE).

---

### Data Replication

Mantener copias sincronizadas de la DB en múltiples servidores.

```
Primary (escrituras + lecturas)
    │
    ├─── Replica 1 (solo lecturas) ← 10% del tráfico
    ├─── Replica 2 (solo lecturas) ← 10% del tráfico
    └─── Replica 3 (failover)      ← Backup en caso de fallo del primary
```

**Por qué**: Distribuir la carga de lectura (que es el 90% del tráfico en la mayoría de apps). Alta disponibilidad (si el primary falla, una réplica toma el control).

---

### Sharding Strategies

Dividir los datos horizontalmente entre múltiples instancias de DB. Cada "shard" tiene una porción de los datos.

```
Sin sharding:         Con sharding:
┌────────────┐       ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Toda la DB │       │ Shard 1  │  │ Shard 2  │  │ Shard 3  │
│ 1TB datos  │  →    │ A-H      │  │ I-P      │  │ Q-Z      │
│ 1 servidor │       │ IDs 1-1M │  │ IDs 1M-2M│  │ IDs 2M+  │
└────────────┘       └──────────┘  └──────────┘  └──────────┘
```

**Estrategias de sharding:**

- **Range-based**: Por rango de IDs o fechas.
- **Hash-based**: `shard = hash(clienteId) % numShards`.
- **Geographic**: Por región (datos de LATAM en un shard, USA en otro).

**Desventaja**: Queries que cruzan shards son complejas. Solo justificado a escala masiva.

---

### CAP Theorem

Ley fundamental de sistemas distribuidos. Un sistema distribuido solo puede garantizar 2 de estas 3 propiedades simultáneamente:

| Propiedad               | Descripción                                               |
| ----------------------- | --------------------------------------------------------- |
| **C**onsistency         | Todos los nodos ven los mismos datos al mismo tiempo      |
| **A**vailability        | El sistema siempre responde (aunque sea con datos viejos) |
| **P**artition tolerance | El sistema funciona aunque haya fallo de red entre nodos  |

```
Opciones reales (P siempre se elige en sistemas distribuidos):
- CP (Consistencia + Partición): PostgreSQL, HBase
  → Prefiere datos correctos sobre disponibilidad
  → Si hay partición de red, puede rechazar requests

- AP (Disponibilidad + Partición): Cassandra, DynamoDB, CouchDB
  → Prefiere disponibilidad sobre datos perfectamente consistentes
  → Puede devolver datos desactualizados pero siempre responde
```

**Ejemplo práctico**:

- Sistema bancario → CP (mejor rechazar la transacción que perder dinero)
- Red social → AP (mejor mostrar un like desactualizado que no cargar la página)

---

## 16. NoSQL Databases

### ¿Por qué NoSQL?

Las bases de datos relacionales son excelentes para datos estructurados y relacionados. NoSQL ofrece flexibilidad para diferentes patrones de datos:

- Documentos JSON sin schema fijo
- Datos de grafos (conexiones entre nodos)
- Series temporales (métricas por tiempo)
- Pares clave-valor ultrarrápidos

**"NoSQL" no significa "sin SQL"**, significa "Not Only SQL". Muchas bases NoSQL tienen su propio lenguaje de consulta.

---

### Document Databases

Almacenan documentos JSON/BSON. Cada documento puede tener estructura diferente.

**MongoDB:**

```javascript
// Insertar documento (no necesita schema predefinido)
db.clientes.insertOne({
  nombre: 'Ana García',
  email: 'ana@email.com',
  direcciones: [
    // Arrays embebidos
    { tipo: 'casa', ciudad: 'Bogotá' },
    { tipo: 'oficina', ciudad: 'Medellín' },
  ],
  preferencias: {
    // Objetos anidados
    idioma: 'es',
    moneda: 'COP',
  },
});

// Query flexible
db.clientes.find({
  'direcciones.ciudad': 'Bogotá',
  'preferencias.moneda': 'COP',
});
```

**Ideal para**: CMS, catálogos de productos con atributos variables, perfiles de usuario complejos.

---

### Key-Value Stores

El modelo más simple: una clave → un valor. Ultrarrápidos para acceso por clave exacta.

**Redis** (también usado como caché - ver bloque 5):

```bash
SET session:user:42 '{"id":42,"email":"ana@email.com","rol":"ADMIN"}'  EX 3600
GET session:user:42
DEL session:user:42
```

**DynamoDB** (AWS): Managed key-value a escala masiva. Sin gestión de infraestructura.

**Ideal para**: Sesiones, caché, configuraciones, carritos de compra temporales.

---

### Realtime Databases

**Firebase Realtime Database / Firestore** (Google):

```javascript
// Los datos se sincronizan automáticamente en todos los clientes
const db = firebase.firestore();

// Escuchar cambios en tiempo real
db.collection('mensajes').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      console.log('Nuevo mensaje:', change.doc.data());
    }
  });
});
```

**Ideal para**: Apps móviles con sincronización offline, chat, colaboración en tiempo real.

---

### Column Databases

Almacenan datos por columnas en lugar de filas. Extremadamente eficientes para analytics y agregaciones en datasets enormes.

**Cassandra / ScyllaDB:**

```sql
-- Diseñadas para escrituras masivas y queries por partition key
CREATE TABLE metricas_servidor (
  servidor_id text,
  timestamp   timestamp,
  cpu_uso     float,
  mem_uso     float,
  PRIMARY KEY (servidor_id, timestamp)  -- Partition key + Clustering key
);

-- Query eficiente en millones de filas
SELECT * FROM metricas_servidor
WHERE servidor_id = 'web-01'
AND timestamp > '2026-01-01';
```

**ClickHouse**: Optimizado para OLAP (analytics), puede consultar billones de filas en segundos.

---

### Graph Databases

Almacenan nodos y relaciones (edges). Eficientes para consultas de grafos (amigos de amigos, rutas, recomendaciones).

**Neo4j:**

```cypher
// Crear nodos y relaciones
CREATE (ana:Usuario {nombre: "Ana"})
CREATE (carlos:Usuario {nombre: "Carlos"})
CREATE (ana)-[:SIGUE]->(carlos)
CREATE (carlos)-[:COMPRÓ]->(producto:Producto {nombre: "Laptop"})

// Query: ¿Qué compraron las personas que Ana sigue?
MATCH (ana:Usuario {nombre: "Ana"})-[:SIGUE]->(amigo)-[:COMPRÓ]->(p:Producto)
RETURN p.nombre
```

**Ideal para**: Redes sociales, motores de recomendación, detección de fraude, knowledge graphs.

---

### Time Series Databases

Optimizadas para datos con marca de tiempo que llegan continuamente (métricas, logs, IoT).

**InfluxDB:**

```sql
-- Insertar métrica
INSERT cpu_usage,host=server01 value=85.3 1672531200000000000

-- Query con downsampling
SELECT MEAN(value)
FROM cpu_usage
WHERE time > now() - 7d
GROUP BY time(1h), host
```

**TimescaleDB**: Extensión de PostgreSQL para time series. Si ya usas Postgres, es la opción más fácil.

**Ideal para**: Monitoreo de infraestructura, IoT, analytics financiero, telemetría.

---

## 17. Building For Scale

### ¿Qué significa "construir para escalar"?

Diseñar sistemas que puedan manejar incrementos de carga sin fallar catastróficamente. También implica conocer qué está pasando en el sistema en todo momento (observability).

---

### Observability (Observabilidad)

La capacidad de entender el estado interno de un sistema a partir de sus salidas externas. Tiene tres pilares:

#### 1. Logging (Registros)

Registrar eventos significativos del sistema de forma estructurada.

```typescript
// ❌ Console.log: difícil de filtrar, sin contexto
console.log('Error al crear cliente');

// ✅ Structured logging con Winston: búsqueda y filtrado eficiente
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

logger.error('Error al crear cliente', {
  error: error.message,
  stack: error.stack,
  usuarioId: 42,
  email: 'ana@email.com',
  timestamp: new Date().toISOString(),
});

// Output: {"level":"error","message":"Error al crear cliente","usuarioId":42,"email":"ana@email.com","timestamp":"2026-01-01T..."}
// → Fácil de buscar en Elasticsearch, Datadog, etc.
```

#### 2. Metrics (Métricas)

Mediciones numéricas del comportamiento del sistema en el tiempo.

```typescript
// Prometheus: sistema de métricas open source
import { Counter, Histogram } from 'prom-client';

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP',
  labelNames: ['method', 'route', 'status'],
});

const responseTime = new Histogram({
  name: 'http_response_time_seconds',
  help: 'Tiempo de respuesta HTTP en segundos',
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

// Usar en middleware
app.use((req, res, next) => {
  const end = responseTime.startTimer();
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
    end({ route: req.path });
  });
  next();
});
```

**Dashboards con Grafana**: Visualiza las métricas de Prometheus en gráficas en tiempo real.

#### 3. Distributed Tracing (Rastreo Distribuido)

En sistemas con múltiples servicios, un request puede pasar por 5-10 servicios. El tracing sigue el flujo completo.

```
Request de usuario
    ↓
API Gateway (10ms)
    ↓
Auth Service (5ms)
    ↓
Cliente Service (15ms)
    ├── DB Query 1 (8ms)
    └── Redis Cache (2ms)
    ↓
Email Service (100ms)  ← CUELLO DE BOTELLA

Total: 130ms → ¿Por qué es lento? OpenTelemetry te lo dice.
```

**OpenTelemetry**: Estándar open source para instrumentar aplicaciones. Compatible con Jaeger, Zipkin, Datadog.

---

### Mitigation Strategies (Estrategias de Mitigación)

Cómo el sistema se protege bajo carga extrema o fallos parciales.

#### Graceful Degradation (Degradación Elegante)

Cuando una funcionalidad no-crítica falla, el sistema sigue funcionando con capacidad reducida.

```typescript
async getDashboard(userId: number) {
  const [clientes, negocios, recomendaciones] = await Promise.allSettled([
    this.clientesService.findAll(),          // Crítico
    this.negociosService.findAll(),          // Crítico
    this.recomendacionesService.get(userId)  // No crítico (puede fallar)
  ]);

  return {
    clientes: clientes.status === 'fulfilled' ? clientes.value : [],
    negocios: negocios.status === 'fulfilled' ? negocios.value : [],
    // Si recomendaciones falla, mostramos array vacío en lugar de error 500
    recomendaciones: recomendaciones.status === 'fulfilled' ? recomendaciones.value : []
  };
}
```

#### Throttling / Rate Limiting

Limitar cuántas requests puede hacer un cliente en un período de tiempo. Previene abuso, ataques de fuerza bruta y sobrecarga.

```typescript
// NestJS con @nestjs/throttler
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,    // Ventana de 60 segundos
      limit: 100, // Máximo 100 requests por ventana por IP
    }),
  ],
})

// Límites específicos por endpoint
@Post('/auth/login')
@Throttle(5, 60)  // Solo 5 intentos de login por minuto
async login(@Body() dto: LoginDto) { ... }
```

**Respuesta al cliente superando el límite:**

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1672531245
```

#### Backpressure

Mecanismo para que los consumidores controlen la velocidad de los productores cuando se saturan.

**Analogía**: Una manguera conectada a un hidrante. Si abres el hidrante a máxima presión pero la manguera es pequeña, se rompe. Backpressure es el mecanismo que reduce la presión del hidrante cuando la manguera no puede más.

```typescript
// Node.js Streams: backpressure automático
const readable = fs.createReadStream('huge-file.csv');
const writable = fs.createWriteStream('output.csv');

// pipe() maneja backpressure automáticamente
// Si writable no puede escribir más rápido de lo que readable lee, pausa la lectura
readable.pipe(transform).pipe(writable);
```

#### Loadshifting (Desplazamiento de Carga)

Mover trabajo costoso a momentos de menor demanda o a procesos en background.

```typescript
// ❌ Procesar reporte en el request HTTP (bloquea al usuario 30 segundos)
@Get('/reportes/anual')
async getAnnualReport() {
  return await this.reportesService.generateHeavyReport(); // 30 segundos
}

// ✅ Encolar el trabajo y notificar cuando esté listo
@Post('/reportes/anual')
async requestAnnualReport(@User() user) {
  const jobId = await this.queue.add('generate-report', { userId: user.id });
  return { jobId, message: 'Reporte en proceso. Te notificaremos cuando esté listo.' };
  // El worker procesa el reporte en background
  // Notificación vía WebSocket / email cuando termina
}
```

#### Circuit Breaker (Disyuntor)

Patrón que previene que un servicio fallido sature el sistema. Si un servicio falla repetidamente, el circuit breaker "abre" y rechaza requests por un tiempo, permitiendo que el servicio se recupere.

```typescript
// Con la librería 'opossum'
import CircuitBreaker from 'opossum';

const callPaymentService = async (data) => {
  return await fetch('http://payment-service/charge', { ... });
};

const breaker = new CircuitBreaker(callPaymentService, {
  timeout: 3000,                // Si tarda más de 3s → fallo
  errorThresholdPercentage: 50, // Si 50% de requests fallan → abrir circuito
  resetTimeout: 30000           // Intentar de nuevo en 30s
});

// Estados del circuit breaker:
// CLOSED (normal): Los requests pasan
// OPEN (fallo detectado): Los requests son rechazados inmediatamente
// HALF-OPEN (probando): Deja pasar algunos requests para ver si se recuperó

breaker.fallback(() => ({ error: 'Servicio de pagos no disponible. Intente más tarde.' }));
```

```
Estado normal (CLOSED):
Request → [Circuit Breaker] → Payment Service → Response

Después de múltiples fallos (OPEN):
Request → [Circuit Breaker] → Response inmediata: "Servicio no disponible"
                           ← No llega al servicio (que ya está saturado)
```

---

## Resumen: El Path del Backend Developer

```
Fundamentos (Todos los proyectos):
✅ Git + GitHub             → Control de versiones profesional
✅ Relational DB (PostgreSQL) → Almacenamiento de datos estructurados
✅ REST APIs + JWT          → Comunicación e identidad
✅ Testing                  → Calidad garantizada

Infraestructura (Proyectos en producción):
✅ Docker                   → Portabilidad y reproducibilidad
✅ CI/CD                    → Automatización de calidad y deploys
✅ Nginx                    → Reverse proxy y servir assets
✅ Redis (caché)            → Performance

Escala media (Apps con usuarios reales):
✅ WebSockets               → Tiempo real
✅ Message Brokers          → Comunicación asíncrona
✅ Structured logging       → Observabilidad básica

Escala grande (Alto tráfico):
✅ Elasticsearch            → Búsqueda avanzada
✅ DB Indexes + Replicación → Performance de base de datos
✅ Rate Limiting            → Protección contra abuso
✅ Circuit Breakers         → Resiliencia ante fallos
✅ Distributed Tracing      → Observabilidad avanzada

Enterprise/Avanzado:
✅ Microservices            → Escala organizacional
✅ Kubernetes               → Orquestación de contenedores
✅ Sharding                 → Escala de datos masiva
✅ NoSQL (según caso)       → Modelos de datos especializados
```

---

**Fin del documento** | 17 bloques del Backend Roadmap 2026 | Guía educativa en español
