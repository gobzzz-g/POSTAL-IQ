import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App, AppRoutes } from '@/App'
import { UserLoginPage } from '@/features/auth/UserLoginPage'

// Mock Leaflet as it requires DOM canvas & browser layout
vi.mock('leaflet', () => {
  return {
    default: {
      map: () => ({
        setView: vi.fn(),
        remove: vi.fn(),
        fitBounds: vi.fn(),
      }),
      tileLayer: () => ({
        addTo: vi.fn(),
      }),
      layerGroup: () => ({
        addTo: vi.fn(),
        clearLayers: vi.fn(),
        addLayer: vi.fn(),
      }),
      circleMarker: () => ({
        bindPopup: vi.fn(),
        on: vi.fn(),
        openPopup: vi.fn(),
      }),
      latLngBounds: () => ({
        extend: vi.fn(),
        isValid: () => false,
      }),
      Icon: {
        Default: {
          prototype: {},
          mergeOptions: vi.fn(),
        },
      },
    },
  }
})

const renderWithRoute = (initialRoute: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('POSTALIQ Public Homepage & Routing Architecture', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders public corporate homepage with Hitit-inspired editorial hero', () => {
    renderWithRoute('/')
    // Brand wordmark
    expect(screen.getAllByText(/POSTAL/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/INDIA POST ML/i).length).toBeGreaterThan(0)

    // Corporate header links
    expect(screen.getByText('Platform')).toBeDefined()
    expect(screen.getAllByText('Features').length).toBeGreaterThan(0)
    expect(screen.getAllByText('How It Works').length).toBeGreaterThan(0)
    expect(screen.getAllByText('About').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Login').length).toBeGreaterThan(0)

    // Hero headline and copy
    expect(screen.getByText(/Every address\./i)).toBeDefined()
    expect(screen.getByText(/One intelligent match\./i)).toBeDefined()
    expect(screen.getAllByText(/Identify PIN Code/i).length).toBeGreaterThan(0)

    // No administrative controls on the public homepage
    expect(screen.queryByText(/Feedback Queue/i)).toBeNull()
    expect(screen.queryByText(/Dataset & Imports/i)).toBeNull()
  })

  it('unauthenticated attempt to explore app workspace redirects to /login', async () => {
    renderWithRoute('/app/predict')

    await waitFor(() => {
      expect(document.body.innerHTML).toContain('User Sign In')
    })
  })

  it('authenticated user navigating to /app/predict renders address workspace', async () => {
    localStorage.setItem('postaliq_user_session', 'analyst@logistics.in')
    renderWithRoute('/app/predict')

    const textarea = screen.getByPlaceholderText(/Enter a street, building, locality/i)
    expect(textarea).toBeDefined()

    fireEvent.change(textarea, { target: { value: 'Koramangala Bangalore' } })
    expect(screen.getByText(/21 \/ 1000/)).toBeDefined()

    // Tab switching in workspace
    const pinTab = screen.getByText(/Direct 6-Digit PIN Lookup/i)
    fireEvent.click(pinTab)
    expect(screen.getByPlaceholderText(/e\.g\. 560034/i)).toBeDefined()

    // Verify user application navigation does NOT display administrator controls
    expect(screen.queryByText(/Administrator Tools/i)).toBeNull()
    expect(screen.queryByText(/Dataset & Imports/i)).toBeNull()
  })

  it('navigating to /login renders user login page', async () => {
    render(
      <MemoryRouter>
        <UserLoginPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/User Sign In/i)).toBeDefined()
    expect(screen.getByPlaceholderText(/analyst@logistics\.in/i)).toBeDefined()
  })

  it('navigating to /admin/login renders administrator access portal', async () => {
    renderWithRoute('/admin/login')

    await waitFor(() => {
      expect(screen.getByText(/Administrator Access/i)).toBeDefined()
      expect(screen.getByPlaceholderText(/admin/i)).toBeDefined()
    })
  })

  it('unauthenticated access to /admin redirects to /admin/login', async () => {
    renderWithRoute('/admin')

    await waitFor(() => {
      expect(screen.getByText(/Administrator Access/i)).toBeDefined()
    })
  })
})
