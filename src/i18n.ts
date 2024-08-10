import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

const namespace = ['main', 'api', 'about', 'model', 'import'];
if (googleClientId) namespace.push('drive');

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: {
      default: ['en'],
    },
    ns: namespace,
    defaultNS: 'main',
  });

export default i18n;
