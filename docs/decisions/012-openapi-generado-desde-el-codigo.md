# ADR-012: Generar la referencia de API desde el código en vez de escribirla

**Estado**: Aceptado
**Fecha**: 2026-07-17
**Decisores**: Líder del Proyecto
**Etiquetas**: backend, tooling, documentation

---

## Contexto

**Antecedentes**:

La documentación escrita a mano de este repositorio miente, y no por descuido puntual: es un patrón medible.

`AGENTS.md` y `docs/context/DATABASE.md` fueron escritos por separado, en momentos distintos, y **ambos declaran exactamente los mismos valores de enum inexistentes**:

| Documento | Afirma | Realidad (`backend/prisma/schema.prisma`) |
|---|---|---|
| `AGENTS.md`, `docs/context/DATABASE.md:161-166` | `EtapaNegocio` incluye `CALIFICACION`, `CERRADO_GANADO`, `CERRADO_PERDIDO` | `PROSPECTO`, `CONTACTO_REALIZADO`, `PROPUESTA`, `NEGOCIACION`, `GANADO`, `PERDIDO` |
| `AGENTS.md`, `docs/context/DATABASE.md:200` | `TipoMoneda` incluye `COP` | Solo `MXN`, `USD`, `EUR` |

Que dos autores independientes produzcan la misma mentira idéntica descarta el error humano como causa. La causa es estructural: **ambos copiaron el schema en vez de apuntar a él**, creando un segundo lugar donde vive la verdad. Cuando hay dos, divergen — el código cambia con un commit, el documento necesita que alguien se acuerde.

El costo no fue teórico. Escribir el fix de REM-004 desde `AGENTS.md` habría producido `etapas.CERRADO_GANADO`: código que no compila contra el schema real.

En contraste, `docs/decisions/004-prisma-orm.md` tiene seis meses y sigue siendo exacto, porque documenta **por qué** se eligió Prisma, no **qué** hace el código.

**Requisitos**:

- La superficie de la API (rutas, payloads, enums, obligatoriedad) debe ser consultable sin leer los controllers.
- Debe ser **imposible** que quede desactualizada respecto al código.
- No debe requerir disciplina humana para mantenerse: toda solución que dependa de que alguien se acuerde ya falló acá dos veces.
- No debe aumentar la superficie de ataque en producción.

**Restricciones**:

- El backend ya declara sus contratos vía `@Controller`, tipos de TypeScript y decoradores de `class-validator`. Esa información ya existe; el problema es que no es consultable.
- Anotar a mano cada DTO con `@ApiProperty` reintroduce el problema original: sería otra copia escrita a mano que puede divergir.

---

## Decisión

Adoptar `@nestjs/swagger` **con el CLI plugin activado** (`nest-cli.json` → `compilerOptions.plugins`), y exponer la UI en `/docs` con el JSON en `/docs-json`.

El plugin es la parte esencial de la decisión, no un detalle de implementación. Deriva cada schema de los tipos de TypeScript y los decoradores de `class-validator` **que ya existen**. No se escribe ni un `@ApiProperty`. Que no haya nada escrito a mano es precisamente lo que hace que no pueda desactualizarse: no hay una segunda copia que pueda divergir de la primera.

**Gate de exposición**: apagado cuando `NODE_ENV=production`, con `SWAGGER_ENABLED=true` como override explícito. La spec enumera cada ruta y cada forma de payload — material de reconocimiento para un atacante. `docker-compose.yml` corre con `NODE_ENV=production` incluso localmente, así que sin el override el equipo nunca la vería; de ahí la variable.

---

## Consecuencias

**Positivas**:

- La referencia de API no puede mentir. Verificado el 2026-07-17: la spec generada declara `etapa: ["PROSPECTO","CONTACTO_REALIZADO","PROPUESTA","NEGOCIACION","GANADO","PERDIDO"]` y `moneda: ["MXN","USD","EUR"]` — exactamente el enum sobre el que los dos documentos escritos a mano mienten.
- 34 endpoints y 15 DTOs quedaron documentados sin escribir una línea.
- Si alguien agrega un valor al enum o una ruta, aparece solo. Si lo saca, desaparece solo.
- Habilita borrar `docs/context/DATABASE.md` (339 líneas) en vez de corregirlo. Corregirlo solo reinicia el reloj hasta la próxima divergencia.

**Negativas**:

- Seis paquetes npm más en dependencias de producción.
- El gate es una variable de entorno más que hay que entender al desplegar. Un despliegue con `SWAGGER_ENABLED=true` por error expone la superficie de la API.
- El plugin corre en tiempo de compilación: un build hecho sin `nest-cli.json` (por ejemplo, invocando `tsc` directo) produce una spec sin los tipos introspectados. La spec sale vacía o incompleta, no incorrecta.

**Neutras**:

- No cubre el frontend. `docs/context/ARCHITECTURE.md` y `STACK.md` siguen escritos a mano y siguen expuestos a la misma pudrición; se evalúan aparte.
- No documenta el **porqué** de nada. Esa sigue siendo la función de estos ADRs, y sigue siendo la única documentación que legítimamente se escribe a mano.

---

## Alternativas consideradas

**Corregir `DATABASE.md` y `AGENTS.md` a mano**: rechazada. Es lo que ya se hizo antes y produjo el estado actual. Corregir el contenido no toca la causa — la existencia de una segunda copia — así que solo reinicia el reloj.

**`@nestjs/swagger` sin el CLI plugin, anotando DTOs con `@ApiProperty`**: rechazada. Los decoradores escritos a mano son otra copia que puede divergir del tipo que anotan. Habría movido la mentira de un `.md` a un `.ts`, que es peor: ahí parece código y se le cree más.

**Exponer `/docs` siempre**: rechazada. Regala enumeración de rutas y formas de payload en un repositorio público con secretos placeholder (REM-015).

---

## Referencias

- `backend/nest-cli.json` — activación del plugin
- `backend/src/main.ts` — cableado y gate de exposición
- `docs/remediacion/PLAN-DE-REMEDIACION.md` — REM-010 (docs desactualizados), REM-015 (secretos)
- `docs/archive/auditorias/2026-07-15-auditoria-remediacion.md` — el ciclo perdido por confiar en docs escritos a mano
