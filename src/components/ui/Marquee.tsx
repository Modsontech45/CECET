import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { Coins } from 'lucide-react'

const ITEMS = [
  'CECT Togo',
  'Épargne Consommation',
  'YEM · 650 FCFA',
  'Solidarité',
  'Entraide',
  'Coopérative',
  'Togo',
  'Pack Vendeur',
  'Pack Marchand',
  'Partage',
]

export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    animate(el, {
      translateX: ['0%', '-50%'],
      duration: 22000,
      ease: 'linear',
      loop: true,
    })
  }, [])

  // duplicate so the seam is invisible
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div
      className="overflow-hidden py-3 border-y select-none"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      aria-hidden
    >
      <div ref={trackRef} className="flex items-center gap-10 whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Coins size={10} className="shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
