import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { MediaSummary } from '../../api/tmdb'
import { useVideos } from '../../hooks/useVideos'
import Carousel from './Carousel'

vi.mock('../../hooks/useVideos', () => ({
  useVideos: vi.fn(),
}))

vi.mocked(useVideos).mockReturnValue({ data: undefined } as ReturnType<typeof useVideos>)

const items: MediaSummary[] = [
  { id: 1, mediaType: 'movie', title: 'Movie A', overview: '', posterPath: null, backdropPath: null, voteAverage: 5, releaseDate: '' },
  { id: 2, mediaType: 'movie', title: 'Movie B', overview: '', posterPath: null, backdropPath: null, voteAverage: 5, releaseDate: '' },
]

function renderCarousel(title: string, mediaItems: MediaSummary[], isLoading = false) {
  return render(
    <MemoryRouter>
      <Carousel title={title} items={mediaItems} isLoading={isLoading} />
    </MemoryRouter>,
  )
}

describe('Carousel', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test('renders the title', () => {
    renderCarousel('Popular Movies', [])
    expect(screen.getByText('Popular Movies')).toBeInTheDocument()
  })

  test('renders 8 CardSkeletons when isLoading=true', () => {
    renderCarousel('t', [], true)
    expect(screen.getAllByTestId('card-skeleton')).toHaveLength(8)
  })

  test('renders one real Card per item when not loading', () => {
    renderCarousel('t', items)
    expect(screen.getByAltText('Movie A')).toBeInTheDocument()
    expect(screen.getByAltText('Movie B')).toBeInTheDocument()
  })

  test('renders zero cards for empty items array', () => {
    renderCarousel('t', [])
    const track = screen.getByTestId('carousel-track')
    expect(track.children).toHaveLength(0)
  })

  describe('scroll arrows', () => {
    test('clicking left arrow calls scrollBy with negative left offset', () => {
      const scrollBySpy = vi.fn()
      HTMLElement.prototype.scrollBy = scrollBySpy

      renderCarousel('t', items)
      const track = screen.getByTestId('carousel-track')
      Object.defineProperty(track, 'clientWidth', { value: 1000 })
      fireEvent.click(screen.getByLabelText('Scroll left'))

      expect(scrollBySpy).toHaveBeenCalledWith({ left: -800, behavior: 'smooth' })
    })

    test('clicking right arrow calls scrollBy with positive left offset', () => {
      const scrollBySpy = vi.fn()
      HTMLElement.prototype.scrollBy = scrollBySpy

      renderCarousel('t', items)
      const track = screen.getByTestId('carousel-track')
      Object.defineProperty(track, 'clientWidth', { value: 1000 })
      fireEvent.click(screen.getByLabelText('Scroll right'))

      expect(scrollBySpy).toHaveBeenCalledWith({ left: 800, behavior: 'smooth' })
    })
  })
})
