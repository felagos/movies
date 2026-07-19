import { describe, test, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLazyImage } from './useLazyImage'

describe('useLazyImage', () => {
  test('starts with src="" and data-src holding the URL', () => {
    const { result } = renderHook(() => useLazyImage('https://example.com/image.jpg'))

    expect(result.current.src).toBe('')
    expect(result.current.dataSrc).toBe('https://example.com/image.jpg')
  })

  test('returns a ref for the img element', () => {
    const { result } = renderHook(() => useLazyImage('https://example.com/image.jpg'))

    expect(result.current.ref).toBeDefined()
  })
})
