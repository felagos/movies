import { useNavigate } from 'react-router-dom'
import { imageUrl, type MediaSummary } from '../../api/tmdb'
import './Hero.css'

interface HeroProps {
  item: MediaSummary
}

function Hero({ item }: HeroProps) {
  const navigate = useNavigate()
  const year = item.releaseDate ? item.releaseDate.slice(0, 4) : ''

  return (
    <section
      className="hero"
      data-testid="hero"
      style={{ backgroundImage: `url(${imageUrl(item.backdropPath, 'w1280')})` }}
    >
      <div className="hero__scrim" />
      <div className="hero__content">
        <h1 className="hero__title">{item.title}</h1>
        <div className="hero__meta">
          <span className="hero__rating">{item.voteAverage.toFixed(1)} ★</span>
          {year && <span>{year}</span>}
        </div>
        <p className="hero__overview">{item.overview}</p>
        <button
          type="button"
          className="hero__cta"
          onClick={() => navigate(`/${item.mediaType}/${item.id}`)}
        >
          More Info
        </button>
      </div>
    </section>
  )
}

export default Hero
