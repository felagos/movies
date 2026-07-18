export type MediaType = 'movie' | 'tv'

export interface MediaSummary {
  id: number
  mediaType: MediaType
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  releaseDate: string
}

export interface Video {
  id: string
  key: string
  site: string
  type: string
  official: boolean
  name: string
}

export interface MediaDetails extends MediaSummary {
  genres: string[]
  runtime: number | null
  videos: Video[]
}

interface TmdbRawItem {
  id: number
  media_type?: MediaType
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
}

interface TmdbRawDetails extends TmdbRawItem {
  genres: { id: number; name: string }[]
  runtime?: number
  episode_run_time?: number[]
  videos: { results: Video[] }
}

const BASE_URL = 'https://api.themoviedb.org/3'
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  url.searchParams.set('api_key', TOKEN)

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

function toSummary(raw: TmdbRawItem, fallbackType: MediaType): MediaSummary {
  const mediaType = raw.media_type ?? fallbackType
  return {
    id: raw.id,
    mediaType,
    title: raw.title ?? raw.name ?? 'Untitled',
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    voteAverage: raw.vote_average,
    releaseDate: raw.release_date ?? raw.first_air_date ?? '',
  }
}

export async function getPopularMovies(): Promise<MediaSummary[]> {
  const data = await tmdbFetch<{ results: TmdbRawItem[] }>('/movie/popular', {
    language: 'en-US',
  })
  return data.results.slice(0, 15).map((item) => toSummary(item, 'movie'))
}

export async function getPopularTv(): Promise<MediaSummary[]> {
  const data = await tmdbFetch<{ results: TmdbRawItem[] }>('/tv/popular', {
    language: 'en-US',
  })
  return data.results.slice(0, 15).map((item) => toSummary(item, 'tv'))
}

export async function getVideos(mediaType: MediaType, id: number): Promise<Video[]> {
  const data = await tmdbFetch<{ results: Video[] }>(`/${mediaType}/${id}/videos`, {
    language: 'en-US',
  })

  return [...data.results].sort((a, b) => {
    const score = (video: Video) =>
      (video.type === 'Trailer' ? 2 : 0) + (video.official ? 1 : 0)
    return score(b) - score(a)
  })
}

export function getBestTrailer(videos: Video[]): Video | null {
  return videos.find((video) => video.site === 'YouTube') ?? null
}

export async function getDetails(mediaType: MediaType, id: number): Promise<MediaDetails> {
  const raw = await tmdbFetch<TmdbRawDetails>(`/${mediaType}/${id}`, {
    language: 'en-US',
    append_to_response: 'videos',
  })

  return {
    ...toSummary(raw, mediaType),
    genres: raw.genres.map((genre) => genre.name),
    runtime: raw.runtime ?? raw.episode_run_time?.[0] ?? null,
    videos: raw.videos.results,
  }
}

export function imageUrl(path: string | null, size: 'w300' | 'w500' | 'w1280' | 'original' = 'w500'): string {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/${size}${path}`
}
