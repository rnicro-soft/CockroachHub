import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { LogOut, ArrowLeft } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";

interface PanicContextType {
  safeMode: boolean;
  togglePanic: () => void;
}

const PanicContext = createContext<PanicContextType>({
  safeMode: false,
  togglePanic: () => {},
});

export function usePanic() {
  return useContext(PanicContext);
}

export function PanicProvider({ children }: { children: ReactNode }) {
  const [safeMode, setSafeMode] = useState(false);
  const { t } = useLocale();

  const togglePanic = useCallback(() => {
    setSafeMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") togglePanic();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePanic]);

  if (safeMode) {
    return (
      <div className="min-h-dvh bg-white dark:bg-ph-black text-gray-800 dark:text-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300">{t("panic.todaysWeather")}</h1>
            <button
              onClick={togglePanic}
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <ArrowLeft className="h-4 w-4" /> {t("panic.back")}
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-ph-dark-2 rounded-lg p-6 text-center">
              <p className="text-5xl font-bold text-gray-800 dark:text-white">{t("panic.temp")}</p>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{t("panic.location")}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t("panic.condition")}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["forecastMon", "forecastTue", "forecastWed"].map((key) => (
                <div key={key} className="bg-gray-50 dark:bg-ph-dark-2 rounded-lg p-4 text-center">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t("panic." + key)}</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">31°</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{"26°"}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-8">
              {t("panic.updated")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PanicContext.Provider value={{ safeMode, togglePanic }}>
      {children}
    </PanicContext.Provider>
  );
}

export function PanicTrigger() {
  const { togglePanic } = usePanic();
  const { t } = useLocale();

  return (
    <button
      onClick={togglePanic}
      className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[12px] font-bold bg-ph-red/20 text-ph-red hover:bg-ph-red/30 transition-colors"
      aria-label={t("panic.quickExit")}
      title={t("nav.exit") + " (Esc)"}
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{t("panic.exit")}</span>
    </button>
  );
}
