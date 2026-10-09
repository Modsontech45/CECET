import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Moon, Sun, Menu, X, Languages } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navLinks = (t: (k: string) => string) => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.services'), to: '/services' },
  { label: t('nav.yem'), to: '/le-yem' },
  { label: t('nav.packs'), to: '/packs' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('nav.partners'), to: '/partenaires' },
  { label: t('nav.faq'), to: '/faq' },
  { label: t('nav.contact'), to: '/contact' },
]

export function Navbar() {
  const { t } = useTranslation()
  const { theme, toggle: toggleTheme } = useTheme()
  const { language, toggle: toggleLanguage } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = navLinks(t)

  return (
    <>
      {/* ─── Fixed header wrapper ─────────────────────────────── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'px-3 py-2 sm:px-4' : 'px-3 py-3 sm:px-5 md:px-8'
        )}
      >
        <nav
          className={cn(
            'glass rounded-2xl mx-auto max-w-7xl transition-all duration-300',
            scrolled && 'shadow-lg'
          )}
          aria-label="Navigation principale"
        >
          <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">

            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-[var(--color-primary)] shrink-0"
              aria-label="CECT Togo — Accueil"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden dark:bg-white dark:p-0.5">
                <img
                  src="/logos/CECT_logo_transparent.png"
                  alt="CECT Togo logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-base sm:text-lg leading-none">CECT Togo</span>
            </Link>

            {/* ── Desktop nav links (xl+) ── */}
            <ul className="hidden xl:flex items-center gap-0.5" role="list">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                        isActive
                          ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* ── Right controls ── */}
            <div className="flex items-center gap-1 sm:gap-1.5">

              {/* Language toggle — visible md+ */}
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
                title={language === 'fr' ? 'Switch to English' : 'Passer en français'}
                aria-label={language === 'fr' ? 'Switch to English' : 'Passer en français'}
              >
                <Languages size={14} aria-hidden />
                <span className="font-semibold uppercase text-xs tracking-wide">
                  {language === 'fr' ? 'EN' : 'FR'}
                </span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
                aria-label={t('nav.toggleTheme')}
              >
                {theme === 'dark'
                  ? <Sun size={17} aria-hidden />
                  : <Moon size={17} aria-hidden />}
              </button>

              {/* Auth links — desktop only (xl+) */}
              <div className="hidden xl:flex items-center gap-1.5 ml-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/connexion">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/inscription">{t('nav.register')}</Link>
                </Button>
              </div>

              {/* Hamburger — visible below xl */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="xl:hidden flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-primary)]/5 transition-colors ml-0.5"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              >
                {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── Mobile / tablet drawer ───────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              id="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[min(300px,85vw)] glass flex flex-col rounded-l-3xl shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
                <span className="font-bold text-[var(--color-text)]">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center h-8 w-8 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
                  aria-label={t('nav.closeMenu')}
                >
                  <X size={18} aria-hidden />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-3">
                <ul className="flex flex-col gap-0.5" role="list">
                  {links.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        end={link.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                            isActive
                              ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                              : 'text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Auth buttons */}
              <div className="px-4 pb-4 flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/connexion">{t('nav.login')}</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/inscription">{t('nav.register')}</Link>
                </Button>
              </div>

              {/* Language + theme footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Languages size={15} aria-hidden />
                  {language === 'fr' ? 'English' : 'Français'}
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center h-8 w-8 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
                  aria-label={t('nav.toggleTheme')}
                >
                  {theme === 'dark' ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
