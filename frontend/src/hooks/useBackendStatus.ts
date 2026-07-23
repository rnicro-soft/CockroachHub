import { useCallback, useEffect, useState } from "react";

export function useBackendStatus() {
  const [online, setOnline] = useState(true);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { signal: AbortSignal.timeout(5000) });
      const ok = res.ok;
      setOnline((prev) => {
        if (ok !== prev && !ok) console.warn("Backend unreachable");
        return ok;
      });
    } catch {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [check]);

  return online;
}
