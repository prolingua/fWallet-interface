import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import XHR from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import en_common from "./locales/en/common.json";
import de_common from "./locales/de/common.json";

i18next
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    interpolation: { escapeValue: false }, // React already does escaping
    lng: "en", // language to use
    fallbackLng: "en",
    preload: ["en"],
    resources: {
      en: {
        common: en_common,
      },
      de: {
        common: de_common,
      },
    },
    react: {
      useSuspense: true,
    },
  });

export default i18next;
