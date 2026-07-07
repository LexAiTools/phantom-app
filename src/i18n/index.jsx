import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES } from "./config.js";
import { detectLanguage, persistLanguage } from "./detect.js";
import pl from "../locales/pl.json";
import en from "../locales/en.json";

// Rejestr słowników — dodając język, dopisz tu jego import
const DICTS = { pl, en };

// ─── RESOLVER KLUCZY ──────────────────────────────────────────────────────────
// Klucz w formie kropkowej: "addContact.title" / "e2e.grid.protocol"
function resolve(dict, key) {
  return key.split(".").reduce((o, k) => (o != null && o[k] != null ? o[k] : undefined), dict);
}

// Podstawianie zmiennych: "krok {{step}} z 3" + {step:2} -> "krok 2 z 3"
function interpolate(value, vars) {
  if (typeof value !== "string" || !vars) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}

// Tworzy funkcję t() dla danego języka.
// Fallback dla brakujących kluczy: język bieżący -> FALLBACK_LANGUAGE -> sam klucz.
export function makeT(lang) {
  const primary  = DICTS[lang] || DICTS[FALLBACK_LANGUAGE];
  const fallback = DICTS[FALLBACK_LANGUAGE];
  return function t(key, vars) {
    let val = resolve(primary, key);
    if (val === undefined) val = resolve(fallback, key);
    if (val === undefined) return key;           // brak klucza — pokaż klucz zamiast wywalić UI
    if (Array.isArray(val)) return val.map((v) => interpolate(v, vars));
    return interpolate(val, vars);
  };
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => detectLanguage());

  const setLang = useCallback((next) => {
    if (!SUPPORTED_LANGUAGES.includes(next)) return;
    persistLanguage(next);
    setLangState(next);
  }, []);

  // Synchronizacja atrybutu <html lang="..."> z aktywnym językiem
  useEffect(() => {
    try { document.documentElement.lang = lang; } catch { /* SSR/brak DOM */ }
  }, [lang]);

  const t = useCallback(makeT(lang), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n musi być użyte wewnątrz <I18nProvider>");
  return ctx;
}
