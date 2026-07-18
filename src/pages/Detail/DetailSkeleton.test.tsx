import { describe, test, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import DetailSkeleton from './DetailSkeleton'

describe('DetailSkeleton', () => {
  afterEach(() => {
    cleanup()
  })

  test('renders skeleton hero, meta lines, and 3 trailer-tab skeleton placeholders', () => {
    const { container } = render(<DetailSkeleton />)

    expect(container.querySelector('.detail__hero--skeleton')).toBeInTheDocument()
    expect(container.querySelector('.detail__poster.skeleton')).toBeInTheDocument()
    expect(container.querySelectorAll('.detail__trailer-tab-skeleton')).toHaveLength(3)
    expect(container.querySelector('.detail__trailer-active-skeleton')).toBeInTheDocument()
  })
})
