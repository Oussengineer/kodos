import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const switchLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("kodos-lang", lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  };

  return (
    <div className="lang-switcher">
      {["en", "fr", "ar"].map((lng) => (
        <button
          key={lng}
          className={`lang-btn${current === lng ? " active" : ""}`}
          onClick={() => switchLang(lng)}
        >
          {lng === "en" ? "🇬🇧" : lng === "fr" ? "🇫🇷" : "🇹🇳"}
        </button>
      ))}
    </div>
  );
}
