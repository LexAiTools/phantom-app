import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { detectLanguage, readSavedLanguage, persistLanguage } from "./detect.js";
import { makeT } from "./index.jsx";
import { STORAGE_KEY } from "./config.js";
import pl from "../locales/pl.json";
import en from "../locales/en.json";

// ─── Pomocnicze mocki globali ─────────────────────────────────────────────────
function mockNavigator(languages) {
  vi.stubGlobal("navigator", { languages, language: languages?.[0] });
}
function mockLocalStorage(store = {}) {
  vi.stubGlobal("localStorage", {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  });
  return store;
}

afterEach(() => { vi.unstubAllGlobals(); });

// ─── WYKRYWANIE JĘZYKA ────────────────────────────────────────────────────────
describe("detectLanguage", () => {
  beforeEach(() => { mockLocalStorage({}); });

  it("a) urządzenie po polsku -> PL", () => {
    mockNavigator(["pl-PL", "en-US"]);
    expect(detectLanguage()).toBe("pl");
  });

  it("a2) polski nigdy nie jest nadpisany przez angielski jako domyślny", () => {
    mockNavigator(["pl"]);           // samo 'pl'
    expect(detectLanguage()).toBe("pl");
    mockNavigator(["en-GB", "pl-PL"]); // en pierwszy, ale i tak wygrywa pierwszy OBSŁUGIWANY
    expect(detectLanguage()).toBe("en");
  });

  it("b) język nieobsługiwany -> EN (fallback)", () => {
    mockNavigator(["fr-FR", "de-DE", "es"]);
    expect(detectLanguage()).toBe("en");
  });

  it("c) ręczny wybór z localStorage nadpisuje wykrycie urządzenia", () => {
    mockLocalStorage({ [STORAGE_KEY]: "en" });
    mockNavigator(["pl-PL"]);        // urządzenie po polsku…
    expect(detectLanguage()).toBe("en"); // …ale zapisany wybór 'en' wygrywa

    mockLocalStorage({ [STORAGE_KEY]: "pl" });
    mockNavigator(["en-US"]);        // urządzenie po angielsku…
    expect(detectLanguage()).toBe("pl"); // …ale zapisany wybór 'pl' wygrywa
  });

  it("c2) zapisany nieobsługiwany kod jest ignorowany, wraca do wykrycia", () => {
    mockLocalStorage({ [STORAGE_KEY]: "xx" });
    mockNavigator(["pl-PL"]);
    expect(detectLanguage()).toBe("pl");
  });

  it("d) błąd/brak danych -> EN (bez wywrotki)", () => {
    // navigator rzuca przy dostępie do languages
    vi.stubGlobal("navigator", { get languages() { throw new Error("blocked"); } });
    mockLocalStorage({});
    expect(detectLanguage()).toBe("en");

    // brak jakichkolwiek preferencji
    mockNavigator([]);
    expect(detectLanguage()).toBe("en");
  });

  it("d2) localStorage niedostępny nie wywraca odczytu", () => {
    vi.stubGlobal("localStorage", { get getItem() { throw new Error("blocked"); } });
    expect(readSavedLanguage()).toBe(null);
  });
});

describe("persistLanguage", () => {
  it("zapisuje tylko obsługiwane kody", () => {
    const store = mockLocalStorage({});
    persistLanguage("pl");
    expect(store[STORAGE_KEY]).toBe("pl");
    persistLanguage("xx");           // nieobsługiwany — ignorowany
    expect(store[STORAGE_KEY]).toBe("pl");
  });
});

// ─── FUNKCJA t() ──────────────────────────────────────────────────────────────
describe("makeT", () => {
  it("rozwiązuje klucze zagnieżdżone", () => {
    const t = makeT("pl");
    expect(t("addContact.title")).toBe("dodaj kontakt");
    expect(t("group.visibility.HIDDEN.label")).toBe("Ukryta");
  });

  it("podstawia zmienne {{var}}", () => {
    const t = makeT("pl");
    expect(t("createGroup.stepOf", { step: 2 })).toBe("krok 2 z 3");
  });

  it("zwraca i interpoluje tablice", () => {
    const t = makeT("pl");
    const bullets = t("privateChat.bullets", { name: "Ala" });
    expect(Array.isArray(bullets)).toBe(true);
    expect(bullets[0]).toContain("Ala");
  });

  it("fallback: brak klucza w bieżącym języku -> FALLBACK_LANGUAGE, potem sam klucz", () => {
    const t = makeT("pl");
    expect(t("nie.istnieje.taki.klucz")).toBe("nie.istnieje.taki.klucz");
  });
});

// ─── KOMPLETNOŚĆ TŁUMACZEŃ ────────────────────────────────────────────────────
describe("kompletność kluczy pl/en", () => {
  const leaves = (obj, prefix = "") =>
    Object.entries(obj).flatMap(([k, v]) => {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) return leaves(v, path);
      return [path];
    });

  it("en ma dokładnie te same klucze co pl", () => {
    const plKeys = new Set(leaves(pl));
    const enKeys = new Set(leaves(en));
    const missingInEn = [...plKeys].filter((k) => !enKeys.has(k));
    const extraInEn   = [...enKeys].filter((k) => !plKeys.has(k));
    expect(missingInEn).toEqual([]);
    expect(extraInEn).toEqual([]);
  });
});
