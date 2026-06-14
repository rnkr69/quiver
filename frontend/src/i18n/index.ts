import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import es from './locales/es.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

const DEFAULT_LOCALE = (import.meta.env.VITE_DEFAULT_LOCALE as string | undefined) || 'en'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ['en', 'es'],
    nonExplicitSupportedLngs: true, // 'es-ES' resolves to 'es'
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'quiver_lang',
      caches: ['localStorage'],
    },
  })

// Keep <html lang> in sync for accessibility / SEO.
const applyHtmlLang = (lng: string) => {
  document.documentElement.lang = lng.split('-')[0]
}
i18n.on('languageChanged', applyHtmlLang)
applyHtmlLang(i18n.resolvedLanguage || DEFAULT_LOCALE)

export default i18n
