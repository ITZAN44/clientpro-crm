# 🔀 Guías de Git - ClientPro CRM

Guías completas para el flujo de trabajo de Git y automatizaciones con Husky.

---

## 📄 Documentos Disponibles

### 1. [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)

**Estrategia de branching y convenciones**

**Contenido**:

- Git Flow adaptado para equipos pequeños
- Ramas principales: `master`, `staging`, `develop`
- Ramas de trabajo: `feature/*`, `bugfix/*`, `hotfix/*`, `release/*`
- Convenciones de commits (Conventional Commits)
- Tagging y versionado semántico
- Comandos útiles de Git

**Lee esto si**:

- ✅ Eres nuevo en el proyecto
- ✅ Vas a crear un nuevo feature o bugfix
- ✅ Necesitas entender el flujo de ramas
- ✅ Quieres saber cómo escribir commits correctos

---

### 2. [GIT_HOOKS.md](./GIT_HOOKS.md)

**Hooks automáticos con Husky y lint-staged**

**Contenido**:

- Hooks configurados (pre-commit, commit-msg, pre-push)
- Qué se ejecuta en cada hook
- Cómo desactivar hooks temporalmente (casos de emergencia)
- Troubleshooting de problemas comunes

**Lee esto si**:

- ✅ Quieres entender qué hace Husky
- ✅ Tus commits están siendo rechazados
- ✅ Necesitas bypassear hooks temporalmente (¡con cuidado!)
- ✅ Quieres agregar nuevas validaciones

---

## 🚀 Quick Start

### Para nuevos desarrolladores

1. **Clona el repositorio**:

```bash
git clone <url-del-repo>
cd Desarrollo-Wep
```

2. **Instala dependencias** (incluye Husky):

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. **Crea tu primera rama**:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-primera-feature
```

4. **Lee las guías**:

- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Flujo de trabajo completo
- [GIT_HOOKS.md](./GIT_HOOKS.md) - Qué esperar de los hooks

---

## ⚠️ Reglas Importantes

### ❌ Prohibido

- Commits directos a `master` (protegida)
- Push sin pasar validaciones de TypeScript
- Commits que no sigan Conventional Commits
- Bypassear hooks sin razón justificada

### ✅ Requerido

- Crear PR para merge a `master` o `staging`
- Escribir commits descriptivos en español
- Usar tipos de commit correctos: `feat`, `fix`, `docs`, `refactor`, etc.
- Pasar linting y build antes de push

---

## 📚 Referencias Externas

- [Git Flow Original](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)

---

**Última actualización**: Febrero 23, 2026  
**Versión**: 1.0.0
