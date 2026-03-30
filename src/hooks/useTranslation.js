// useTranslation — Feature 22 Multi-language hook
// Reads the language from settings store and returns the string map.
import { useSettingsStore } from '../store/settingsStore'
import { TRANSLATIONS, DEFAULT_LANGUAGE } from '../constants/translations'

export const useTranslation = () => {
  const settings = useSettingsStore(s => s.settings)
  const lang = settings?.language || DEFAULT_LANGUAGE
  return TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE]
}

// Static version for use outside components (e.g. in services)
export const getTranslation = (lang = DEFAULT_LANGUAGE) => {
  return TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE]
}
