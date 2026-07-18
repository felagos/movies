import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { UseQueryResult } from '@tanstack/react-query'
import type { MediaDetails, Video } from '../../api/tmdb'
import * as useMediaDetailsModule from '../../hooks/useMediaDetails'
import Detail from './Detail'

vi.mock('../../hooks/useMediaDetails')

function mockQuery(overrides: Partial<UseQueryResult<MediaDetails, Error>>): UseQueryResult<MediaDetails, Error> {
  return {
    data: undefined,
    isError: false,
    isLoading: false,
    ...overrides,
  } as UseQueryResult<MediaDetails, Error>
}

function renderDetail(mediaType = 'movie', id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/${mediaType}/${id}`]}>
      <Routes>
        <Route path=":mediaType/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  )
}

const baseDetails: MediaDetails = {
  id: 1,
  mediaType: 'movie',
  title: 'Some Movie',
  overview: 'An overview',
  posterPath: '/p.jpg',
  backdropPath: '/b.jpg',
  voteAverage: 7.891,
  releaseDate: '2020-05-05',
  genres: [],
  runtime: null,
  videos: [],
}

describe('Detail', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test('renders DetailSkeleton when isLoading is true', () => {
    vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(mockQuery({ isLoading: true }))

    renderDetail()

    expect(screen.getByTestId('detail-skeleton-hero')).toBeInTheDocument()
  })

  test('renders DetailSkeleton when details is undefined even if not loading', () => {
    vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(mockQuery({ isLoading: false, data: undefined }))

    renderDetail()

    expect(screen.getByTestId('detail-skeleton-hero')).toBeInTheDocument()
  })

  test('renders error message when isError is true', () => {
    vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(mockQuery({ isError: true }))

    renderDetail()

    expect(screen.getByText(/Could not load details/)).toBeInTheDocument()
  })

  test('renders title, rating, overview, poster/backdrop when loaded', () => {
    vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(mockQuery({ data: baseDetails }))

    renderDetail()

    expect(screen.getByText('Some Movie')).toBeInTheDocument()
    expect(screen.getByText('★ 7.9')).toBeInTheDocument()
    expect(screen.getByText('An overview')).toBeInTheDocument()
    const poster = screen.getByAltText('Some Movie') as HTMLImageElement
    expect(poster.src).toBe('https://image.tmdb.org/t/p/w300/p.jpg')
    const hero = screen.getByTestId('detail-hero') as HTMLElement
    expect(hero.style.backgroundImage).toContain('https://image.tmdb.org/t/p/w1280/b.jpg')
  })

  test('renders year from releaseDate, omits when empty', () => {
    vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(
      mockQuery({ data: { ...baseDetails, releaseDate: '' } }),
    )

    renderDetail()

    expect(screen.queryByText('2020')).not.toBeInTheDocument()
  })

  test('renders runtime span only when truthy', () => {
    vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(
      mockQuery({ data: { ...baseDetails, runtime: 120 } }),
    )

    renderDetail()

    expect(screen.getByText('120 min')).toBeInTheDocument()
  })

  test('renders genres joined by ", " only when present', () => {
    vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(
      mockQuery({ data: { ...baseDetails, genres: ['Action', 'Drama'] } }),
    )

    renderDetail()

    expect(screen.getByText('Action, Drama')).toBeInTheDocument()
  })

  describe('trailer filter/sort/slice', () => {
    function video(overrides: Partial<Video>): Video {
      return { id: 'id', key: 'key', site: 'YouTube', type: 'Trailer', official: true, name: 'n', ...overrides }
    }

    test('excludes non-YouTube videos', () => {
      const videos: Video[] = [video({ id: '1', site: 'Vimeo' }), video({ id: '2', site: 'YouTube', name: 'yt-trailer' })]
      vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(mockQuery({ data: { ...baseDetails, videos } }))

      renderDetail()

      expect(screen.getByText('▶ yt-trailer')).toBeInTheDocument()
      expect(screen.queryByText('▶ n')).not.toBeInTheDocument()
    })

    test('sorts Trailer+official videos before others', () => {
      const videos: Video[] = [
        video({ id: '1', type: 'Teaser', official: false, name: 'teaser' }),
        video({ id: '2', type: 'Trailer', official: true, name: 'trailer' }),
      ]
      vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(mockQuery({ data: { ...baseDetails, videos } }))

      renderDetail()

      const buttons = screen.getAllByRole('button', { name: /▶/ })
      expect(buttons[0]).toHaveTextContent('trailer')
      expect(buttons[1]).toHaveTextContent('teaser')
    })

    test('slices to top 5 when more than 5 qualifying trailers exist', () => {
      const videos: Video[] = Array.from({ length: 8 }, (_, i) => video({ id: String(i), name: `trailer-${i}` }))
      vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(mockQuery({ data: { ...baseDetails, videos } }))

      renderDetail()

      const buttons = screen.getAllByRole('button', { name: /▶/ })
      expect(buttons).toHaveLength(5)
    })

    test('renders TrailerTabs section only when trailers.length > 0', () => {
      vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(
        mockQuery({ data: { ...baseDetails, videos: [video({ name: 'test-trailer' })] } }),
      )

      renderDetail()

      expect(screen.getByText('▶ test-trailer')).toBeInTheDocument()
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
    })

    test('omits trailers section entirely when no YouTube videos', () => {
      vi.spyOn(useMediaDetailsModule, 'useMediaDetails').mockReturnValue(
        mockQuery({ data: { ...baseDetails, videos: [video({ site: 'Vimeo' })] } }),
      )

      renderDetail()

      expect(screen.queryByRole('button', { name: /▶/ })).not.toBeInTheDocument()
    })
  })
})
