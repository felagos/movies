import { useParams } from 'react-router-dom'
import { imageUrl, type MediaType } from '../../api/tmdb'
import { useMediaDetails } from '../../hooks/useMediaDetails'
import DetailSkeleton from './DetailSkeleton'
import TrailerTabs from './TrailerTabs'
import './Detail.css'

function Detail() {
  const { mediaType, id } = useParams<{ mediaType: MediaType; id: string }>()
  const { data: details, isError, isLoading } = useMediaDetails(mediaType, id)

  if (isError) return <p className="error">Could not load details from TMDB.</p>
  if (isLoading || !details) return <DetailSkeleton />

  const trailers = details.videos
    .filter((video) => video.site === 'YouTube')
    .sort((a, b) => {
      const score = (video: typeof a) => (video.type === 'Trailer' ? 2 : 0) + (video.official ? 1 : 0)
      return score(b) - score(a)
    })
    .slice(0, 5)
  const year = details.releaseDate ? details.releaseDate.slice(0, 4) : ''

  return (
    <div className="detail">
      <div
        className="detail__hero"
        style={{ backgroundImage: `url(${imageUrl(details.backdropPath, 'w1280')})` }}
      >
        <div className="detail__hero-overlay">
          <img
            className="detail__poster"
            src={imageUrl(details.posterPath, 'w300')}
            alt={details.title}
          />
          <div className="detail__info">
            <h1>{details.title}</h1>
            <div className="detail__meta">
              <span className="detail__rating">★ {details.voteAverage.toFixed(1)}</span>
              {year && <span>{year}</span>}
              {details.runtime && <span>{details.runtime} min</span>}
              {details.genres.length > 0 && <span>{details.genres.join(', ')}</span>}
            </div>
            <p className="detail__overview">{details.overview}</p>
          </div>
        </div>
      </div>

      {trailers.length > 0 && (
        <section className="detail__trailers">
          <h2>Trailers</h2>
          <TrailerTabs trailers={trailers} />
        </section>
      )}
    </div>
  )
}

export default Detail
