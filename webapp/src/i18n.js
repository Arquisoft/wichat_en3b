import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translation_en from './locales/translation_en.json';
import translation_es from './locales/translation_es.json';

//Translations, this will be imported from a json file to make it easier to manage
const resources = {
    en: {translation: translation_en},
    es: {translation: translation_es},
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: 'en', // default language
        fallbackLng: 'en', // fallback language

        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;