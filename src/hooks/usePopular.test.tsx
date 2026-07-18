import { describe, test, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import * as tmdb from '../api/tmdb'
import type { MediaSummary } from '../api/tmdb'
import { usePopularMovies, usePopularTv } from './usePopular'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const movie: MediaSummary = {
  id: 1,
  mediaType: 'movie',
  title: 'Movie',
  overview: '',
  posterPath: null,
  backdropPath: null,
  voteAverage: 5,
  releaseDate: '',
}

describe('usePopularMovies / usePopularTv', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test('usePopularMovies calls getPopularMovies via useQuery and returns data', async () => {
    vi.spyOn(tmdb, 'getPopularMovies').mockResolvedValue([movie])

    const { result } = renderHook(() => usePopularMovies(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(tmdb.getPopularMovies).toHaveBeenCalled()
    expect(result.current.data).toEqual([movie])
  })

  test('usePopularTv calls getPopularTv via useQuery and returns data', async () => {
    vi.spyOn(tmdb, 'getPopularTv').mockResolvedValue([{ ...movie, mediaType: 'tv' }])

    const { result } = renderHook(() => usePopularTv(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(tmdb.getPopularTv).toHaveBeenCalled()
    expect(result.current.data?.[0].mediaType).toBe('tv')
  })
})
