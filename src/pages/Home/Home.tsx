import { usePopularMovies, usePopularTv } from '../../hooks/usePopular'
import Carousel from '../../components/Carousel/Carousel'
import Hero from '../../components/Hero/Hero'
import './Home.css'

function Home() {
  const movies = usePopularMovies()
  const tvShows = usePopularTv()

  if (movies.isError || tvShows.isError) {
    return <p className="error">Could not load content from TMDB. Check your API key.</p>
  }

  const heroItem = movies.data?.[0]

  return (
    <div className="home">
      {heroItem && <Hero item={heroItem} />}
      <div className="home__sections">
        <Carousel title="Popular Movies" items={movies.data ?? []} isLoading={movies.isLoading} />
        <Carousel title="Popular TV Shows" items={tvShows.data ?? []} isLoading={tvShows.isLoading} />
      </div>
    </div>
  )
}

export default Home
