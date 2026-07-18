import { useInfiniteQuery } from '@tanstack/react-query'
import { getMovies, type MovieCategory } from '../api/tmdb'

export function useMovies(category: MovieCategory) {
  return useInfiniteQuery({
    queryKey: ['movies', category],
    queryFn: ({ pageParam }) => getMovies(category, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })
}
