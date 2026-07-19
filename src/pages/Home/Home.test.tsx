import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { UseQueryResult } from '@tanstack/react-query'
import type { MediaSummary } from '../../api/tmdb'
import * as usePopular from '../../hooks/usePopular'
import { useVideos } from '../../hooks/useVideos'
import Home from './Home'

const IntersectionObserverStub = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('../../hooks/usePopular')
vi.mock('../../hooks/useVideos', () => ({
  useVideos: vi.fn(),
}))

vi.mocked(useVideos).mockReturnValue({ data: undefined } as ReturnType<typeof useVideos>)

vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

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

function mockQuery(overrides: Partial<UseQueryResult<MediaSummary[], Error>>): UseQueryResult<MediaSummary[], Error> {
  return {
    data: undefined,
    isError: false,
    isLoading: false,
    ...overrides,
  } as UseQueryResult<MediaSummary[], Error>
}

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  test('renders error message when usePopularMovies isError', () => {
    vi.spyOn(usePopular, 'usePopularMovies').mockReturnValue(mockQuery({ isError: true }))
    vi.spyOn(usePopular, 'usePopularTv').mockReturnValue(mockQuery({}))

    renderHome()

    expect(screen.getByText(/Could not load content/)).toBeInTheDocument()
  })

  test('renders error message when usePopularTv isError', () => {
    vi.spyOn(usePopular, 'usePopularMovies').mockReturnValue(mockQuery({}))
    vi.spyOn(usePopular, 'usePopularTv').mockReturnValue(mockQuery({ isError: true }))

    renderHome()

    expect(screen.getByText(/Could not load content/)).toBeInTheDocument()
  })

  test('renders real Hero using movies.data[0] when present', () => {
    vi.spyOn(usePopular, 'usePopularMovies').mockReturnValue(mockQuery({ data: [movie] }))
    vi.spyOn(usePopular, 'usePopularTv').mockReturnValue(mockQuery({ data: [] }))

    renderHome()

    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByText('Movie A')).toBeInTheDocument()
    expect(screen.getByText('More Info')).toBeInTheDocument()
  })

  test('does not render Hero when movies.data is empty', () => {
    vi.spyOn(usePopular, 'usePopularMovies').mockReturnValue(mockQuery({ data: [] }))
    vi.spyOn(usePopular, 'usePopularTv').mockReturnValue(mockQuery({ data: [] }))

    renderHome()

    expect(screen.queryByTestId('hero')).not.toBeInTheDocument()
  })

  test('renders skeleton cards for a loading carousel and real cards for a loaded one', () => {
    vi.spyOn(usePopular, 'usePopularMovies').mockReturnValue(mockQuery({ isLoading: true, data: undefined }))
    vi.spyOn(usePopular, 'usePopularTv').mockReturnValue(mockQuery({ isLoading: false, data: [movie] }))

    renderHome()

    expect(screen.getAllByTestId('card-skeleton')).toHaveLength(8)
    expect(screen.getByAltText('Movie A')).toBeInTheDocument()
  })

  test('renders both "Popular Movies" and "Popular TV Shows" carousels', () => {
    vi.spyOn(usePopular, 'usePopularMovies').mockReturnValue(mockQuery({ data: [] }))
    vi.spyOn(usePopular, 'usePopularTv').mockReturnValue(mockQuery({ data: [] }))

    renderHome()

    expect(screen.getByText('Popular Movies')).toBeInTheDocument()
    expect(screen.getByText('Popular TV Shows')).toBeInTheDocument()
  })
})
