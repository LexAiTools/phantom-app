// ─── KONFIGURACJA I18N ────────────────────────────────────────────────────────
// Dodanie kolejnego języka wymaga wyłącznie:
//   1. dodania pliku src/locales/<kod>.json
//   2. dopisania kodu do SUPPORTED_LANGUAGES + LANGUAGE_NAMES
//   3. zarejestrowania słownika w src/i18n/index.jsx (mapa DICTS)

export const SUPPORTED_LANGUAGES = ["pl", "en"];
export const FALLBACK_LANGUAGE   = "en";  // gdy język urządzenia nieobsługiwany
export const SOURCE_LANGUAGE     = "pl";  // język źródłowy (oryginalny tekst)

// Nazwy wyświetlane w przełączniku (w języku własnym)
export const LANGUAGE_NAMES = {
  pl: "Polski",
  en: "English",
};

// Klucz zapisu ręcznego wyboru użytkownika
export const STORAGE_KEY = "phantom.lang";
