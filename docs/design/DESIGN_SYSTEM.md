# ClientPro CRM - Design System v2.0

> **Propósito**: Sistema de diseño unificado para el rediseño completo del frontend
> **Fecha de creación**: 5 de febrero de 2026
> **Estado**: En desarrollo - Rediseño completo

---

## 🎨 Paleta de Colores Profesional

### **Colores Primarios** (Brand Identity)

```css
/* Azul Profesional - Color Principal */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* PRIMARY */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* Acento - Para CTAs y elementos destacados */
--accent-50: #fdf4ff;
--accent-100: #fae8ff;
--accent-200: #f5d0fe;
--accent-300: #f0abfc;
--accent-400: #e879f9;
--accent-500: #d946ef;  /* ACCENT */
--accent-600: #c026d3;
--accent-700: #a21caf;
--accent-800: #86198f;
--accent-900: #701a75;
```

### **Colores Semánticos**

```css
/* Success - Verde */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #22c55e;  /* SUCCESS */
--success-600: #16a34a;
--success-700: #15803d;

/* Warning - Amarillo/Naranja */
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;  /* WARNING */
--warning-600: #d97706;
--warning-700: #b45309;

/* Error - Rojo */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;  /* ERROR */
--error-600: #dc2626;
--error-700: #b91c1c;

/* Info - Azul claro */
--info-50: #f0f9ff;
--info-100: #e0f2fe;
--info-500: #06b6d4;  /* INFO */
--info-600: #0891b2;
--info-700: #0e7490;
```

### **Colores Neutros** (Light & Dark Mode)

```css
/* Light Mode */
--background: #ffffff;
--foreground: #0f172a;
--muted: #f1f5f9;
--muted-foreground: #64748b;
--card: #ffffff;
--card-foreground: #0f172a;
--border: #e2e8f0;
--input: #e2e8f0;

/* Dark Mode */
--dark-background: #0f172a;
--dark-foreground: #f8fafc;
--dark-muted: #1e293b;
--dark-muted-foreground: #94a3b8;
--dark-card: #1e293b;
--dark-card-foreground: #f8fafc;
--dark-border: #334155;
--dark-input: #334155;
```

---

## 🔤 Tipografía

### **Fuentes**

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Cal Sans', 'Inter', sans-serif;
--font-mono: 'Fira Code', 'Courier New', monospace;
```

### **Escala de Tamaños**

```css
/* Text Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

---

## 📐 Espaciado y Layout

### **Spacing Scale** (Tailwind-based)

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### **Border Radius**

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Círculo */
```

### **Shadows**

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

---

## 🎭 Componentes de UI

### **Botones**

**Variantes**:
- `default` - Azul primario con hover suave
- `destructive` - Rojo para acciones peligrosas
- `outline` - Borde con fondo transparente
- `secondary` - Gris neutro
- `ghost` - Sin fondo, solo hover
- `link` - Estilo texto subrayado

**Tamaños**:
- `sm` - Pequeño (h-9, px-3, text-sm)
- `default` - Normal (h-10, px-4, text-base)
- `lg` - Grande (h-11, px-8, text-lg)
- `icon` - Solo ícono (h-10, w-10)

### **Cards**

```tsx
// Card con efecto glassmorphism y hover
<Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 
                 border border-slate-200 dark:border-slate-700
                 hover:shadow-xl transition-all duration-300
                 hover:-translate-y-1">
  <CardHeader>
    <CardTitle className="text-2xl font-bold bg-gradient-to-r 
                          from-blue-600 to-purple-600 bg-clip-text 
                          text-transparent">
      Título
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

### **Inputs**

```tsx
// Input con animación focus
<Input 
  className="border-slate-300 dark:border-slate-600
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             transition-all duration-200
             placeholder:text-slate-400" 
/>
```

---

## ✨ Animaciones y Transiciones

### **Framer Motion Presets**

```tsx
// Fade In Up
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

// Scale In
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2 }
};

// Slide In Right
export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.3 }
};

// Stagger Children (para listas)
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### **CSS Transitions**

```css
/* Hover suave */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Fade transition */
.fade-transition {
  transition: opacity 0.2s ease-in-out;
}

/* Slide transition */
.slide-transition {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Tablet portrait */
--breakpoint-md: 768px;   /* Tablet landscape */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

---

## 🎯 Patrones de Diseño Específicos

### **Dashboard Cards**

- Card con gradiente sutil de fondo
- Ícono circular con color de acento
- Título + valor grande + tendencia
- Animación hover con lift effect
- Border glow en hover

### **Tablas**

- Header con fondo azul gradiente
- Filas con hover suave
- Badges para estados (colores semánticos)
- Skeleton loaders durante carga
- Acciones con iconos + tooltips

### **Formularios**

- Labels con font-medium
- Inputs con focus ring
- Error messages en rojo con ícono
- Success feedback con animación
- Submit button con loading spinner

### **Kanban (Negocios)**

- Columnas con bordes redondeados
- Cards con drag indicator
- Drop zones con indicador visual
- Animaciones de drag & drop suaves
- Contador de items en header

### **Navegación**

- Sidebar con glassmorphism
- Items con hover highlight
- Active state con border left accent
- Iconos + texto responsive
- Collapse animation suave

---

## 🌈 Efectos Especiales

### **Glassmorphism**

```tsx
<div className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80
                border border-white/20 dark:border-slate-700/50
                shadow-xl">
  {/* Contenido */}
</div>
```

### **Gradient Text**

```tsx
<h1 className="text-4xl font-bold bg-gradient-to-r 
               from-blue-600 via-purple-600 to-pink-600 
               bg-clip-text text-transparent">
  ClientPro CRM
</h1>
```

### **Gradient Backgrounds**

```tsx
<div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50
                dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
  {/* Contenido */}
</div>
```

### **Glow Effect**

```css
.glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.glow-purple {
  box-shadow: 0 0 20px rgba(217, 70, 239, 0.5);
}
```

---

## 📊 Iconografía

**Librería**: Lucide React (ya instalada)

**Tamaños estándar**:
- `xs`: 16px
- `sm`: 20px
- `md`: 24px (default)
- `lg`: 32px
- `xl`: 48px

**Colores**:
- Por defecto: `currentColor`
- Primario: `text-blue-600`
- Acento: `text-purple-600`
- Success: `text-green-600`
- Warning: `text-yellow-600`
- Error: `text-red-600`

---

## ✅ Checklist de Implementación

Para cada módulo, asegurar:

- [ ] Paleta de colores aplicada consistentemente
- [ ] Tipografía usando escala definida
- [ ] Espaciado usando spacing scale
- [ ] Animaciones Framer Motion implementadas
- [ ] Skeleton loaders durante carga
- [ ] Loading spinners en acciones async
- [ ] Hover states en elementos interactivos
- [ ] Focus states en inputs/botones
- [ ] Responsive design (mobile first)
- [ ] Dark mode funcionando correctamente
- [ ] Accesibilidad (ARIA labels, keyboard nav)
- [ ] Transiciones suaves entre estados

---

**Fin de DESIGN_SYSTEM.md** | Sistema de diseño v2.0 | Para rediseño completo
