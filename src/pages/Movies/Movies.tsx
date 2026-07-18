import { useEffect, useRef, useState } from 'react'
import type { MovieCategory } from '../../api/tmdb'
import Card from '../../components/Card/Card'
import CardSkeleton from '../../components/Card/CardSkeleton'
import { useMovies } from '../../hooks/useMovies'
import './Movies.css'

const INITIAL_SKELETON_COUNT = 20
const NEXT_PAGE_SKELETON_COUNT = 5

const CATEGORIES: { key: MovieCategory; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'top_rated', label: 'Top Rated' },
  { key: 'now_playing', label: 'Now Playing' },
  { key: 'upcoming', label: 'Upcoming' },
]

function Movies() {
  const [category, setCategory] = useState<MovieCategory>('popular')
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useMovies(category)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    /* v8 ignore next -- defensive guard; React attaches the ref before this effect runs */
    if (!sentinel) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isError) return <p className="error">Could not load movies from TMDB.</p>

  const items = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="movies">
      <div className="movies__tabs">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`movies__tab ${category === key ? 'movies__tab--active' : ''}`}
            onClick={() => setCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="movies__grid">
        {isLoading
          ? Array.from({ length: INITIAL_SKELETON_COUNT }, (_, index) => <CardSkeleton key={index} />)
          : items.map((item) => <Card key={item.id} media={item} />)}
        {isFetchingNextPage &&
          Array.from({ length: NEXT_PAGE_SKELETON_COUNT }, (_, index) => <CardSkeleton key={`next-${index}`} />)}
      </div>

      <div ref={sentinelRef} />
    </div>
  )
}

export default Movies
