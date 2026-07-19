import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBestTrailer, imageUrl, type MediaSummary } from '../../api/tmdb'
import { useVideos } from '../../hooks/useVideos'
import { useLazyImage } from '../../hooks/useLazyImage'
import './Card.css'

const HOVER_DELAY_MS = 450

interface CardProps {
  media: MediaSummary
}

function Card({ media }: CardProps) {
  const navigate = useNavigate()
  const [isHovering, setIsHovering] = useState(false)
  const [isPosterLoaded, setIsPosterLoaded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: videos } = useVideos(media.mediaType, media.id, isHovering)
  const trailer = videos ? getBestTrailer(videos) : null
  const { ref: posterRef, src: posterSrc, dataSrc: posterDataSrc } = useLazyImage(imageUrl(media.posterPath, 'w300'))

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => setIsHovering(true), HOVER_DELAY_MS)
  }

  function handleMouseLeave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsHovering(false)
  }

  function handleClick() {
    navigate(`/${media.mediaType}/${media.id}`)
  }

  const year = media.releaseDate ? media.releaseDate.slice(0, 4) : ''

  return (
    <div
      className={`card ${isHovering ? 'card--expanded' : ''}`}
      data-testid="card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="card__media">
        {isHovering && trailer ? (
          <iframe
            className="card__trailer"
            src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&modestbranding=1`}
            title={`${media.title} trailer`}
            allow="autoplay; encrypted-media"
            frameBorder={0}
          />
        ) : (
          <>
            {!isPosterLoaded && <div className="skeleton card__poster-loader" data-testid="poster-loader" />}
            <img
              ref={posterRef}
              className="card__poster"
              src={posterSrc}
              data-src={posterDataSrc}
              alt={media.title}
              onLoad={() => setIsPosterLoaded(true)}
            />
          </>
        )}
      </div>

      {isHovering && (
        <div className="card__overlay" data-testid="card-overlay">
          <p className="card__title">{media.title}</p>
          <div className="card__meta">
            <span className="card__rating">★ {media.voteAverage.toFixed(1)}</span>
            {year && <span>{year}</span>}
          </div>
          <p className="card__overview">{media.overview}</p>
        </div>
      )}
    </div>
  )
}

export default Card
