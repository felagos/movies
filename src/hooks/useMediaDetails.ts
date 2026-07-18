import { useQuery } from '@tanstack/react-query'
import { getDetails, type MediaType } from '../api/tmdb'

export function useMediaDetails(mediaType: MediaType | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ['details', mediaType, id],
    queryFn: () => getDetails(mediaType!, Number(id)),
    enabled: Boolean(mediaType && id),
  })
}
