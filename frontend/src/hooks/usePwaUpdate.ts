import { useCallback, useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  useEffect(() => {
    const updater = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log("App ready for offline use");
      },
    });
    setUpdateSW(() => updater);
  }, []);

  const applyUpdate = useCallback(() => {
    if (updateSW) {
      updateSW();
      setNeedRefresh(false);
    }
  }, [updateSW]);

  return { needRefresh, applyUpdate };
}
