import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en.json'
import zh from '@/locales/zh.json'

i18n.use(initReactI18next).init({
  debug: true,
  resources: {
    en: {
      translation: en
    },
    zh: {
      translation: zh
    }
  },
  fallbackLng: 'en',
  lng: navigator.language.startsWith('zh') ? 'zh' : 'en',
  interpolation: {
    escapeValue: false // react already safes from xss
  }
})

export default i18n
