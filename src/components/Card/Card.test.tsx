import { describe, test, expect, vi, beforeEach, afterEach, afterAll } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import type { MediaSummary, Video } from '../../api/tmdb'
import { useVideos } from '../../hooks/useVideos'
import Card from './Card'

const navigateSpy = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

vi.mock('../../hooks/useVideos', () => ({
  useVideos: vi.fn(),
}))

const mockedUseVideos = vi.mocked(useVideos)

const media: MediaSummary = {
  id: 5,
  mediaType: 'movie',
  title: 'Some Movie',
  overview: 'Some overview text',
  posterPath: '/poster.jpg',
  backdropPath: null,
  voteAverage: 7.891,
  releaseDate: '2021-06-01',
}

const trailer: Video = { id: 'v1', key: 'yt-key', site: 'YouTube', type: 'Trailer', official: true, name: 'Trailer' }

function renderCard(overrides: Partial<MediaSummary> = {}) {
  return render(<Card media={{ ...media, ...overrides }} />)
}

describe('Card', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedUseVideos.mockReturnValue({ data: undefined } as ReturnType<typeof useVideos>)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllTimers()
    navigateSpy.mockClear()
    vi.restoreAllMocks()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('poster (not hovering)', () => {
    test('renders poster img with imageUrl(posterPath, "w300") and alt=title', () => {
      renderCard()

      const img = screen.getByAltText('Some Movie') as HTMLImageElement
      expect(img.src).toBe('https://image.tmdb.org/t/p/w300/poster.jpg')
    })

    test('does not render overlay before hover', () => {
      renderCard()
      expect(screen.queryByTestId('card-overlay')).not.toBeInTheDocument()
    })
  })

  describe('hover-intent delay', () => {
    test('does not expand immediately on mouseEnter, before 450ms elapse', () => {
      renderCard()
      const card = screen.getByTestId('card')

      fireEvent.mouseEnter(card)
      act(() => vi.advanceTimersByTime(400))

      expect(screen.queryByTestId('card-overlay')).not.toBeInTheDocument()
    })

    test('expands after advancing timers by 450ms', () => {
      renderCard()
      const card = screen.getByTestId('card')

      fireEvent.mouseEnter(card)
      act(() => vi.advanceTimersByTime(450))

      expect(screen.getByTestId('card-overlay')).toBeInTheDocument()
    })

    test('mouseLeave before 450ms clears pending timer — never expands', () => {
      renderCard()
      const card = screen.getByTestId('card')

      fireEvent.mouseEnter(card)
      act(() => vi.advanceTimersByTime(200))
      fireEvent.mouseLeave(card)
      act(() => vi.advanceTimersByTime(500))

      expect(screen.queryByTestId('card-overlay')).not.toBeInTheDocument()
    })

    test('mouseLeave after expansion collapses back', () => {
      renderCard()
      const card = screen.getByTestId('card')

      fireEvent.mouseEnter(card)
      act(() => vi.advanceTimersByTime(450))
      expect(screen.getByTestId('card-overlay')).toBeInTheDocument()

      fireEvent.mouseLeave(card)

      expect(screen.queryByTestId('card-overlay')).not.toBeInTheDocument()
    })
  })

  describe('trailer rendering while hovering', () => {
    test('renders iframe with trailer embed URL when hovering and a trailer resolves', () => {
      mockedUseVideos.mockReturnValue({ data: [trailer] } as ReturnType<typeof useVideos>)
      renderCard()
      const card = screen.getByTestId('card')

      fireEvent.mouseEnter(card)
      act(() => vi.advanceTimersByTime(450))

      const iframe = screen.getByTitle('Some Movie trailer') as HTMLIFrameElement
      expect(iframe).toBeInTheDocument()
      expect(iframe.src).toContain('yt-key')
    })

    test('renders poster img (not iframe) when hovering but no trailer found', () => {
      mockedUseVideos.mockReturnValue({ data: [] } as unknown as ReturnType<typeof useVideos>)
      renderCard()
      const card = screen.getByTestId('card')

      fireEvent.mouseEnter(card)
      act(() => vi.advanceTimersByTime(450))

      expect(screen.queryByTitle('Some Movie trailer')).not.toBeInTheDocument()
      expect(screen.getByAltText('Some Movie')).toBeInTheDocument()
    })
  })

  describe('overlay content', () => {
    test('shows title, rating, overview, and year when hovering', () => {
      renderCard()
      const card = screen.getByTestId('card')

      fireEvent.mouseEnter(card)
      act(() => vi.advanceTimersByTime(450))

      expect(screen.getByTestId('card-overlay')).toBeInTheDocument()
      expect(screen.getByText('★ 7.9')).toBeInTheDocument()
      expect(screen.getByText('Some overview text')).toBeInTheDocument()
      expect(screen.getByText('2021')).toBeInTheDocument()
    })

    test('omits year span when releaseDate is empty', () => {
      renderCard({ releaseDate: '' })
      const card = screen.getByTestId('card')

      fireEvent.mouseEnter(card)
      act(() => vi.advanceTimersByTime(450))

      expect(screen.queryByText('2021')).not.toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    test('clicking the card calls navigate with `/${mediaType}/${id}`', () => {
      renderCard()
      const card = screen.getByTestId('card')

      fireEvent.click(card)

      expect(navigateSpy).toHaveBeenCalledWith('/movie/5')
    })
  })
})
