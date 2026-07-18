import { useRef, type ReactNode } from 'react'
import type { MediaSummary } from '../../api/tmdb'
import Card from '../Card/Card'
import CardSkeleton from '../Card/CardSkeleton'
import './Carousel.css'

const SKELETON_COUNT = 8

interface CarouselProps {
  title: string
  items: MediaSummary[]
  isLoading?: boolean
}

function Carousel({ title, items, isLoading = false }: CarouselProps): ReactNode {
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current
    if (!track) return
    const amount = track.clientWidth * 0.8
    track.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="carousel">
      <h2 className="carousel__title">{title}</h2>
      <div className="carousel__wrapper">
        <button
          type="button"
          className="carousel__arrow carousel__arrow--left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div className="carousel__track" ref={trackRef}>
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => <CardSkeleton key={index} />)
            : items.map((item) => <Card key={`${item.mediaType}-${item.id}`} media={item} />)}
        </div>

        <button
          type="button"
          className="carousel__arrow carousel__arrow--right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  )
}

export default Carousel
