import { useTranslation } from 'react-i18next'

export function useLanguage() {
  const { i18n } = useTranslation()

  const language = i18n.language.startsWith('en') ? 'en' : 'fr'

  const toggle = () => {
    i18n.changeLanguage(language === 'fr' ? 'en' : 'fr')
  }

  const setLanguage = (lang: 'fr' | 'en') => {
    i18n.changeLanguage(lang)
  }

  return { language, toggle, setLanguage }
}
