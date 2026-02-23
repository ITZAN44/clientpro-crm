import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card'

describe('Card', () => {
  describe('Card - componente principal', () => {
    it('debe renderizar el card correctamente', () => {
      const { container } = render(<Card>Test Card</Card>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent('Test Card')
    })

    it('debe tener las clases base del card', () => {
      const { container } = render(<Card>Test</Card>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('bg-card')
      expect(card?.className).toContain('text-card-foreground')
      expect(card?.className).toContain('rounded-xl')
      expect(card?.className).toContain('border')
      expect(card?.className).toContain('shadow-sm')
    })

    it('debe aceptar className personalizado', () => {
      const { container } = render(<Card className="custom-class">Test</Card>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('custom-class')
      expect(card?.className).toContain('bg-card')
    })

    it('debe renderizar como div', () => {
      const { container } = render(<Card>Test</Card>)
      expect(container.querySelector('div[data-slot="card"]')).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('debe renderizar el header correctamente', () => {
      const { container } = render(<CardHeader>Header</CardHeader>)
      const header = container.querySelector('[data-slot="card-header"]')
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('Header')
    })

    it('debe tener las clases base del header', () => {
      const { container } = render(<CardHeader>Test</CardHeader>)
      const header = container.querySelector('[data-slot="card-header"]')
      expect(header?.className).toContain('grid')
      expect(header?.className).toContain('items-start')
      expect(header?.className).toContain('gap-2')
      expect(header?.className).toContain('px-6')
    })

    it('debe aceptar className personalizado', () => {
      const { container } = render(<CardHeader className="custom-header">Test</CardHeader>)
      const header = container.querySelector('[data-slot="card-header"]')
      expect(header?.className).toContain('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('debe renderizar el título correctamente', () => {
      const { container } = render(<CardTitle>Card Title</CardTitle>)
      const title = container.querySelector('[data-slot="card-title"]')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Card Title')
    })

    it('debe tener las clases base del título', () => {
      const { container } = render(<CardTitle>Test</CardTitle>)
      const title = container.querySelector('[data-slot="card-title"]')
      expect(title?.className).toContain('leading-none')
      expect(title?.className).toContain('font-semibold')
    })

    it('debe aceptar className personalizado', () => {
      const { container } = render(<CardTitle className="custom-title">Test</CardTitle>)
      const title = container.querySelector('[data-slot="card-title"]')
      expect(title?.className).toContain('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('debe renderizar la descripción correctamente', () => {
      const { container } = render(<CardDescription>Description text</CardDescription>)
      const description = container.querySelector('[data-slot="card-description"]')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('Description text')
    })

    it('debe tener las clases base de la descripción', () => {
      const { container } = render(<CardDescription>Test</CardDescription>)
      const description = container.querySelector('[data-slot="card-description"]')
      expect(description?.className).toContain('text-muted-foreground')
      expect(description?.className).toContain('text-sm')
    })

    it('debe aceptar className personalizado', () => {
      const { container } = render(
        <CardDescription className="custom-desc">Test</CardDescription>
      )
      const description = container.querySelector('[data-slot="card-description"]')
      expect(description?.className).toContain('custom-desc')
    })
  })

  describe('CardAction', () => {
    it('debe renderizar la acción correctamente', () => {
      const { container } = render(<CardAction>Action</CardAction>)
      const action = container.querySelector('[data-slot="card-action"]')
      expect(action).toBeInTheDocument()
      expect(action).toHaveTextContent('Action')
    })

    it('debe tener las clases de posicionamiento', () => {
      const { container } = render(<CardAction>Test</CardAction>)
      const action = container.querySelector('[data-slot="card-action"]')
      expect(action?.className).toContain('col-start-2')
      expect(action?.className).toContain('row-span-2')
      expect(action?.className).toContain('justify-self-end')
    })

    it('debe aceptar className personalizado', () => {
      const { container } = render(<CardAction className="custom-action">Test</CardAction>)
      const action = container.querySelector('[data-slot="card-action"]')
      expect(action?.className).toContain('custom-action')
    })
  })

  describe('CardContent', () => {
    it('debe renderizar el contenido correctamente', () => {
      const { container } = render(<CardContent>Content</CardContent>)
      const content = container.querySelector('[data-slot="card-content"]')
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Content')
    })

    it('debe tener padding horizontal', () => {
      const { container } = render(<CardContent>Test</CardContent>)
      const content = container.querySelector('[data-slot="card-content"]')
      expect(content?.className).toContain('px-6')
    })

    it('debe aceptar className personalizado', () => {
      const { container } = render(<CardContent className="custom-content">Test</CardContent>)
      const content = container.querySelector('[data-slot="card-content"]')
      expect(content?.className).toContain('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('debe renderizar el footer correctamente', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>)
      const footer = container.querySelector('[data-slot="card-footer"]')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveTextContent('Footer')
    })

    it('debe tener las clases base del footer', () => {
      const { container } = render(<CardFooter>Test</CardFooter>)
      const footer = container.querySelector('[data-slot="card-footer"]')
      expect(footer?.className).toContain('flex')
      expect(footer?.className).toContain('items-center')
      expect(footer?.className).toContain('px-6')
    })

    it('debe aceptar className personalizado', () => {
      const { container } = render(<CardFooter className="custom-footer">Test</CardFooter>)
      const footer = container.querySelector('[data-slot="card-footer"]')
      expect(footer?.className).toContain('custom-footer')
    })
  })

  describe('composición de Card completo', () => {
    it('debe renderizar un card completo con todos los subcomponentes', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument()
    })

    it('debe renderizar correctamente con solo título y contenido', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
          </CardHeader>
          <CardContent>Simple content</CardContent>
        </Card>
      )

      expect(screen.getByText('Simple Card')).toBeInTheDocument()
      expect(screen.getByText('Simple content')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-footer"]')).not.toBeInTheDocument()
    })

    it('debe renderizar correctamente sin header ni footer', () => {
      const { container } = render(
        <Card>
          <CardContent>Only content</CardContent>
        </Card>
      )

      expect(screen.getByText('Only content')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-header"]')).not.toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-footer"]')).not.toBeInTheDocument()
    })
  })

  describe('props HTML nativas', () => {
    it('debe aceptar data-testid en Card', () => {
      render(<Card data-testid="custom-card">Test</Card>)
      expect(screen.getByTestId('custom-card')).toBeInTheDocument()
    })

    it('debe aceptar id en Card', () => {
      const { container } = render(<Card id="my-card">Test</Card>)
      const card = container.querySelector('#my-card')
      expect(card).toBeInTheDocument()
    })

    it('debe aceptar onClick en CardFooter', () => {
      const handleClick = jest.fn()
      render(<CardFooter onClick={handleClick}>Click me</CardFooter>)
      const footer = screen.getByText('Click me')
      footer.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('debe aceptar aria-label en CardHeader', () => {
      const { container } = render(<CardHeader aria-label="Card header">Test</CardHeader>)
      const header = container.querySelector('[data-slot="card-header"]')
      expect(header).toHaveAttribute('aria-label', 'Card header')
    })
  })
})
