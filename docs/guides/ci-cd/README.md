# CI/CD - Guías de Integración Continua

Esta carpeta contiene guías relacionadas con CI/CD (Continuous Integration/Continuous Deployment) para ClientPro CRM.

---

## 📚 Guías Disponibles

### [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md)
**Guía completa de GitHub Actions workflows**

**Contenido**:
- Introducción a CI/CD y GitHub Actions
- Workflows implementados (test.yml, lint.yml, build.yml)
- Configuración de Dependabot
- Branch Protection Rules
- Troubleshooting común
- Badges en README

**Cuándo leer**:
- Antes de crear tu primer PR
- Cuando un workflow falla en GitHub
- Para entender cómo funcionan las validaciones automáticas
- Si necesitas configurar Branch Protection

---

## 🚀 Inicio Rápido

### Para Desarrolladores

Si eres nuevo en el proyecto:

1. **Lee [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md)** para entender:
   - Qué validaciones se ejecutan en cada push
   - Cómo interpretar resultados de workflows
   - Cómo resolver errores comunes

2. **Ejecuta validaciones locales** antes de push:
   ```bash
   # Backend
   cd backend
   npm run lint
   npm run test:cov
   npm run build

   # Frontend
   cd frontend
   npm run lint
   npm run test:coverage
   npm run build
   ```

3. **Configura Git Hooks** (Husky):
   - Ver: `docs/guides/git/GIT_HOOKS.md`
   - Los hooks ejecutan las mismas validaciones localmente

### Para Mantainers

Si administras el repositorio:

1. **Configura Branch Protection** (ver GITHUB_ACTIONS.md):
   - Settings → Branches → Add rule
   - Requiere que todos los checks pasen
   - Requiere aprobaciones en PRs

2. **Revisa PRs de Dependabot**:
   - Ejecutan automáticamente cada lunes 9 AM
   - Valida que CI/CD pase antes de mergear

---

## 📊 Workflows Actuales

| Workflow | Archivo | Trigger | Duración |
|----------|---------|---------|----------|
| Tests | test.yml | push/PR a master/develop | 3-5 min |
| Linting | lint.yml | push/PR a master/develop | 2-3 min |
| Build | build.yml | push/PR a master/develop | 4-6 min |
| Dependabot | dependabot.yml | Semanal (lunes 9 AM) | N/A |

---

## 🔗 Guías Relacionadas

- **[git/GIT_WORKFLOW.md](../git/GIT_WORKFLOW.md)** - Flujo de trabajo Git
- **[git/GIT_HOOKS.md](../git/GIT_HOOKS.md)** - Hooks automáticos con Husky
- **[docker/DOCKER.md](../docker/DOCKER.md)** - Containerización

---

**Última actualización**: Febrero 24, 2026  
**Versión**: 1.0.0
