import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const HomePage           = lazy(() => import('@/pages/HomePage'))
const ServicesPage       = lazy(() => import('@/pages/ServicesPage'))
const YemPage            = lazy(() => import('@/pages/YemPage'))
const PacksPage          = lazy(() => import('@/pages/PacksPage'))
const AboutPage          = lazy(() => import('@/pages/AboutPage'))
const PartnersPage       = lazy(() => import('@/pages/PartnersPage'))
const NewsPage           = lazy(() => import('@/pages/NewsPage'))
const FaqPage            = lazy(() => import('@/pages/FaqPage'))
const ContactPage        = lazy(() => import('@/pages/ContactPage'))
const LoginPage          = lazy(() => import('@/pages/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const DocumentsPage      = lazy(() => import('@/pages/DocumentsPage'))
const LegalPage          = lazy(() => import('@/pages/LegalPage'))
const MemberAreaPage     = lazy(() => import('@/pages/MemberAreaPage'))
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage'))

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

const router = createBrowserRouter([
    // ── Public site (Navbar + Footer via Layout) ──────────────────────────────
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true,                element: <S><HomePage /></S> },
        { path: 'services',           element: <S><ServicesPage /></S> },
        { path: 'services/:slug',     element: <S><ServicesPage /></S> },
        { path: 'le-yem',             element: <S><YemPage /></S> },
        { path: 'packs',              element: <S><PacksPage /></S> },
        { path: 'a-propos',           element: <S><AboutPage /></S> },
        { path: 'partenaires',        element: <S><PartnersPage /></S> },
        { path: 'actualites',         element: <S><NewsPage /></S> },
        { path: 'faq',                element: <S><FaqPage /></S> },
        { path: 'contact',            element: <S><ContactPage /></S> },
        { path: 'connexion',          element: <S><LoginPage /></S> },
        { path: 'inscription',        element: <S><RegisterPage /></S> },
        { path: 'mot-de-passe-oublie',element: <S><ForgotPasswordPage /></S> },
        { path: 'documents',          element: <S><DocumentsPage /></S> },
        { path: 'mentions-legales',   element: <S><LegalPage /></S> },
        { path: 'confidentialite',    element: <S><LegalPage /></S> },
        { path: 'conditions',         element: <S><LegalPage /></S> },
        { path: '*',                  element: <S><NotFoundPage /></S> },
      ],
    },

    // ── Member area (standalone — no public Navbar / Footer) ──────────────────
    { path: '/espace',        element: <S><MemberAreaPage /></S> },
    { path: '/espace-membre', element: <S><MemberAreaPage /></S> },
])

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
