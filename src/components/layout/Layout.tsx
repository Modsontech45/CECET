import { useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { pageVariants } from '@/lib/motion'

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <ScrollProgress />
      <Navbar />
      {/* pt accounts for fixed navbar height (~64px mobile, ~72px desktop) */}
      <main className="flex-1 pt-[68px] sm:pt-[76px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
