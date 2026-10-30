import { createContext, useContext, type ReactNode } from "react";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

// The site speaks Russian by default; visitors can switch to English.
// The choice lives in a cookie so the server renders the right language.

export type Lang = "ru" | "en";
export const LANGS: Lang[] = ["ru", "en"];

// A text in both languages, for labels kept in data (menus, categories…).
export type L = { ru: string; en: string };

const COOKIE = "lang";

function parseLang(value: string | undefined): Lang {
  return value === "en" ? "en" : "ru";
}

export const getLang = createIsomorphicFn()
  .server(() => parseLang(getCookie(COOKIE)))
  .client(() => parseLang(document.cookie.match(/(?:^|; )lang=([^;]*)/)?.[1]));

export function saveLang(lang: Lang) {
  document.cookie = `${COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

// Locale for dates and numbers shown to the visitor.
export function dateLocale(lang: Lang) {
  return lang === "en" ? "en-GB" : "ru-RU";
}

export type T = {
  (ru: string, en: string): string;
  (text: L): string;
};

// tr("en")("Корзина", "Cart") → "Cart". Use in route `head` and server functions.
export function tr(lang: Lang): T {
  return ((a: string | L, b?: string) => {
    if (typeof a === "string") return lang === "en" ? (b ?? a) : a;
    return a[lang];
  }) as T;
}

const LangContext = createContext<Lang>("ru");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  return tr(useLang());
}

// plural("ru", 5, ["товар", "товара", "товаров"], ["item", "items"]) → "товаров".
export function plural(lang: Lang, n: number, ru: [string, string, string], en: [string, string]) {
  if (lang === "en") return n === 1 ? en[0] : en[1];
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return ru[0];
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return ru[1];
  return ru[2];
}
