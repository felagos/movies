import { describe, test, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import type { Video } from '../../api/tmdb'
import TrailerTabs from './TrailerTabs'

const trailers: Video[] = [
  { id: '1', key: 'key-1', site: 'YouTube', type: 'Trailer', official: true, name: 'Trailer 1' },
  { id: '2', key: 'key-2', site: 'YouTube', type: 'Trailer', official: true, name: 'Trailer 2' },
]

describe('TrailerTabs', () => {
  afterEach(() => {
    cleanup()
  })

  test('renders nothing when trailers array is empty', () => {
    const { container } = render(<TrailerTabs trailers={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  test('defaults active tab to trailers[0] — first iframe src rendered', () => {
    const { container } = render(<TrailerTabs trailers={trailers} />)
    const iframe = container.querySelector('iframe') as HTMLIFrameElement
    expect(iframe.src).toContain('key-1')
    expect(screen.getByText('▶ Trailer 1')).toHaveClass('detail__trailer-tab--active')
  })

  test('shows skeleton loader before iframe onLoad fires', () => {
    const { container } = render(<TrailerTabs trailers={trailers} />)
    expect(container.querySelector('.detail__trailer-loader')).toBeInTheDocument()
  })

  test('firing iframe onLoad hides the skeleton loader', () => {
    const { container } = render(<TrailerTabs trailers={trailers} />)
    fireEvent.load(container.querySelector('iframe')!)
    expect(container.querySelector('.detail__trailer-loader')).not.toBeInTheDocument()
  })

  test('clicking a different tab switches active iframe src', () => {
    const { container } = render(<TrailerTabs trailers={trailers} />)
    fireEvent.click(screen.getByText('▶ Trailer 2'))

    const iframe = container.querySelector('iframe') as HTMLIFrameElement
    expect(iframe.src).toContain('key-2')
  })

  test('clicking a different tab resets isLoaded (loader reappears)', () => {
    const { container } = render(<TrailerTabs trailers={trailers} />)
    fireEvent.load(container.querySelector('iframe')!)
    expect(container.querySelector('.detail__trailer-loader')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('▶ Trailer 2'))

    expect(container.querySelector('.detail__trailer-loader')).toBeInTheDocument()
  })

  test('clicking the already-active tab is a no-op', () => {
    const { container } = render(<TrailerTabs trailers={trailers} />)
    fireEvent.load(container.querySelector('iframe')!)
    expect(container.querySelector('.detail__trailer-loader')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('▶ Trailer 1'))

    expect(container.querySelector('.detail__trailer-loader')).not.toBeInTheDocument()
  })
})
