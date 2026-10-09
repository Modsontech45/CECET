import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <>
      <Helmet><title>404 — CECT Togo</title></Helmet>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary)]/10 mb-6">
          <Search size={36} className="text-[var(--color-primary)]" aria-hidden />
        </div>
        <h1 className="text-6xl font-extrabold text-[var(--color-primary)] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">{t('notFound.title')}</h2>
        <p className="text-[var(--color-text-muted)] mb-8 max-w-sm">{t('notFound.subtitle')}</p>
        <Button size="lg" asChild>
          <Link to="/">
            <Home size={18} aria-hidden />
            {t('notFound.back')}
          </Link>
        </Button>
      </div>
    </>
  )
}
