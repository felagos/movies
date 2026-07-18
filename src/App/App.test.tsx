import { describe, test, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import App from './App'

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<div>child content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('App', () => {
  afterEach(() => {
    cleanup()
  })

  test('renders logo Link pointing to "/"', () => {
    renderApp()
    expect(screen.getByText('CineStream')).toHaveAttribute('href', '/')
  })

  test('renders nav Home Link pointing to "/"', () => {
    renderApp()
    const homeLinks = screen.getAllByText('Home')
    expect(homeLinks[0]).toHaveAttribute('href', '/')
  })

  test('renders Movies and TV Shows as non-navigating placeholders', () => {
    renderApp()
    expect(screen.getByText('Movies')).toHaveAttribute('href', '#')
    expect(screen.getByText('TV Shows')).toHaveAttribute('href', '#')
  })

  test('renders Outlet content (nested route child)', () => {
    renderApp()
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})
