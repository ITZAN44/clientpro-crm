# ADR-005: Elegir shadcn/ui para Componentes de Interfaz

**Estado**: Aceptado  
**Fecha**: 09 de enero de 2026  
**Decisores**: Líder del Proyecto  
**Etiquetas**: frontend, ui, components

---

## Contexto

**Antecedentes**:
- Frontend necesita componentes UI profesionales y consistentes
- Requiere componentes accesibles (ARIA compliant)
- Necesidad de personalización completa (no solo themes)
- Proyecto usa Tailwind CSS v4 para estilos
- Equipo quiere balance entre velocidad y control

**Requisitos**:
- **Accesibilidad**: WAI-ARIA compliant, keyboard navigation, screen reader friendly
- **Personalización**: Control total sobre estilos y comportamiento
- **TypeScript**: Componentes completamente tipados
- **Tailwind CSS**: Integración nativa con Tailwind
- **Composabilidad**: Componentes deben ser componibles y reutilizables
- **Sin vendor lock-in**: Componentes deben vivir en nuestro código, no en node_modules

**Restricciones**:
- Debe funcionar con Next.js 16 App Router
- Debe integrarse con React 19
- Debe ser responsive por defecto
- Performance no debe degradar (bundle size razonable)

---

## Decisión

**Solución Elegida**: shadcn/ui (copy-paste component library)

**Justificación**:
- **Código en tu proyecto**: Componentes se copian a `components/ui/`, no instalados como dependencia
- **Control total**: Puedes modificar componentes como necesites
- **Radix UI bajo el capó**: Componentes headless accesibles de Radix
- **Tailwind CSS nativo**: Estilos usando Tailwind, sin CSS-in-JS
- **TypeScript first**: Todo componente completamente tipado
- **No es un framework**: Solo componentes, sin runtime, sin vendor lock-in
- **Comunidad activa**: 80k+ estrellas GitHub, ampliamente adoptado

**Detalles de Implementación**:
- shadcn/ui CLI para agregar componentes
- 16 componentes instalados: Button, Input, Card, Dialog, Select, Textarea, Badge, Dropdown Menu, Avatar, Checkbox, Label, Tabs, Toast, Tooltip, Table, Form
- Radix UI como dependencia (headless components)
- Tailwind v4 para estilos
- class-variance-authority para variantes
- Componentes en `frontend/src/components/ui/`

---

## Consecuencias

### **Consecuencias Positivas** ✅

- **Propiedad del código**: Componentes viven en tu repo, modificables libremente
- **Sin breaking changes**: Actualizaciones son opt-in (no forced upgrades)
- **Bundle optimizado**: Solo incluyes componentes que usas
- **Accesibilidad de serie**: Radix UI maneja ARIA, keyboard nav, focus management
- **Consistencia visual**: Tema centralizado en `tailwind.config.js`
- **Developer Experience**: CLI para agregar componentes, TypeScript autocompletado
- **Performance**: Sin runtime overhead, solo Tailwind CSS

### **Consecuencias Negativas** ❌

- **Actualizaciones manuales**: Nuevas versiones requieren re-copiar componentes modificados
- **No es biblioteca**: No puedes hacer `import { Button } from 'shadcn-ui'`
- **Mantenimiento**: Eres responsable de mantener componentes en tu código
- **Divergencia**: Componentes personalizados pueden divergir del upstream

### **Consecuencias Neutrales** ⚖️

- **Más archivos en repo**: Componentes viven en tu código (trade-off por control)
- **Curva de aprendizaje Radix**: Necesitas entender primitivas de Radix

### **Riesgos**

- **Divergencia de upstream**: Mitigado documentando modificaciones, revisando updates ocasionalmente
- **Componentes desactualizados**: Mitigado revisando changelog de shadcn/ui mensualmente
- **Inconsistencias**: Mitigado usando theme centralizado, code review

---

## Alternativas Consideradas

### **Alternativa A: Material UI (MUI)**

**Pros**:
- Biblioteca completa de componentes
- Muy madura y estable
- Comunidad enorme
- Documentación exhaustiva
- Temas predefinidos

**Contras**:
- Vendor lock-in total
- CSS-in-JS (emotion) no juega bien con Tailwind
- Bundle grande (~300KB)
- Personalización limitada sin override profundo
- Estilos opinados (difícil hacer no-Material look)

**Por qué se rechazó**: Queremos usar Tailwind CSS, no CSS-in-JS. MUI demasiado opinionado.

---

### **Alternativa B: Ant Design**

**Pros**:
- Componentes enterprise-ready
- Muy completo (100+ componentes)
- Usado en producción por Alibaba
- Buen soporte de formularios

**Contras**:
- Diseño muy específico (difícil personalizar)
- CSS-in-JS (styled-components)
- Bundle muy grande
- No integra bien con Tailwind
- Más orientado a admin panels que CRMs modernos

**Por qué se rechazó**: Diseño demasiado específico, no queremos look de "admin panel chino".

---

### **Alternativa C: Headless UI (Tailwind Labs)**

**Pros**:
- Oficial de Tailwind Labs
- Headless (trae tu propio estilo)
- Muy ligero
- Accesibilidad integrada
- Funciona perfecto con Tailwind

**Contras**:
- Menos componentes que shadcn/ui
- Sin componentes pre-estilizados (más trabajo inicial)
- Sin CLI para scaffolding
- Comunidad más pequeña

**Por qué se rechazó**: shadcn/ui usa Radix UI (similar a Headless UI) pero provee estilos base. Mejor DX.

---

### **Alternativa D: Construir todo desde cero**

**Pros**:
- Control total absoluto
- Sin dependencias externas
- Exactamente lo que necesitas
- Bundle mínimo

**Contras**:
- Mucho tiempo de desarrollo
- Accesibilidad difícil de implementar correctamente
- Keyboard navigation complejo
- Reinventar la rueda
- Bugs de accesibilidad inevitables

**Por qué se rechazó**: Accesibilidad es muy difícil de hacer bien. Mejor usar solución probada (Radix/shadcn).

---

## Referencias

- [shadcn/ui Documentación](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [shadcn/ui GitHub](https://github.com/shadcn-ui/ui) - 80k+ estrellas
- [Tailwind CSS v4](https://tailwindcss.com)

---

## Notas

**Consideraciones Futuras**:
- Revisar updates de shadcn/ui mensualmente
- Considerar migrar a componentes propios si divergencia es muy grande
- Monitorear Tailwind v4 component library oficial (si lanzan)

**Preguntas Abiertas**:
- ¿Cómo manejar updates de componentes que modificamos? → Documentar cambios en comentarios

---

## Historial de Revisiones

| Fecha       | Cambio                          | Autor       |
|------------|---------------------------------|--------------|
| 09/01/2026 | Decisión inicial                | Líder Proyecto |
| 30/01/2026 | Documentado después de Fase 2-3 | Agente IA     |

---

**Fin de ADR-005** | shadcn/ui elegido para componentes de interfaz
