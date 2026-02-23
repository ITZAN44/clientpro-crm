import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock del hook useNotifications
const mockUseNotifications = jest.fn()

jest.mock('@/components/providers/notification-provider', () => ({
  useNotifications: () => mockUseNotifications(),
}))

// Importar después del mock
import { NotificationBadge } from './notification-badge'

describe('NotificationBadge', () => {
  beforeEach(() => {
    // Reset mock antes de cada test
    mockUseNotifications.mockReset()
  })

  test('muestra el contador cuando hay notificaciones no leídas', () => {
    mockUseNotifications.mockReturnValue({
      contadorNoLeidas: 5,
      isConnected: true,
      notificaciones: [],
      marcarComoLeida: jest.fn(),
      refetch: jest.fn(),
    })

    render(<NotificationBadge />)
    
    const contador = screen.getByText('5')
    expect(contador).toBeInTheDocument()
  })

  test('muestra "9+" cuando hay más de 9 notificaciones', () => {
    mockUseNotifications.mockReturnValue({
      contadorNoLeidas: 15,
      isConnected: true,
      notificaciones: [],
      marcarComoLeida: jest.fn(),
      refetch: jest.fn(),
    })

    render(<NotificationBadge />)
    
    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  test('no muestra contador cuando no hay notificaciones', () => {
    mockUseNotifications.mockReturnValue({
      contadorNoLeidas: 0,
      isConnected: true,
      notificaciones: [],
      marcarComoLeida: jest.fn(),
      refetch: jest.fn(),
    })

    render(<NotificationBadge />)
    
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  test('muestra indicador verde cuando está conectado', () => {
    mockUseNotifications.mockReturnValue({
      contadorNoLeidas: 0,
      isConnected: true,
      notificaciones: [],
      marcarComoLeida: jest.fn(),
      refetch: jest.fn(),
    })

    const { container } = render(<NotificationBadge />)
    
    // Busca el span con las clases de indicador verde
    const indicator = container.querySelector('.bg-lime-500')
    expect(indicator).toBeInTheDocument()
  })

  test('no muestra indicador verde cuando está desconectado', () => {
    mockUseNotifications.mockReturnValue({
      contadorNoLeidas: 0,
      isConnected: false,
      notificaciones: [],
      marcarComoLeida: jest.fn(),
      refetch: jest.fn(),
    })

    const { container } = render(<NotificationBadge />)
    
    const indicator = container.querySelector('.bg-lime-500')
    expect(indicator).not.toBeInTheDocument()
  })

  test('renderiza el icono Bell correctamente', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: 0,
      isConnected: false,
      notificaciones: [],
      marcarComoLeida: jest.fn(),
      refetch: jest.fn(),
    })

    const { container } = render(<NotificationBadge />)
    
    // Verifica que el SVG esté presente (lucide-react usa SVG)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
