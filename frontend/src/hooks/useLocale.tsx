import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Locale = "en" | "hi";

const messages: Partial<Record<Locale, Record<string, any>>> = {};

// Lazy load
async function loadLocale(locale: Locale) {
  if (messages[locale]) return messages[locale];
  const mod = await import(`../i18n/${locale}.json`);
  messages[locale] = mod.default;
  return mod.default;
}

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string) => any;
}

export const Ctx = createContext<LocaleCtx>({
  locale: "en",
  setLocale: () => {},
  t: (p: string) => p as any,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem("cockroachhub-locale") as Locale) || "en";
  });
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadLocale(locale).then(setData);
    localStorage.setItem("cockroachhub-locale", locale);
    document.documentElement.lang = locale === "hi" ? "hi" : "en";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (path: string): any => {
      const parts = path.split(".");
      let val: any = data;
      for (const p of parts) {
        if (val && typeof val === "object" && p in val) val = val[p];
        else return path;
      }
      return val;
    },
    [data]
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx);
}
