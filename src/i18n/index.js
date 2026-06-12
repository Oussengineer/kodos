import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";

const saved = localStorage.getItem("kodos-lang");
const browserLang = navigator.language?.split("-")[0];
const detected = saved || (browserLang === "fr" || browserLang === "ar" ? browserLang : "en");

document.documentElement.dir = detected === "ar" ? "rtl" : "ltr";
document.documentElement.lang = detected;

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar } },
  lng: detected,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
