import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import type { MediaSummary } from '../../api/tmdb'
import Hero from './Hero'

const navigateSpy = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

const item: MediaSummary = {
  id: 7,
  mediaType: 'movie',
  title: 'Big Movie',
  overview: 'A great overview',
  posterPath: null,
  backdropPath: '/backdrop.jpg',
  voteAverage: 8.456,
  releaseDate: '2022-03-15',
}

describe('Hero', () => {
  afterEach(() => {
    cleanup()
    navigateSpy.mockClear()
  })

  test('renders title, rating, and overview', () => {
    render(<Hero item={item} />)

    expect(screen.getByText('Big Movie')).toBeInTheDocument()
    expect(screen.getByText('8.5 ★')).toBeInTheDocument()
    expect(screen.getByText('A great overview')).toBeInTheDocument()
  })

  test('renders backdropPath via imageUrl in background-image style', () => {
    const { container } = render(<Hero item={item} />)

    const hero = container.querySelector('.hero') as HTMLElement
    expect(hero.style.backgroundImage).toContain('https://image.tmdb.org/t/p/w1280/backdrop.jpg')
  })

  test('renders year when releaseDate present', () => {
    render(<Hero item={item} />)
    expect(screen.getByText('2022')).toBeInTheDocument()
  })

  test('does not render year span when releaseDate is empty string', () => {
    render(<Hero item={{ ...item, releaseDate: '' }} />)
    expect(screen.queryByText('2022')).not.toBeInTheDocument()
  })

  test('clicking "More Info" calls navigate with `/${mediaType}/${id}`', () => {
    render(<Hero item={item} />)

    fireEvent.click(screen.getByText('More Info'))

    expect(navigateSpy).toHaveBeenCalledWith('/movie/7')
  })
})
