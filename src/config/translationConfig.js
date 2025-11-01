import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import traslationAR from "../Translations/ar.json";
import traslationEN from "../Translations/en.json";

const resources = {
  ar: {
    translation: traslationAR,
  },
  en: {
    translation: traslationEN,
  },
};

const getLanguagePreference = () => {
  return localStorage.getItem("selectedLanguage") || "en"; 
};

const saveLanguagePreference = (lng) => {
  localStorage.setItem("selectedLanguage", lng);
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguagePreference(), 
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });


i18n.on("languageChanged", (lng) => {
  saveLanguagePreference(lng);
});


export default i18n;
