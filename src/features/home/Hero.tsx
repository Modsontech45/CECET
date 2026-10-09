import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Coins } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ease, staggerContainer, fadeUp, fadeIn } from '@/lib/motion'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
      aria-label="Bannière principale"
    >
      <div
        className="absolute inset-0"
        style={{ background: 'var(--color-hero-bg)' }}
        aria-hidden
      />

      {/* Decorative blobs — slow drift */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          className="absolute -top-32 -right-32 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-white/5 blur-3xl"
          animate={{ x: [0, 24, 0, -24, 0], y: [0, 16, -16, 0, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-white/5 blur-3xl"
          animate={{ x: [0, -18, 0, 18, 0], y: [0, -12, 12, 0, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear', delay: 3 }}
        />
      </div>

      {/* Content — split layout: text left, logo right */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

          {/* ── Left: text ── */}
          <motion.div
            className="flex-1 text-center lg:text-left text-white max-w-xl mx-auto lg:mx-0"
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55, ease: ease.out }}
              className="flex justify-center lg:justify-start mb-6"
            >
              <span className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs sm:text-sm font-medium max-w-[90vw] text-center leading-snug">
                <Coins size={13} aria-hidden className="shrink-0" />
                <span>CECT Togo — Coopérative d'Entraide Communautaire</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.65, ease: ease.out }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold mb-5 leading-tight text-balance"
            >
              {t('hero.tagline')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55, ease: ease.out }}
              className="text-base sm:text-lg text-white/80 max-w-lg mx-auto lg:mx-0 mb-10 text-balance leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.45, ease: ease.out }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center"
            >
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-white text-[var(--color-primary)] hover:bg-white/90 font-bold text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14"
              >
                <Link to="/inscription">
                  {t('hero.cta_join')}
                  <ArrowRight size={18} aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[var(--color-primary)] font-semibold text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14"
              >
                <Link to="/le-yem">
                  <Coins size={18} aria-hidden />
                  {t('hero.cta_yem')}
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* ── Right: 3D floating logo ── */}
          <motion.div
            className="flex-shrink-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.35 }}
          >
            {/* Outer glow ring */}
            <div className="relative">
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-white/10 blur-xl"
                animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Second ring */}
              <motion.div
                className="absolute -inset-3 rounded-[2rem] border border-white/15"
                animate={{ scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />

              {/* Floating logo with 3D tilt */}
              <motion.div
                className="relative"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  animate={{ rotateY: [0, 6, 0, -6, 0], rotateX: [0, 3, 0, -3, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
                >
                  <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-black/40 overflow-hidden">
                    <img
                      src="/logos/CECT_logo_512.png"
                      alt="CECT — Coopérative d'Entraide Communautaire du Togo"
                      className="w-full h-full object-contain p-2"
                      draggable={false}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden>
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
