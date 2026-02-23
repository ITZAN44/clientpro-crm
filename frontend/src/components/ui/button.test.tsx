import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  describe('renderizado básico', () => {
    it('debe renderizar el botón con texto', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('debe renderizar como button por defecto', () => {
      const { container } = render(<Button>Test</Button>)
      expect(container.querySelector('button')).toBeInTheDocument()
    })

    it('debe tener los atributos data-slot, data-variant y data-size', () => {
      const { container } = render(<Button>Test</Button>)
      const button = container.querySelector('[data-slot="button"]')
      expect(button).toHaveAttribute('data-variant', 'default')
      expect(button).toHaveAttribute('data-size', 'default')
    })
  })

  describe('variantes', () => {
    it('debe aplicar la variante default por defecto', () => {
      const { container } = render(<Button>Default</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('bg-primary')
      expect(button?.className).toContain('text-primary-foreground')
    })

    it('debe aplicar la variante destructive', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('bg-destructive')
      expect(button?.className).toContain('text-white')
      expect(button).toHaveAttribute('data-variant', 'destructive')
    })

    it('debe aplicar la variante outline', () => {
      const { container } = render(<Button variant="outline">Outline</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('border')
      expect(button?.className).toContain('bg-background')
      expect(button).toHaveAttribute('data-variant', 'outline')
    })

    it('debe aplicar la variante secondary', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('bg-secondary')
      expect(button?.className).toContain('text-secondary-foreground')
    })

    it('debe aplicar la variante ghost', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('hover:bg-accent')
    })

    it('debe aplicar la variante link', () => {
      const { container } = render(<Button variant="link">Link</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('text-primary')
      expect(button?.className).toContain('underline-offset-4')
    })
  })

  describe('tamaños', () => {
    it('debe aplicar el tamaño default por defecto', () => {
      const { container } = render(<Button>Default Size</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('h-9')
      expect(button).toHaveAttribute('data-size', 'default')
    })

    it('debe aplicar el tamaño sm', () => {
      const { container } = render(<Button size="sm">Small</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('h-8')
      expect(button).toHaveAttribute('data-size', 'sm')
    })

    it('debe aplicar el tamaño lg', () => {
      const { container } = render(<Button size="lg">Large</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('h-10')
      expect(button).toHaveAttribute('data-size', 'lg')
    })

    it('debe aplicar el tamaño icon', () => {
      const { container } = render(<Button size="icon">Icon</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('size-9')
      expect(button).toHaveAttribute('data-size', 'icon')
    })

    it('debe aplicar el tamaño icon-sm', () => {
      const { container } = render(<Button size="icon-sm">Icon SM</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('size-8')
    })

    it('debe aplicar el tamaño icon-lg', () => {
      const { container } = render(<Button size="icon-lg">Icon LG</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('size-10')
    })
  })

  describe('prop asChild', () => {
    it('debe renderizar como un elemento personalizado cuando asChild=true', () => {
      const { container } = render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveTextContent('Link Button')
    })

    it('debe aplicar clases y data-attributes al elemento hijo', () => {
      const { container } = render(
        <Button asChild variant="destructive" size="lg">
          <a href="/delete">Delete Link</a>
        </Button>
      )
      const link = container.querySelector('a')
      expect(link?.className).toContain('bg-destructive')
      expect(link?.className).toContain('h-10')
      expect(link).toHaveAttribute('data-variant', 'destructive')
      expect(link).toHaveAttribute('data-size', 'lg')
    })
  })

  describe('estado disabled', () => {
    it('debe renderizar correctamente cuando está disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('debe aplicar clases de disabled', () => {
      const { container } = render(<Button disabled>Disabled</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('disabled:pointer-events-none')
      expect(button?.className).toContain('disabled:opacity-50')
    })

    it('no debe ejecutar onClick cuando está disabled', async () => {
      const handleClick = jest.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      
      const button = screen.getByRole('button')
      await userEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('interacciones', () => {
    it('debe ejecutar onClick cuando se hace clic', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      await userEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('debe permitir múltiples clics', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      await userEvent.click(button)
      await userEvent.click(button)
      await userEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })
  })

  describe('className personalizado', () => {
    it('debe agregar clases personalizadas manteniendo las variantes', () => {
      const { container } = render(
        <Button className="custom-class" variant="destructive" size="lg">
          Custom
        </Button>
      )
      const button = container.querySelector('button')
      expect(button?.className).toContain('custom-class')
      expect(button?.className).toContain('bg-destructive')
      expect(button?.className).toContain('h-10')
    })
  })

  describe('props HTML nativas', () => {
    it('debe aceptar type="submit"', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('debe aceptar type="button"', () => {
      render(<Button type="button">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('debe aceptar aria-* attributes', () => {
      render(<Button aria-label="Custom label" aria-pressed="true">Test</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('debe aceptar data-testid', () => {
      render(<Button data-testid="custom-button">Test</Button>)
      const button = screen.getByTestId('custom-button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('estilos base', () => {
    it('debe tener las clases base del botón', () => {
      const { container } = render(<Button>Test</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('inline-flex')
      expect(button?.className).toContain('items-center')
      expect(button?.className).toContain('justify-center')
      expect(button?.className).toContain('rounded-md')
      expect(button?.className).toContain('text-sm')
      expect(button?.className).toContain('font-medium')
    })
  })

  describe('combinaciones de variantes y tamaños', () => {
    it('debe combinar destructive + sm correctamente', () => {
      const { container } = render(
        <Button variant="destructive" size="sm">Delete</Button>
      )
      const button = container.querySelector('button')
      expect(button?.className).toContain('bg-destructive')
      expect(button?.className).toContain('h-8')
    })

    it('debe combinar outline + lg correctamente', () => {
      const { container } = render(
        <Button variant="outline" size="lg">Large Outline</Button>
      )
      const button = container.querySelector('button')
      expect(button?.className).toContain('border')
      expect(button?.className).toContain('h-10')
    })

    it('debe combinar ghost + icon correctamente', () => {
      const { container } = render(
        <Button variant="ghost" size="icon">X</Button>
      )
      const button = container.querySelector('button')
      expect(button?.className).toContain('hover:bg-accent')
      expect(button?.className).toContain('size-9')
    })
  })
})
