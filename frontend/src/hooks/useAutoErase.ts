import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const STORAGE_KEYS = ["auth", "cockroachhub-theme", "cockroachhub-locale", "protest-checklist"];

export function useAutoErase(enabled: boolean, timeoutMinutes: number = 30) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const warningRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const warnedRef = useRef(false);

  const erase = useCallback(() => {
    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    // Clear IndexedDB caches
    if ("caches" in window) {
      caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
    }
    // Clear service worker cache
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) =>
        regs.forEach((r) => r.unregister())
      );
    }
    toast.error("Auto-erased for safety. Reloading...", { duration: 5000 });
    setTimeout(() => window.location.reload(), 2000);
  }, []);

  const resetTimer = useCallback(() => {
    warnedRef.current = false;
    clearTimeout(timerRef.current);
    clearTimeout(warningRef.current);

    if (!enabled) return;

    // Show warning 30s before erase
    warningRef.current = setTimeout(() => {
      if (!warnedRef.current) {
        warnedRef.current = true;
        toast(
          `Auto-erase in 30s — tap anywhere to keep data`,
          { duration: 25000, icon: "⚠️" }
        );
      }
    }, (timeoutMinutes * 60 - 30) * 1000);

    timerRef.current = setTimeout(erase, timeoutMinutes * 60 * 1000);
  }, [enabled, timeoutMinutes, erase]);

  useEffect(() => {
    if (!enabled) {
      clearTimeout(timerRef.current);
      clearTimeout(warningRef.current);
      return;
    }

    const events = ["mousedown", "touchstart", "keydown", "scroll", "click"];
    const handler = () => resetTimer();

    resetTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimeout(timerRef.current);
      clearTimeout(warningRef.current);
    };
  }, [enabled, resetTimer]);

  return { erase, resetTimer };
}
