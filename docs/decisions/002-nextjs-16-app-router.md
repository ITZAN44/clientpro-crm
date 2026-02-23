# ADR-002: Elegir Next.js 16 con App Router para Frontend

**Estado**: Aceptado  
**Fecha**: 06 de enero de 2026  
**Decisores**: Líder del Proyecto  
**Etiquetas**: frontend, framework

---

## Contexto

**Antecedentes**:
- Necesidad de framework frontend moderno para CRM
- Requiere Server-Side Rendering (SSR) para SEO y performance
- Equipo familiarizado con React
- Proyecto necesita routing, data fetching y optimización de imágenes

**Requisitos**:
- **React 19**: Aprovechar últimas features de React
- **TypeScript**: Tipado fuerte en frontend
- **SSR/SSG**: Renderizado servidor para performance
- **Routing moderno**: File-based routing, layouts anidados
- **Optimizaciones**: Imágenes, fonts, code splitting automático
- **Developer Experience**: Fast Refresh, error overlay, TypeScript integrado

**Restricciones**:
- Debe integrarse con NestJS backend vía REST + WebSocket
- Debe soportar autenticación (NextAuth.js)
- Equipo tiene experiencia básica con React pero no Next.js

---

## Decisión

**Solución Elegida**: Next.js 16.0.1 con App Router

**Justificación**:
- **App Router estable**: Routing moderno con React Server Components
- **React 19 listo**: Soporte completo para últimas features de React
- **Performance de serie**: Code splitting automático, optimización de imágenes/fonts
- **Developer Experience superior**: Fast Refresh, error overlay detallado, TypeScript first-class
- **Ecosistema maduro**: Vercel, shadcn/ui, TanStack Query, etc.
- **Producción probada**: Usado por Nike, TikTok, Twitch, Notion

**Detalles de Implementación**:
- Next.js 16.0.1 (última versión estable con App Router)
- React 19.0.0 + React DOM 19.0.0
- TypeScript 5.7.3 con configuración estricta
- App Router en `src/app/` (no Pages Router)
- shadcn/ui para componentes UI
- TanStack Query v5 para state management de servidor
- NextAuth.js para autenticación

---

## Consecuencias

### **Consecuencias Positivas** ✅

- **Server Components**: Menos JavaScript al cliente, mejor performance
- **Streaming SSR**: Progressive rendering, mejor UX
- **Layouts anidados**: Compartir UI sin re-renders innecesarios
- **Route handlers**: API routes integradas (aunque usamos NestJS backend)
- **Optimizaciones automáticas**: Imágenes, fonts, code splitting sin configuración
- **TypeScript integrado**: Sin configuración manual, soporte de primera clase
- **Fast Refresh**: Cambios instantáneos sin perder estado
- **Error boundaries**: Manejo de errores granular por ruta

### **Consecuencias Negativas** ❌

- **Curva de aprendizaje**: Server Components y App Router son conceptos nuevos
- **Complejidad inicial**: Client vs Server Components requiere entendimiento
- **Debugging más difícil**: SSR agrega capa extra de complejidad
- **Vendor lock-in parcial**: Optimizaciones específicas de Vercel (aunque funciona en otros hosts)

### **Consecuencias Neutrales** ⚖️

- **Más opiniones**: App Router tiene más convenciones que Pages Router
- **Build más lento**: SSR agrega tiempo de build (trade-off por performance runtime)

### **Riesgos**

- **App Router relativamente nuevo**: Mitigado usando versión 16 estable, comunidad grande
- **Cambios frecuentes**: Mitigado fijando versiones específicas, probar antes de actualizar
- **SSR debugging**: Mitigado con error overlay de Next.js y logging apropiado

---

## Alternativas Consideradas

### **Alternativa A: Next.js 15 con Pages Router**

**Pros**:
- Más maduro y estable
- Más ejemplos y tutoriales
- Menos curva de aprendizaje
- Sin Server Components

**Contras**:
- Sin React Server Components (futuro de React)
- Sin layouts anidados nativos
- Sin streaming SSR
- Menos optimizaciones automáticas
- Eventualmente deprecado en favor de App Router

**Por qué se rechazó**: App Router es el futuro de Next.js. Mejor empezar con patrón moderno desde el inicio que migrar después.

---

### **Alternativa B: Vite + React Router**

**Pros**:
- Builds ultra-rápidos con Vite
- Más ligero que Next.js
- Más control sobre configuración
- Sin vendor lock-in

**Contras**:
- Sin SSR out-of-the-box (requiere setup manual)
- Sin optimizaciones automáticas de imágenes/fonts
- Sin file-based routing
- Más configuración manual
- Menos convenciones

**Por qué se rechazó**: SSR es importante para SEO y performance. Next.js provee esto sin configuración.

---

### **Alternativa C: Remix**

**Pros**:
- Excelente manejo de forms
- Nested routing nativo
- Progressive enhancement
- Web standards (Request/Response)

**Contras**:
- Ecosistema más pequeño que Next.js
- Menos componentes UI disponibles
- Menos ejemplos con NestJS backend
- Menos adopción enterprise

**Por qué se rechazó**: Next.js tiene ecosistema más grande, mejor integración con shadcn/ui, y equipo más familiarizado con React.

---

### **Alternativa D: Create React App (CRA)**

**Pros**:
- Simple setup
- Conocido por el equipo
- Sin SSR (menos complejidad)

**Contras**:
- Deprecado (no recomendado por React team)
- Sin SSR/SSG
- Sin optimizaciones automáticas
- Configuración manual para TypeScript avanzado
- Builds lentos comparado con Vite/Next.js

**Por qué se rechazó**: CRA está deprecado. React team recomienda Next.js o Remix.

---

## Referencias

- [Documentación Oficial Next.js](https://nextjs.org/docs)
- [App Router vs Pages Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js GitHub](https://github.com/vercel/next.js) - 130k+ estrellas

---

## Notas

**Consideraciones Futuras**:
- Monitorear adopción de Partial Prerendering (PPR) en Next.js 17+
- Considerar migrar a React Compiler cuando esté estable
- Evaluar Turbopack cuando reemplace Webpack por defecto

**Preguntas Abiertas**:
- Ninguna - App Router funcionando bien en Fase 1-4

---

## Historial de Revisiones

| Fecha       | Cambio                          | Autor       |
|------------|---------------------------------|--------------|
| 06/01/2026 | Decisión inicial                | Líder Proyecto |
| 30/01/2026 | Documentado después de completar MVP | Agente IA     |

---

**Fin de ADR-002** | Next.js 16 App Router elegido para frontend
