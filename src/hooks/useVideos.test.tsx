import { describe, test, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import * as tmdb from '../api/tmdb'
import type { Video } from '../api/tmdb'
import { useVideos } from './useVideos'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const videos: Video[] = [{ id: '1', key: 'k1', site: 'YouTube', type: 'Trailer', official: true, name: 'Trailer' }]

describe('useVideos', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test('does not fetch when enabled=false', () => {
    const spy = vi.spyOn(tmdb, 'getVideos').mockResolvedValue(videos)

    const { result } = renderHook(() => useVideos('movie', 1, false), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(spy).not.toHaveBeenCalled()
  })

  test('fetches getVideos(mediaType, id) when enabled=true', async () => {
    vi.spyOn(tmdb, 'getVideos').mockResolvedValue(videos)

    const { result } = renderHook(() => useVideos('movie', 1, true), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(tmdb.getVideos).toHaveBeenCalledWith('movie', 1)
    expect(result.current.data).toEqual(videos)
  })
})
