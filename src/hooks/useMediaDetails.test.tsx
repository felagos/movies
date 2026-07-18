import { describe, test, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import * as tmdb from '../api/tmdb'
import type { MediaDetails } from '../api/tmdb'
import { useMediaDetails } from './useMediaDetails'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const details: MediaDetails = {
  id: 1,
  mediaType: 'movie',
  title: 'Movie',
  overview: '',
  posterPath: null,
  backdropPath: null,
  voteAverage: 5,
  releaseDate: '',
  genres: [],
  runtime: null,
  videos: [],
}

describe('useMediaDetails', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test('is disabled when mediaType is undefined', () => {
    const spy = vi.spyOn(tmdb, 'getDetails').mockResolvedValue(details)

    const { result } = renderHook(() => useMediaDetails(undefined, '1'), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(spy).not.toHaveBeenCalled()
  })

  test('is disabled when id is undefined', () => {
    const spy = vi.spyOn(tmdb, 'getDetails').mockResolvedValue(details)

    const { result } = renderHook(() => useMediaDetails('movie', undefined), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(spy).not.toHaveBeenCalled()
  })

  test('fetches getDetails(mediaType, Number(id)) when both present', async () => {
    vi.spyOn(tmdb, 'getDetails').mockResolvedValue(details)

    const { result } = renderHook(() => useMediaDetails('movie', '1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(tmdb.getDetails).toHaveBeenCalledWith('movie', 1)
    expect(result.current.data).toEqual(details)
  })
})
