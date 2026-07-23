import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Shield, Eye, EyeOff, KeyRound } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";

interface StealthCtx {
  unlocked: boolean;
  lock: () => void;
  setPin: (pin: string) => void;
  checkPin: (pin: string) => boolean;
  hasPin: boolean;
  eraseMinutes: number;
  setEraseMinutes: (m: number) => void;
}

const Ctx = createContext<StealthCtx>({
  unlocked: false,
  lock: () => {},
  setPin: () => {},
  checkPin: () => false,
  hasPin: false,
  eraseMinutes: 30,
  setEraseMinutes: () => {},
});

export function useStealth() {
  return useContext(Ctx);
}

const PIN_KEY = "cockroachhub-pin";
const ERASE_KEY = "cockroachhub-erase-minutes";

export function StealthProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);

  const hasPin = !!localStorage.getItem(PIN_KEY);
  const [eraseMinutes, setEraseMinutesState] = useState(
    parseInt(localStorage.getItem(ERASE_KEY) || "30")
  );

  const setPin = useCallback((pin: string) => {
    localStorage.setItem(PIN_KEY, pin);
  }, []);

  const checkPin = useCallback((pin: string) => {
    return localStorage.getItem(PIN_KEY) === pin;
  }, []);

  const lock = useCallback(() => {
    setUnlocked(false);
  }, []);

  const setEraseMinutes = useCallback((m: number) => {
    setEraseMinutesState(m);
    localStorage.setItem(ERASE_KEY, String(m));
  }, []);

  // Global shortcut: Shift+L to lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "L") {
        setUnlocked(false);
        window.location.hash = "#stealth";
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!unlocked) {
    return <StealthLockScreen
      hasPin={hasPin}
      onUnlock={(pin) => { if (checkPin(pin)) setUnlocked(true); }}
      onSetPin={setPin}
    />;
  }

  return (
    <Ctx.Provider value={{ unlocked, lock, setPin, checkPin, hasPin, eraseMinutes, setEraseMinutes }}>
      {children}
    </Ctx.Provider>
  );
}

function StealthLockScreen({
  hasPin, onUnlock, onSetPin,
}: {
  hasPin: boolean; onUnlock: (pin: string) => void; onSetPin: (pin: string) => void;
}) {
  const { t } = useLocale();
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"unlock" | "set">(hasPin ? "unlock" : "set");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "unlock") {
      onUnlock(pin);
      setPin("");
    } else {
      if (pin.length < 4) return;
      if (pin !== confirm) { setConfirm(""); return; }
      onSetPin(pin);
      onUnlock(pin);
      setPin("");
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-gray-900 via-ph-dark to-gray-900 px-4">
      <div className="w-full max-w-xs text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-ph-orange">
          <KeyRound className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-lg font-black text-white mb-1">{t("stealth.protected")}</h1>
        <p className="text-xs text-ph-text-secondary mb-6">
          {mode === "unlock" ? t("stealth.enterPin") : t("stealth.setPin")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder={mode === "unlock" ? t("stealth.enterPinInput") : t("stealth.newPin")}
              className="ph-input text-center text-2xl tracking-[0.5em] placeholder:text-sm"
              autoFocus
              autoComplete="off"
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ph-text-muted hover:text-white">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mode === "set" && (
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder={t("stealth.confirmPin")}
                className="ph-input text-center text-2xl tracking-[0.5em] placeholder:text-sm"
                autoComplete="off"
              />
            </div>
          )}

          <button type="submit" className="ph-btn-primary w-full">
            {mode === "unlock" ? t("stealth.unlock") : t("stealth.setPinEnter")}
          </button>

          {mode === "unlock" && (
            <button type="button" onClick={() => { setMode("set"); setPin(""); setConfirm(""); }}
              className="text-xs text-ph-text-muted hover:text-ph-orange">
              {t("stealth.resetPin")}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
