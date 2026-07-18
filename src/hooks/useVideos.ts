import { useQuery } from '@tanstack/react-query'
import { getVideos, type MediaType } from '../api/tmdb'

export function useVideos(mediaType: MediaType, id: number, enabled: boolean) {
  return useQuery({
    queryKey: ['videos', mediaType, id],
    queryFn: () => getVideos(mediaType, id),
    enabled,
    staleTime: Infinity,
  })
}
