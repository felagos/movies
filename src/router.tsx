import { createBrowserRouter } from 'react-router-dom'
import App from './App/App.tsx'
import Home from './pages/Home/Home.tsx'
import Detail from './pages/Detail/Detail.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: ':mediaType/:id', element: <Detail /> },
    ],
  },
])
