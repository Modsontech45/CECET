import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    function update() {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? scrolled / total : 0
      if (bar) bar.style.transform = `scaleX(${pct})`
    }

    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      ref={barRef}
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] origin-left"
      style={{ background: 'var(--color-primary)', transform: 'scaleX(0)' }}
    />
  )
}
