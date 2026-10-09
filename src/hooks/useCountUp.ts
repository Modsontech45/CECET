import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

/**
 * Counts a number from 0 to `target` using anime.js when the returned ref
 * element scrolls into view. Fires once per mount.
 */
export function useCountUp(target: number, duration = 1400, delay = 0) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLElement | null>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || started.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        const proxy = { val: 0 }
        animate(proxy, {
          val: target,
          duration,
          delay,
          ease: 'outExpo',
          onUpdate() {
            setCount(Math.round(proxy.val))
          },
          onComplete() {
            setCount(target)
          },
        })
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, delay])

  return { count, ref }
}
