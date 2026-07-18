import { describe, test, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import * as tmdb from '../api/tmdb'
import type { MoviesPage } from '../api/tmdb'
import { useMovies } from './useMovies'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const page1: MoviesPage = {
  items: [
    {
      id: 1,
      mediaType: 'movie',
      title: 'Movie 1',
      overview: '',
      posterPath: null,
      backdropPath: null,
      voteAverage: 5,
      releaseDate: '',
    },
  ],
  page: 1,
  totalPages: 2,
}

const page2: MoviesPage = { ...page1, page: 2, totalPages: 2 }
const onlyPage: MoviesPage = { ...page1, page: 1, totalPages: 1 }

describe('useMovies', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test('fetches page 1 for the given category on mount', async () => {
    vi.spyOn(tmdb, 'getMovies').mockResolvedValue(page1)

    const { result } = renderHook(() => useMovies('popular'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(tmdb.getMovies).toHaveBeenCalledWith('popular', 1)
    expect(result.current.data?.pages).toEqual([page1])
  })

  test('fetchNextPage requests page + 1 while page < totalPages', async () => {
    vi.spyOn(tmdb, 'getMovies').mockResolvedValueOnce(page1).mockResolvedValueOnce(page2)

    const { result } = renderHook(() => useMovies('popular'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(true)

    result.current.fetchNextPage()

    await waitFor(() => expect(result.current.data?.pages).toEqual([page1, page2]))
    expect(tmdb.getMovies).toHaveBeenCalledWith('popular', 2)
  })

  test('hasNextPage is false once page === totalPages', async () => {
    vi.spyOn(tmdb, 'getMovies').mockResolvedValue(onlyPage)

    const { result } = renderHook(() => useMovies('popular'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(false)
  })
})
