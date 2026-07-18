import { describe, test, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import CardSkeleton from './CardSkeleton'

describe('CardSkeleton', () => {
  afterEach(() => {
    cleanup()
  })

  test('renders card--skeleton container with skeleton media block', () => {
    const { container } = render(<CardSkeleton />)

    const card = container.querySelector('.card--skeleton')
    expect(card).toBeInTheDocument()
    expect(card?.querySelector('.card__media.skeleton')).toBeInTheDocument()
  })
})
