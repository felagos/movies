import { useState } from 'react'
import type { Video } from '../../api/tmdb'

interface TrailerTabsProps {
  trailers: Video[]
}

function TrailerTabs({ trailers }: TrailerTabsProps) {
  const [activeKey, setActiveKey] = useState(trailers[0]?.key)
  const [isLoaded, setIsLoaded] = useState(false)
  const activeTrailer = trailers.find((video) => video.key === activeKey) ?? trailers[0]

  function selectTrailer(key: string) {
    if (key === activeKey) return
    setIsLoaded(false)
    setActiveKey(key)
  }

  if (!activeTrailer) return null

  return (
    <div>
      <div className="detail__trailer-tabs">
        {trailers.map((video) => (
          <button
            key={video.id}
            type="button"
            className={`detail__trailer-tab ${video.key === activeTrailer.key ? 'detail__trailer-tab--active' : ''}`}
            onClick={() => selectTrailer(video.key)}
          >
            ▶ {video.name}
          </button>
        ))}
      </div>

      <div className="detail__trailer-active">
        {!isLoaded && <div className="skeleton detail__trailer-loader" />}
        <iframe
          key={activeTrailer.key}
          src={`https://www.youtube-nocookie.com/embed/${activeTrailer.key}`}
          title={activeTrailer.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder={0}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  )
}

export default TrailerTabs
