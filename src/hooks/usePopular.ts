import { useQuery } from '@tanstack/react-query'
import { getPopularMovies, getPopularTv } from '../api/tmdb'

export function usePopularMovies() {
  return useQuery({
    queryKey: ['popular', 'movie'],
    queryFn: getPopularMovies,
  })
}

export function usePopularTv() {
  return useQuery({
    queryKey: ['popular', 'tv'],
    queryFn: getPopularTv,
  })
}
