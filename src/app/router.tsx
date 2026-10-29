import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { MemberLayout } from '@/components/layout/MemberLayout'

// ── Public site pages ─────────────────────────────────────────────────────────
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
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage'))

// ── Member area pages ─────────────────────────────────────────────────────────
const MemberHomePage   = lazy(() => import('@/pages/member/HomePage'))
const ActivityPage     = lazy(() => import('@/pages/member/ActivityPage'))
const ProfilePage      = lazy(() => import('@/pages/member/ProfilePage'))
const MembershipPage   = lazy(() => import('@/pages/member/MembershipPage'))
const KycPage          = lazy(() => import('@/pages/member/KycPage'))
const PacksCatalogPage = lazy(() => import('@/pages/member/PacksCatalogPage'))
const PayMerchantPage  = lazy(() => import('@/pages/member/PayMerchantPage'))
const SellYemPage      = lazy(() => import('@/pages/member/SellYemPage'))
const MerchantPage     = lazy(() => import('@/pages/member/MerchantPage'))

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
    </div>
  )
}

function MerchantQrRedirect() {
  const { code } = useParams()
  return <Navigate to={`/espace/payer?code=${encodeURIComponent(code ?? '')}`} replace />
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
      { index: true,                 element: <S><HomePage /></S> },
      { path: 'services',            element: <S><ServicesPage /></S> },
      { path: 'services/:slug',      element: <S><ServicesPage /></S> },
      { path: 'le-yem',              element: <S><YemPage /></S> },
      { path: 'packs',               element: <S><PacksPage /></S> },
      { path: 'a-propos',            element: <S><AboutPage /></S> },
      { path: 'partenaires',         element: <S><PartnersPage /></S> },
      { path: 'actualites',          element: <S><NewsPage /></S> },
      { path: 'faq',                 element: <S><FaqPage /></S> },
      { path: 'contact',             element: <S><ContactPage /></S> },
      { path: 'connexion',           element: <S><LoginPage /></S> },
      { path: 'inscription',         element: <S><RegisterPage /></S> },
      { path: 'mot-de-passe-oublie', element: <S><ForgotPasswordPage /></S> },
      { path: 'documents',           element: <S><DocumentsPage /></S> },
      { path: 'mentions-legales',    element: <S><LegalPage /></S> },
      { path: 'confidentialite',     element: <S><LegalPage /></S> },
      { path: 'conditions',          element: <S><LegalPage /></S> },
      { path: 'espace-membre',       element: <Navigate to="/espace" replace /> },
      { path: '*',                   element: <S><NotFoundPage /></S> },
    ],
  },

  { path: '/pay/m/:code', element: <MerchantQrRedirect /> },

  // ── Member area (MemberLayout — sidebar, no public Navbar / Footer) ────────
  {
    path: '/espace',
    element: <MemberLayout />,
    children: [
      { index: true,          element: <S><MemberHomePage /></S> },
      { path: 'activite',     element: <S><ActivityPage /></S> },
      { path: 'profil',       element: <S><ProfilePage /></S> },
      { path: 'adhesion',     element: <S><MembershipPage /></S> },
      { path: 'kyc',          element: <S><KycPage /></S> },
      { path: 'packs',        element: <S><PacksCatalogPage /></S> },
      { path: 'payer',        element: <S><PayMerchantPage /></S> },
      { path: 'vendre',       element: <S><SellYemPage /></S> },
      { path: 'marchand',     element: <S><MerchantPage /></S> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
