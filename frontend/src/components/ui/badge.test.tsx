import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
  describe('renderizado básico', () => {
    it('debe renderizar el badge con texto', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('debe renderizar como span por defecto', () => {
      const { container } = render(<Badge>Test</Badge>)
      expect(container.querySelector('span')).toBeInTheDocument()
    })

    it('debe tener el atributo data-slot="badge"', () => {
      const { container } = render(<Badge>Test</Badge>)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('variantes', () => {
    it('debe aplicar la variante default por defecto', () => {
      const { container } = render(<Badge>Default</Badge>)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('border-blue-200')
      expect(badge?.className).toContain('bg-blue-50')
      expect(badge?.className).toContain('text-blue-700')
    })

    it('debe aplicar la variante secondary', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('border-slate-200')
      expect(badge?.className).toContain('bg-slate-100')
      expect(badge?.className).toContain('text-slate-700')
    })

    it('debe aplicar la variante destructive', () => {
      const { container } = render(<Badge variant="destructive">Destructive</Badge>)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('border-red-200')
      expect(badge?.className).toContain('bg-red-50')
      expect(badge?.className).toContain('text-red-700')
    })

    it('debe aplicar la variante outline', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('border-slate-300')
      expect(badge?.className).toContain('text-slate-700')
    })
  })

  describe('prop asChild', () => {
    it('debe renderizar como un elemento personalizado cuando asChild=true', () => {
      const { container } = render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      )
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveTextContent('Link Badge')
    })

    it('debe aplicar clases al elemento hijo cuando asChild=true', () => {
      const { container } = render(
        <Badge asChild variant="secondary">
          <button>Button Badge</button>
        </Badge>
      )
      const button = container.querySelector('button')
      expect(button?.className).toContain('border-slate-200')
      expect(button?.className).toContain('bg-slate-100')
      expect(button?.className).toContain('text-slate-700')
    })
  })

  describe('className personalizado', () => {
    it('debe agregar clases personalizadas manteniendo las variantes', () => {
      const { container } = render(
        <Badge className="custom-class" variant="destructive">
          Custom
        </Badge>
      )
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('custom-class')
      expect(badge?.className).toContain('border-red-200')
      expect(badge?.className).toContain('bg-red-50')
      expect(badge?.className).toContain('text-red-700')
    })
  })

  describe('props HTML nativas', () => {
    it('debe aceptar props HTML estándar', () => {
      const { container } = render(
        <Badge id="test-badge" data-testid="custom-badge">
          Test
        </Badge>
      )
      const badge = screen.getByTestId('custom-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('id', 'test-badge')
    })

    it('debe permitir aria-* attributes', () => {
      const { container } = render(
        <Badge aria-label="Status badge" aria-invalid="true">
          Error
        </Badge>
      )
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
      expect(badge).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('estilos base', () => {
    it('debe tener las clases base del badge', () => {
      const { container } = render(<Badge>Test</Badge>)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('inline-flex')
      expect(badge?.className).toContain('items-center')
      expect(badge?.className).toContain('rounded-full')
      expect(badge?.className).toContain('border')
      expect(badge?.className).toContain('text-xs')
    })
  })
})
