import { Link, Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="logo">
          CineStream
        </Link>
        <nav className="site-nav">
          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          <a href="#">TV Shows</a>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
