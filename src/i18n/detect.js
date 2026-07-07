import { SUPPORTED_LANGUAGES, FALLBACK_LANGUAGE, STORAGE_KEY } from "./config.js";

// ─── WYKRYWANIE JĘZYKA ────────────────────────────────────────────────────────
// Priorytet:
//   1. ręczny wybór zapisany lokalnie (localStorage) — zawsze wygrywa
//   2. język urządzenia (navigator.languages / navigator.language)
//   3. fallback do FALLBACK_LANGUAGE
// Całość w try/catch — brak dostępu do localStorage/navigator nie wywraca aplikacji.
// WAŻNE: polski nigdy nie jest nadpisywany przez angielski jako "domyślny" —
// gdy urządzenie zgłasza pl, zwracamy pl (pierwszy obsługiwany trafiony wygrywa).

export function readSavedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;
  } catch {
    /* localStorage niedostępny — ignorujemy */
  }
  return null;
}

export function detectDeviceLanguage() {
  try {
    const list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language];
    for (const raw of list) {
      if (!raw) continue;
      const base = String(raw).toLowerCase().split("-")[0]; // "en-US" -> "en"
      if (SUPPORTED_LANGUAGES.includes(base)) return base;
    }
  } catch {
    /* navigator niedostępny — ignorujemy */
  }
  return null;
}

export function detectLanguage() {
  return readSavedLanguage() || detectDeviceLanguage() || FALLBACK_LANGUAGE;
}

export function persistLanguage(lang) {
  try {
    if (SUPPORTED_LANGUAGES.includes(lang)) localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* localStorage niedostępny — wybór nie zostanie zapamiętany, ale aplikacja działa */
  }
}
