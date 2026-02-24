# 📚 Guías - ClientPro CRM

Guías rápidas para desarrolladores y usuarios del sistema.

---

## 📂 Categorías

### 🎯 UX/UI - Guías de Usuario

- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** - Guía de accesibilidad (WCAG 2.1)
- **[KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md)** - Atajos de teclado del sistema

### 🔀 Git - Guías de Desarrollo

- **[git/](./git/)** - Flujo de trabajo Git y hooks automáticos
  - [GIT_WORKFLOW.md](./git/GIT_WORKFLOW.md) - Estrategia de branching
  - [GIT_HOOKS.md](./git/GIT_HOOKS.md) - Hooks con Husky

### 🚀 DevOps - Guías de Infraestructura

- **[docker/](./docker/)** - Containerización con Docker
  - [DOCKER.md](./docker/DOCKER.md) - Guía completa de Docker Compose
- **[ci-cd/](./ci-cd/)** - Integración y Despliegue Continuo
  - [GITHUB_ACTIONS.md](./ci-cd/GITHUB_ACTIONS.md) - Workflows de CI/CD

---

## 🚀 Inicio Rápido

### Para Nuevos Desarrolladores

1. Lee **[git/GIT_WORKFLOW.md](./git/GIT_WORKFLOW.md)** para entender el flujo de trabajo
2. Lee **[git/GIT_HOOKS.md](./git/GIT_HOOKS.md)** para entender las validaciones automáticas
3. Lee **[ci-cd/GITHUB_ACTIONS.md](./ci-cd/GITHUB_ACTIONS.md)** para entender CI/CD
4. Lee **[docker/DOCKER.md](./docker/DOCKER.md)** si trabajas con contenedores

### Para Usuarios Finales

1. Lee **[KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md)** para navegar más rápido
2. Lee **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** si usas tecnologías asistivas

---

## 📝 Agregar Nueva Guía

Si quieres agregar una nueva guía:

1. **Determina la categoría**:
   - UX/UI → Raíz de `guides/`
   - Git/Development → `guides/git/`
   - DevOps/Docker → `guides/docker/`
   - CI/CD → `guides/ci-cd/`
   - Testing → Crear `guides/testing/` si es necesario

2. **Usa el formato de nombre**:
   - `NOMBRE_GUIA.md` (MAYÚSCULAS_CON_UNDERSCORES)
   - Ejemplo: `API_REFERENCE.md`, `DEPLOYMENT_GUIDE.md`

3. **Incluye en el documento**:
   - Título claro con emoji
   - Sección "¿Para quién es esta guía?"
   - Tabla de contenidos
   - Ejemplos de código (si aplica)
   - Última actualización y versión

4. **Actualiza este README** con un enlace a la nueva guía

---

**Última actualización**: Febrero 24, 2026  
**Versión**: 1.1.0
