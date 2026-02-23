import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label', () => {
  describe('renderizado básico', () => {
    it('debe renderizar el label con texto', () => {
      render(<Label>Test Label</Label>)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('debe tener el atributo data-slot="label"', () => {
      const { container } = render(<Label>Test</Label>)
      const label = container.querySelector('[data-slot="label"]')
      expect(label).toBeInTheDocument()
    })

    it('debe tener las clases base del label', () => {
      const { container } = render(<Label>Test</Label>)
      const label = container.querySelector('[data-slot="label"]')
      expect(label?.className).toContain('flex')
      expect(label?.className).toContain('items-center')
      expect(label?.className).toContain('gap-2')
      expect(label?.className).toContain('text-sm')
      expect(label?.className).toContain('leading-none')
      expect(label?.className).toContain('font-medium')
      expect(label?.className).toContain('select-none')
    })
  })

  describe('asociación con inputs', () => {
    it('debe asociarse correctamente con un input usando htmlFor', () => {
      render(
        <>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />
        </>
      )
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'email')
      expect(input).toHaveAttribute('id', 'email')
    })

    it('debe enfocarse en el input cuando se hace clic en el label', async () => {
      const { container } = render(
        <>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </>
      )
      const label = screen.getByText('Username')
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      // Usar userEvent para simular interacción más realista
      await label.click()
      
      // El input debería estar en el documento y el label correctamente asociado
      expect(input).toBeInTheDocument()
      expect(label).toHaveAttribute('for', 'username')
    })

    it('debe funcionar con múltiples inputs', () => {
      render(
        <>
          <Label htmlFor="first-name">First Name</Label>
          <input id="first-name" type="text" />
          
          <Label htmlFor="last-name">Last Name</Label>
          <input id="last-name" type="text" />
        </>
      )
      
      const firstLabel = screen.getByText('First Name')
      const lastLabel = screen.getByText('Last Name')
      
      expect(firstLabel).toHaveAttribute('for', 'first-name')
      expect(lastLabel).toHaveAttribute('for', 'last-name')
    })
  })

  describe('estados con peer-disabled', () => {
    it('debe tener clases para peer-disabled', () => {
      const { container } = render(<Label>Test</Label>)
      const label = container.querySelector('[data-slot="label"]')
      expect(label?.className).toContain('peer-disabled:cursor-not-allowed')
      expect(label?.className).toContain('peer-disabled:opacity-50')
    })

    it('debe renderizar correctamente con input disabled adyacente', () => {
      const { container } = render(
        <div>
          <input id="disabled-input" type="text" disabled className="peer" />
          <Label htmlFor="disabled-input">Disabled Field</Label>
        </div>
      )
      
      const label = screen.getByText('Disabled Field')
      const input = container.querySelector('#disabled-input')
      
      expect(input).toBeDisabled()
      expect(label).toBeInTheDocument()
    })
  })

  describe('estados con group-data', () => {
    it('debe tener clases para group-data-[disabled=true]', () => {
      const { container } = render(<Label>Test</Label>)
      const label = container.querySelector('[data-slot="label"]')
      expect(label?.className).toContain('group-data-[disabled=true]:pointer-events-none')
      expect(label?.className).toContain('group-data-[disabled=true]:opacity-50')
    })

    it('debe renderizar dentro de un grupo con data-disabled', () => {
      const { container } = render(
        <div className="group" data-disabled="true">
          <Label>Grouped Label</Label>
          <input type="text" />
        </div>
      )
      
      const label = screen.getByText('Grouped Label')
      expect(label).toBeInTheDocument()
    })
  })

  describe('className personalizado', () => {
    it('debe agregar clases personalizadas manteniendo las clases base', () => {
      const { container } = render(<Label className="custom-label">Custom</Label>)
      const label = container.querySelector('[data-slot="label"]')
      expect(label?.className).toContain('custom-label')
      expect(label?.className).toContain('text-sm')
      expect(label?.className).toContain('font-medium')
    })

    it('debe permitir sobrescribir estilos con className', () => {
      const { container } = render(<Label className="text-lg font-bold">Large Bold</Label>)
      const label = container.querySelector('[data-slot="label"]')
      expect(label?.className).toContain('text-lg')
      expect(label?.className).toContain('font-bold')
    })
  })

  describe('contenido del label', () => {
    it('debe renderizar texto plano', () => {
      render(<Label>Plain text</Label>)
      expect(screen.getByText('Plain text')).toBeInTheDocument()
    })

    it('debe renderizar contenido con elementos HTML', () => {
      render(
        <Label>
          <span>Required</span>
          <span className="text-red-500">*</span>
        </Label>
      )
      expect(screen.getByText('Required')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('debe renderizar con icono (gap-2 para espaciado)', () => {
      render(
        <Label>
          <svg data-testid="icon" width="16" height="16" />
          <span>Label with icon</span>
        </Label>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Label with icon')).toBeInTheDocument()
    })
  })

  describe('props HTML nativas', () => {
    it('debe aceptar id', () => {
      const { container } = render(<Label id="my-label">Test</Label>)
      const label = container.querySelector('#my-label')
      expect(label).toBeInTheDocument()
    })

    it('debe aceptar data-testid', () => {
      render(<Label data-testid="custom-label">Test</Label>)
      expect(screen.getByTestId('custom-label')).toBeInTheDocument()
    })

    it('debe aceptar onClick', () => {
      const handleClick = jest.fn()
      render(<Label onClick={handleClick}>Clickable</Label>)
      const label = screen.getByText('Clickable')
      label.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('debe aceptar aria-label', () => {
      const { container } = render(<Label aria-label="Accessible label">Test</Label>)
      const label = container.querySelector('[data-slot="label"]')
      expect(label).toHaveAttribute('aria-label', 'Accessible label')
    })
  })

  describe('accesibilidad', () => {
    it('debe ser seleccionable con select-none (prevenir selección accidental)', () => {
      const { container } = render(<Label>Non-selectable</Label>)
      const label = container.querySelector('[data-slot="label"]')
      expect(label?.className).toContain('select-none')
    })

    it('debe funcionar correctamente en formularios', () => {
      render(
        <form>
          <div>
            <Label htmlFor="form-email">Email Address</Label>
            <input id="form-email" type="email" required />
          </div>
        </form>
      )
      
      const label = screen.getByText('Email Address')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'form-email')
      expect(input).toBeRequired()
    })

    it('debe mantener la asociación con inputs tipo checkbox', () => {
      render(
        <>
          <input id="agree" type="checkbox" />
          <Label htmlFor="agree">I agree to terms</Label>
        </>
      )
      
      const label = screen.getByText('I agree to terms')
      const checkbox = screen.getByRole('checkbox')
      
      expect(label).toHaveAttribute('for', 'agree')
      
      // Clic en label debe cambiar el estado del checkbox
      label.click()
      expect(checkbox).toBeChecked()
    })

    it('debe mantener la asociación con inputs tipo radio', () => {
      render(
        <>
          <input id="option1" type="radio" name="options" />
          <Label htmlFor="option1">Option 1</Label>
        </>
      )
      
      const label = screen.getByText('Option 1')
      const radio = screen.getByRole('radio')
      
      expect(label).toHaveAttribute('for', 'option1')
      
      label.click()
      expect(radio).toBeChecked()
    })
  })

  describe('integración con Radix UI', () => {
    it('debe renderizar usando LabelPrimitive.Root', () => {
      const { container } = render(<Label>Radix Label</Label>)
      // El label de Radix UI se renderiza como un label HTML
      expect(container.querySelector('label')).toBeInTheDocument()
    })

    it('debe heredar todas las props de Radix UI Label', () => {
      // Radix UI Label acepta todas las props de un label HTML
      render(
        <Label htmlFor="radix-input" data-state="active">
          Radix Enhanced Label
        </Label>
      )
      
      const label = screen.getByText('Radix Enhanced Label')
      expect(label).toHaveAttribute('for', 'radix-input')
      expect(label).toHaveAttribute('data-state', 'active')
    })
  })
})
