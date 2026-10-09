import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin, Linkedin } from 'lucide-react'
import { SiFacebook, SiInstagram, SiWhatsapp } from 'react-icons/si'

export function Footer() {
  const { t } = useTranslation()
  const whatsappNumber = (import.meta.env['VITE_WHATSAPP_NUMBER'] as string | undefined) ?? '22890144204'

  return (
    <footer
      className="bg-[var(--color-footer-bg)] text-white"
      aria-label="Pied de page"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12 sm:py-16">

        {/* Main grid — 1 col on mobile, 2 on md, 4 on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <span className="text-lg font-bold">CECT Togo</span>
            </div>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">{t('footer.tagline')}</p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook size={18} />
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="WhatsApp"
              >
                <SiWhatsapp size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-white/40 mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {([
                [t('nav.home'), '/'],
                [t('nav.about'), '/a-propos'],
                [t('nav.partners'), '/partenaires'],
                [t('nav.news'), '/actualites'],
                ['Documents', '/documents'],
                [t('nav.faq'), '/faq'],
              ] as [string, string][]).map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-white/40 mb-4">
              {t('footer.services')}
            </h3>
            <ul className="space-y-2.5">
              {([
                [t('services.savings.name'), '/services/epargne-consommation'],
                [t('services.yem.name'), '/le-yem'],
                [t('services.advice.name'), '/services/assistance-conseil'],
                [t('services.investment.name'), '/services/investissement'],
                [t('services.training.name'), '/services/formation'],
                [t('services.solidarity.name'), '/services/entraide'],
              ] as [string, string][]).map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-white/40 mb-4">
              {t('contact.title')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-white/60">
                <Phone size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
                <span className="text-sm leading-relaxed">+228 90 14 42 04<br />+228 90 04 15 17</span>
              </li>
              <li className="flex items-start gap-2.5 text-white/60">
                <Mail size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
                <a
                  href="mailto:cect@proton.me"
                  className="text-sm hover:text-white transition-colors break-all"
                >
                  cect@proton.me
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/60">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
                <span className="text-sm">Lomé, Togo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40 text-center sm:text-left">
            {t('footer.copyright')}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-1.5">
            <Link to="/mentions-legales" className="text-xs text-white/40 hover:text-white/80 transition-colors whitespace-nowrap">
              {t('footer.legal')}
            </Link>
            <Link to="/confidentialite" className="text-xs text-white/40 hover:text-white/80 transition-colors whitespace-nowrap">
              {t('footer.privacy')}
            </Link>
            <Link to="/conditions" className="text-xs text-white/40 hover:text-white/80 transition-colors whitespace-nowrap">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp FAB */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        aria-label={t('contact.whatsapp')}
        style={{ height: '3.25rem', width: '3.25rem' }}
      >
        <SiWhatsapp size={22} />
      </a>
    </footer>
  )
}
