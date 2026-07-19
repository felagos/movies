import { NavLink, Outlet } from 'react-router-dom'
import './App.css'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'active' : ''
}

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <nav className="site-nav">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/movies" className={navLinkClass}>
            Movies
          </NavLink>
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
