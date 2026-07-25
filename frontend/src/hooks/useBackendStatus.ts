import { useCallback, useEffect, useRef, useState } from "react";

export function useBackendStatus() {
  const [online, setOnline] = useState(true);
  const failCount = useRef(0);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        failCount.current = 0;
        setOnline(true);
      } else {
        failCount.current++;
        if (failCount.current >= 2) setOnline(false);
      }
    } catch {
      failCount.current++;
      if (failCount.current >= 2) setOnline(false);
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [check]);

  return online;
}
