import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getPopularMovies,
  getPopularTv,
  getVideos,
  getBestTrailer,
  getDetails,
  imageUrl,
  type Video,
} from './tmdb'

function mockFetchOnce(body: unknown, ok = true, status = 200, statusText = 'OK') {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    statusText,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch
}

describe('tmdb.ts', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getPopularMovies', () => {
    test('requests /movie/popular with language=en-US and api_key', async () => {
      mockFetchOnce({ results: [] })
      await getPopularMovies()

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as URL
      expect(calledUrl.toString()).toContain('/movie/popular')
      expect(calledUrl.searchParams.get('language')).toBe('en-US')
      expect(calledUrl.searchParams.get('api_key')).toBe('test-token')
    })

    test('maps raw results to MediaSummary, slicing to top 15', async () => {
      const raw = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        title: `Movie ${i}`,
        overview: 'overview',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        vote_average: 7.5,
        release_date: '2024-01-01',
      }))
      mockFetchOnce({ results: raw })

      const result = await getPopularMovies()

      expect(result).toHaveLength(15)
      expect(result[0]).toEqual({
        id: 0,
        mediaType: 'movie',
        title: 'Movie 0',
        overview: 'overview',
        posterPath: '/poster.jpg',
        backdropPath: '/backdrop.jpg',
        voteAverage: 7.5,
        releaseDate: '2024-01-01',
      })
    })

    test('falls back to name/"Untitled" when title missing', async () => {
      mockFetchOnce({
        results: [
          { id: 1, name: 'Named Item', overview: '', poster_path: null, backdrop_path: null, vote_average: 0 },
          { id: 2, overview: '', poster_path: null, backdrop_path: null, vote_average: 0 },
        ],
      })

      const result = await getPopularMovies()

      expect(result[0].title).toBe('Named Item')
      expect(result[1].title).toBe('Untitled')
    })

    test('falls back to first_air_date/"" when release_date missing', async () => {
      mockFetchOnce({
        results: [
          { id: 1, title: 'A', overview: '', poster_path: null, backdrop_path: null, vote_average: 0, first_air_date: '2020-05-05' },
          { id: 2, title: 'B', overview: '', poster_path: null, backdrop_path: null, vote_average: 0 },
        ],
      })

      const result = await getPopularMovies()

      expect(result[0].releaseDate).toBe('2020-05-05')
      expect(result[1].releaseDate).toBe('')
    })

    test('throws with status and statusText when response is not ok', async () => {
      mockFetchOnce(null, false, 401, 'Unauthorized')

      await expect(getPopularMovies()).rejects.toThrow('TMDB request failed: 401 Unauthorized')
    })
  })

  describe('getPopularTv', () => {
    test('requests /tv/popular', async () => {
      mockFetchOnce({ results: [] })
      await getPopularTv()

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as URL
      expect(calledUrl.toString()).toContain('/tv/popular')
    })

    test('maps raw results with mediaType "tv" fallback', async () => {
      mockFetchOnce({
        results: [{ id: 1, name: 'Show', overview: '', poster_path: null, backdrop_path: null, vote_average: 8 }],
      })

      const result = await getPopularTv()

      expect(result[0].mediaType).toBe('tv')
      expect(result[0].title).toBe('Show')
    })
  })

  describe('getVideos', () => {
    test('requests /{mediaType}/{id}/videos', async () => {
      mockFetchOnce({ results: [] })
      await getVideos('movie', 42)

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as URL
      expect(calledUrl.toString()).toContain('/movie/42/videos')
    })

    test('sorts videos: Trailer+official > Trailer only > official only > neither', async () => {
      const videos: Video[] = [
        { id: '1', key: 'k1', site: 'YouTube', type: 'Teaser', official: false, name: 'neither' },
        { id: '2', key: 'k2', site: 'YouTube', type: 'Trailer', official: true, name: 'trailer+official' },
        { id: '3', key: 'k3', site: 'YouTube', type: 'Featurette', official: true, name: 'official only' },
        { id: '4', key: 'k4', site: 'YouTube', type: 'Trailer', official: false, name: 'trailer only' },
      ]
      mockFetchOnce({ results: videos })

      const result = await getVideos('movie', 1)

      expect(result.map((v) => v.name)).toEqual([
        'trailer+official',
        'trailer only',
        'official only',
        'neither',
      ])
    })
  })

  describe('getBestTrailer', () => {
    test('returns first video with site === "YouTube"', () => {
      const videos: Video[] = [
        { id: '1', key: 'k1', site: 'Vimeo', type: 'Trailer', official: true, name: 'a' },
        { id: '2', key: 'k2', site: 'YouTube', type: 'Trailer', official: true, name: 'b' },
      ]
      expect(getBestTrailer(videos)?.name).toBe('b')
    })

    test('returns null when no YouTube video present', () => {
      const videos: Video[] = [{ id: '1', key: 'k1', site: 'Vimeo', type: 'Trailer', official: true, name: 'a' }]
      expect(getBestTrailer(videos)).toBeNull()
    })

    test('returns null for empty array', () => {
      expect(getBestTrailer([])).toBeNull()
    })
  })

  describe('getDetails', () => {
    test('requests /{mediaType}/{id} with append_to_response=videos', async () => {
      mockFetchOnce({
        id: 1,
        title: 'Movie',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        genres: [],
        videos: { results: [] },
      })

      await getDetails('movie', 1)

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as URL
      expect(calledUrl.toString()).toContain('/movie/1')
      expect(calledUrl.searchParams.get('append_to_response')).toBe('videos')
    })

    test('runtime falls back to episode_run_time[0] when runtime absent', async () => {
      mockFetchOnce({
        id: 1,
        name: 'Show',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        genres: [],
        episode_run_time: [45, 46],
        videos: { results: [] },
      })

      const details = await getDetails('tv', 1)

      expect(details.runtime).toBe(45)
    })

    test('runtime is null when neither runtime nor episode_run_time present', async () => {
      mockFetchOnce({
        id: 1,
        title: 'Movie',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        genres: [],
        videos: { results: [] },
      })

      const details = await getDetails('movie', 1)

      expect(details.runtime).toBeNull()
    })

    test('combines genres, videos, and summary fields', async () => {
      mockFetchOnce({
        id: 1,
        title: 'Movie',
        overview: 'desc',
        poster_path: '/p.jpg',
        backdrop_path: '/b.jpg',
        vote_average: 9,
        release_date: '2023-01-01',
        genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Drama' }],
        runtime: 120,
        videos: { results: [{ id: 'v1', key: 'k1', site: 'YouTube', type: 'Trailer', official: true, name: 'Trailer' }] },
      })

      const details = await getDetails('movie', 1)

      expect(details.genres).toEqual(['Action', 'Drama'])
      expect(details.runtime).toBe(120)
      expect(details.videos).toHaveLength(1)
      expect(details.title).toBe('Movie')
      expect(details.mediaType).toBe('movie')
    })
  })

  describe('imageUrl', () => {
    test('builds URL with given size for non-null path', () => {
      expect(imageUrl('/poster.jpg', 'w300')).toBe('https://image.tmdb.org/t/p/w300/poster.jpg')
    })

    test('defaults to w500 when size omitted', () => {
      expect(imageUrl('/poster.jpg')).toBe('https://image.tmdb.org/t/p/w500/poster.jpg')
    })

    test('returns empty string when path is null', () => {
      expect(imageUrl(null)).toBe('')
    })
  })
})
