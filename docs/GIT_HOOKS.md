# Git Hooks - ClientPro CRM

Este proyecto usa **Husky** y **lint-staged** para asegurar la calidad del código antes de cada commit y push.

## Hooks Configurados

### 1. Pre-commit Hook

**Ejecuta**: `lint-staged`

**Qué hace**:

- Ejecuta ESLint en archivos TypeScript modificados (backend y frontend)
- Ejecuta Prettier en archivos modificados
- Auto-fix de problemas de lint cuando es posible
- Formatea archivos markdown

**Archivos afectados**:

- `backend/**/*.{ts,js}` → ESLint + Prettier
- `frontend/**/*.{ts,tsx,js,jsx}` → ESLint
- `*.md` → Prettier

**Si falla**: El commit es bloqueado hasta que se corrijan los errores.

**Bypass** (no recomendado):

```bash
git commit --no-verify -m "mensaje"
```

---

### 2. Commit-msg Hook

**Ejecuta**: Validación de mensaje de commit

**Qué hace**:

- Valida que el mensaje de commit siga Conventional Commits
- Verifica el formato: `<type>(<scope>): <subject>`
- Requiere un tipo válido: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

**Ejemplos válidos**:

```bash
feat(clientes): add advanced filter functionality
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
refactor(negocios): extract Kanban logic to hook
test(notificaciones): add WebSocket gateway tests
```

**Ejemplos inválidos**:

```bash
Update client page  ❌ No type
added new feature   ❌ Incorrect type
feat: very long subject that exceeds the maximum length allowed  ❌ Too long
```

**Si falla**: El commit es bloqueado y se muestra un mensaje de ayuda.

---

### 3. Pre-push Hook

**Ejecuta**: Verificación de TypeScript y protección de ramas

**Qué hace**:

1. **Bloquea push directo a `master`**: Requiere crear un Pull Request
2. **TypeScript check (backend)**: Ejecuta `npm run build` en backend
3. **TypeScript check (frontend)**: Ejecuta `npm run build` en frontend

**Si falla**:

- Push a master → Bloqueado, crear PR
- Errores de TypeScript → Bloqueado hasta corregir errores

**Bypass** (no recomendado):

```bash
git push --no-verify
```

---

## Configuración de lint-staged

Archivo: `package.json` (sección `lint-staged`)

```json
{
  "lint-staged": {
    "backend/**/*.{ts,js}": ["cd backend && npm run lint --fix", "cd backend && npm run format"],
    "frontend/**/*.{ts,tsx,js,jsx}": ["cd frontend && npm run lint --fix"],
    "*.md": ["prettier --write"]
  }
}
```

---

## Instalación Manual

Si clonaste el repositorio y los hooks no funcionan:

```bash
# Instalar dependencias
npm install

# Reinstalar Husky
npm run prepare

# Dar permisos de ejecución a los hooks (Linux/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

---

## Desactivar Hooks Temporalmente

### Opción 1: Variable de entorno (recomendado)

```bash
# Desactivar para un solo comando
HUSKY=0 git commit -m "mensaje"

# Desactivar para toda la sesión de terminal (Windows)
set HUSKY=0

# Desactivar para toda la sesión de terminal (Linux/Mac)
export HUSKY=0
```

### Opción 2: Flag --no-verify (no recomendado)

```bash
git commit --no-verify -m "mensaje"
git push --no-verify
```

**⚠️ Advertencia**: Solo desactivar hooks en casos excepcionales. Los hooks están diseñados para prevenir problemas en producción.

---

## Comandos Útiles

### Ejecutar lint manualmente

```bash
# Backend
cd backend && npm run lint
cd backend && npm run lint --fix

# Frontend
cd frontend && npm run lint
cd frontend && npm run lint --fix
```

### Ejecutar tests manualmente

```bash
# Backend
npm run test:backend

# Frontend
npm run test:frontend
```

### Ejecutar build manualmente

```bash
# Ambos
npm run build

# Solo backend
npm run backend:build

# Solo frontend
npm run frontend:build
```

### Formatear código manualmente

```bash
# Backend (Prettier)
cd backend && npm run format

# Markdown (desde raíz)
npx prettier --write "**/*.md"
```

---

## Troubleshooting

### Hook no se ejecuta

1. Verificar que `.husky` tiene permisos de ejecución (Linux/Mac)
2. Ejecutar `npm run prepare`
3. Verificar que Git versión sea >= 2.9

### lint-staged falla

1. Verificar que las rutas en `package.json` sean correctas
2. Ejecutar lint manualmente para ver el error específico
3. Verificar que las dependencias estén instaladas en backend/frontend

### Pre-push tarda mucho

El build completo puede tardar 30-60 segundos. Esto es normal porque TypeScript compila todo el código.

**Alternativa**: Modificar `.husky/pre-push` para ejecutar solo `tsc --noEmit` en lugar de build completo:

```bash
# Reemplazar en .husky/pre-push
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

---

## Referencias

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

---

**Última actualización**: Febrero 23, 2026  
**Versión del documento**: 1.0.0
