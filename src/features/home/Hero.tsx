import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Coins } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ease, staggerContainer, fadeUp, fadeIn } from '@/lib/motion'

// Three depth slots — front / middle / back
// scale simulates depth; no z needed (avoids preserve-3d compositing issues)
const SLOTS = [
  { x: 0,   y: 0,   scale: 1.06, brightness: 1,    zIndex: 10 },
  { x: 55,  y: 50,  scale: 0.95, brightness: 0.80, zIndex: 5  },
  { x: 110, y: 100, scale: 0.84, brightness: 0.60, zIndex: 1  },
]

const CARD_TRANSITION = {
  type: 'tween' as const,
  duration: 0.85,
  ease: [0.4, 0, 0.2, 1],
}

// Cards ordered front → back at rest
const CARDS = [
  {
    label: 'Pack Vendeur',
    formulas: 'V1 – V12',
    sub: 'Quota de vente de YEM',
    gradient: 'linear-gradient(140deg, #09855B 0%, #065940 100%)',
    mountDelay: 0,
  },
  {
    label: 'Pack Consommateur',
    formulas: 'C1 – C8',
    sub: 'Remise 2–5 % chez les marchands',
    gradient: 'linear-gradient(140deg, #065940 0%, #033a24 100%)',
    mountDelay: 0.1,
  },
  {
    label: 'Pack Personnel',
    formulas: 'Flexible',
    sub: 'Sans quota ni durée fixe',
    gradient: 'linear-gradient(140deg, #033a24 0%, #011a0e 100%)',
    mountDelay: 0.2,
  },
]

const STATS = [
  { value: '100+', label: 'Membres' },
  { value: '6',    label: 'Packs'   },
  { value: '100%', label: 'Solidaire'},
]

export function Hero() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  // Separate display zIndex — cards going backward keep their high zIndex
  // until the animation completes, so they never disappear mid-flight
  const [displayZ, setDisplayZ] = useState(() =>
    CARDS.map((_, i) => SLOTS[(i + 3) % 3].zIndex)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const targets = CARDS.map((_, i) => SLOTS[(i - activeIndex + 3) % 3].zIndex)
    // Cards going forward: raise zIndex immediately
    setDisplayZ(prev => targets.map((t, i) => Math.max(t, prev[i])))
    // After animation finishes: lower zIndex for cards that went back
    const id = setTimeout(() => setDisplayZ(targets), 950)
    return () => clearTimeout(id)
  }, [activeIndex])

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden -mt-[68px] sm:-mt-[76px]"
      style={{ background: '#030f08' }}
      aria-label="Bannière principale"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 72% 48%, rgba(9,133,91,0.28) 0%, transparent 72%)',
        }}
        aria-hidden
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.035,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />

      {/* Drifting blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-[#09855B]/8 blur-3xl"
          animate={{ x: [0, 30, 0, -30, 0], y: [0, 20, -20, 0, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-60 h-60 rounded-full bg-[#EFB303]/5 blur-3xl"
          animate={{ x: [0, -20, 0, 20, 0], y: [0, -15, 15, 0, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear', delay: 4 }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex items-center w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-0 pt-[88px] sm:pt-[96px] pb-20 lg:pt-[68px] lg:pb-0">

          {/* ── Left: text ── */}
          <motion.div
            className="flex-1 text-center lg:text-left text-white max-w-xl mx-auto lg:mx-0"
            variants={staggerContainer(0.13, 0.08)}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55, ease: ease.out }}
              className="flex justify-center lg:justify-start mb-7"
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/6 backdrop-blur-sm text-xs font-medium text-white/80">
                <Coins size={12} aria-hidden />
                CECT Togo — Coopérative d'Entraide Communautaire
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.65, ease: ease.out }}
              className="text-4xl sm:text-5xl xl:text-[3.75rem] font-extrabold leading-[1.07] mb-6 text-balance"
            >
              {t('hero.tagline')}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55, ease: ease.out }}
              className="text-base sm:text-lg text-white/60 mb-10 leading-relaxed text-balance max-w-md mx-auto lg:mx-0"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.45, ease: ease.out }}
              className="flex flex-row gap-2 sm:gap-3 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                asChild
                className="font-bold h-11 sm:h-13 px-4 sm:px-8 text-xs sm:text-base"
                style={{ background: '#EFB303', color: '#030f08' }}
              >
                <Link to="/inscription">
                  {t('hero.cta_join')}
                  <ArrowRight size={16} aria-hidden className="hidden sm:block" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/20 text-white hover:bg-white/8 hover:border-white/35 font-semibold h-11 sm:h-13 px-4 sm:px-8 text-xs sm:text-base"
              >
                <Link to="/le-yem">
                  <Coins size={16} aria-hidden className="hidden sm:block" />
                  {t('hero.cta_yem')}
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1, ease: ease.out }}
              className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-8 justify-center lg:justify-start"
            >
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-extrabold leading-none mb-1" style={{ color: '#EFB303' }}>
                    {value}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: cycling 3-D card stack ── */}
          <motion.div
            className="flex-shrink-0 flex items-center justify-center lg:flex-1 lg:justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.25 }}
          >
            {/* Scale wrapper — smaller on mobile */}
            <div className="scale-[0.58] xs:scale-[0.65] sm:scale-[0.78] lg:scale-100 origin-center">
              {/* Perspective wrapper */}
              <div style={{ perspective: '1100px', perspectiveOrigin: '50% 50%' }}>
                {/* Scene rotation */}
                <motion.div
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: [-22, -17, -22], rotateX: [11, 8, 11] }}
                  initial={{ rotateY: -22, rotateX: 11 }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Floating bob */}
                  <motion.div
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ y: [0, -14, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Card container */}
                    <div
                      className="relative"
                      style={{ width: 358, height: 254, transformStyle: 'preserve-3d' }}
                    >
                      {/* Glow */}
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          width: 240, height: 160, top: -16, left: -16,
                          background: 'radial-gradient(ellipse, rgba(9,133,91,0.6) 0%, transparent 70%)',
                          filter: 'blur(28px)',
                          transform: 'translateZ(-10px)',
                        }}
                        aria-hidden
                      />

                      {CARDS.map((card, cardIndex) => {
                        const slotIndex = (cardIndex - activeIndex + 3) % 3
                        const slot = SLOTS[slotIndex]

                        return (
                          <motion.div
                            key={card.label}
                            className="absolute rounded-2xl overflow-hidden flex flex-col justify-between p-5"
                            style={{
                              top: 0, left: 0,
                              width: 254, height: 158,
                              zIndex: displayZ[cardIndex],
                              background: card.gradient,
                              boxShadow: '0 32px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)',
                            }}
                            initial={{ opacity: 0, x: slot.x, y: slot.y + 24, scale: slot.scale }}
                            animate={{
                              opacity: 1,
                              x: slot.x,
                              y: slot.y,
                              scale: slot.scale,
                              filter: `brightness(${slot.brightness})`,
                            }}
                            transition={{
                              opacity: { duration: 0.6, delay: 0.45 + card.mountDelay },
                              x: CARD_TRANSITION,
                              y: CARD_TRANSITION,
                              scale: CARD_TRANSITION,
                              filter: CARD_TRANSITION,
                            }}
                          >
                            {/* Card top row */}
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-white/35 text-[8px] uppercase tracking-[0.18em] font-semibold">
                                  CECT Togo
                                </p>
                                <p className="text-white text-xs font-bold mt-0.5">{card.label}</p>
                              </div>
                              <div
                                className="w-8 h-6 rounded flex items-center justify-center"
                                style={{
                                  background: 'rgba(239,179,3,0.18)',
                                  border: '1px solid rgba(239,179,3,0.35)',
                                }}
                              >
                                <div
                                  className="w-3.5 h-3.5 rounded-full"
                                  style={{ border: '1.5px solid rgba(239,179,3,0.7)' }}
                                />
                              </div>
                            </div>

                            {/* Formulas */}
                            <div>
                              <p className="text-white text-xl font-bold font-mono tracking-wide leading-none mb-1">
                                {card.formulas}
                              </p>
                              <p className="text-white/35 text-[9px] uppercase tracking-wider">{card.sub}</p>
                            </div>

                            {/* Glass shine */}
                            <div
                              className="absolute inset-0 pointer-events-none rounded-2xl"
                              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.11) 0%, transparent 48%)' }}
                              aria-hidden
                            />
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Wave divider */}
      <div className="relative z-0" aria-hidden>
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L120 52C240 44 480 28 720 24C960 20 1200 28 1320 32L1440 36V60H1320C1200 60 960 60 720 60C480 60 240 60 120 60H0Z"
            fill="var(--color-bg)"
          />
        </svg>
      </div>
    </section>
  )
}
