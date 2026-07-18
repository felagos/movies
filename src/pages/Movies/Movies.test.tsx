import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as tmdb from '../../api/tmdb'
import type { MediaSummary, MoviesPage } from '../../api/tmdb'
import Movies from './Movies'

class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = []
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    IntersectionObserverStub.instances.push(this)
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
}

const movie: MediaSummary = {
  id: 1,
  mediaType: 'movie',
  title: 'Movie A',
  overview: '',
  posterPath: null,
  backdropPath: null,
  voteAverage: 5,
  releaseDate: '',
}

function renderMovies() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Movies />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Movies', () => {
  beforeEach(() => {
    IntersectionObserverStub.instances = []
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    vi.spyOn(tmdb, 'getVideos').mockResolvedValue([])
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  test('renders 20 CardSkeletons while the initial request is pending', () => {
    vi.spyOn(tmdb, 'getMovies').mockReturnValue(new Promise(() => {}))

    renderMovies()

    expect(screen.getAllByTestId('card-skeleton')).toHaveLength(20)
  })

  test('renders real cards once the request resolves', async () => {
    vi.spyOn(tmdb, 'getMovies').mockResolvedValue({ items: [movie], page: 1, totalPages: 1 })

    renderMovies()

    expect(await screen.findByAltText('Movie A')).toBeInTheDocument()
  })

  test('renders error message when the request fails', async () => {
    vi.spyOn(tmdb, 'getMovies').mockRejectedValue(new Error('fail'))

    renderMovies()

    expect(await screen.findByText(/Could not load movies/)).toBeInTheDocument()
  })

  test('clicking a tab requests the new category', async () => {
    const getMoviesSpy = vi
      .spyOn(tmdb, 'getMovies')
      .mockResolvedValue({ items: [movie], page: 1, totalPages: 1 })

    renderMovies()
    await screen.findByAltText('Movie A')
    expect(getMoviesSpy).toHaveBeenCalledWith('popular', 1)

    fireEvent.click(screen.getByText('Top Rated'))

    await waitFor(() => expect(getMoviesSpy).toHaveBeenCalledWith('top_rated', 1))
  })

  test('sentinel intersecting fetches the next page when one is available', async () => {
    let resolvePage2!: (value: MoviesPage) => void
    const page2 = new Promise<MoviesPage>((resolve) => {
      resolvePage2 = resolve
    })
    const getMoviesSpy = vi
      .spyOn(tmdb, 'getMovies')
      .mockResolvedValueOnce({ items: [movie], page: 1, totalPages: 2 })
      .mockReturnValueOnce(page2)

    renderMovies()
    await screen.findByAltText('Movie A')

    IntersectionObserverStub.instances.at(-1)!.trigger(true)

    await waitFor(() => expect(screen.getAllByTestId('card-skeleton')).toHaveLength(5))
    expect(getMoviesSpy).toHaveBeenCalledWith('popular', 2)

    resolvePage2({ items: [{ ...movie, id: 2 }], page: 2, totalPages: 2 })
    await waitFor(() => expect(screen.queryAllByTestId('card-skeleton')).toHaveLength(0))
  })

  test('sentinel intersecting does nothing once there is no next page', async () => {
    const getMoviesSpy = vi
      .spyOn(tmdb, 'getMovies')
      .mockResolvedValue({ items: [movie], page: 1, totalPages: 1 })

    renderMovies()
    await screen.findByAltText('Movie A')

    IntersectionObserverStub.instances.at(-1)!.trigger(true)

    expect(getMoviesSpy).toHaveBeenCalledTimes(1)
  })
})
