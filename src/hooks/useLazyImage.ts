import { useEffect, useRef, useState } from 'react'

export function useLazyImage(url: string) {
  const ref = useRef<HTMLImageElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [url])

  return { ref, src: isVisible ? url : '', dataSrc: isVisible ? '' : url }
}
