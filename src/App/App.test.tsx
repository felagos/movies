import { describe, test, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import App from './App'

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<div>child content</div>} />
          <Route path="movies" element={<div>movies content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('App', () => {
  afterEach(() => {
    cleanup()
  })

  test('renders nav Home Link pointing to "/"', () => {
    renderApp()
    expect(screen.getByText('Home')).toHaveAttribute('href', '/')
  })

  test('renders nav Movies Link pointing to "/movies"', () => {
    renderApp()
    expect(screen.getByText('Movies')).toHaveAttribute('href', '/movies')
  })

  test('highlights Home as active when on "/"', () => {
    renderApp('/')
    expect(screen.getByText('Home')).toHaveClass('active')
    expect(screen.getByText('Movies')).not.toHaveClass('active')
  })

  test('highlights Movies as active when on "/movies"', () => {
    renderApp('/movies')
    expect(screen.getByText('Movies')).toHaveClass('active')
    expect(screen.getByText('Home')).not.toHaveClass('active')
  })

  test('renders TV Shows as a non-navigating placeholder', () => {
    renderApp()
    expect(screen.getByText('TV Shows')).toHaveAttribute('href', '#')
  })

  test('renders Outlet content (nested route child)', () => {
    renderApp()
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})
