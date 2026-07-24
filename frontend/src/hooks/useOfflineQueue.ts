import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const QUEUE_KEY = "cockroachhub-offline-queue";

interface QueuedItem {
  id: number;
  type: string;
  description: string;
  location: string | null;
  queuedAt: string;
}

export function useOfflineQueue(t?: (s: string) => string) {
  const flushingRef = useRef(false);
  const translate = t || ((s: string) => s);

  const getQueue = useCallback((): QueuedItem[] => {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    } catch {
      return [];
    }
  }, []);

  const addToQueue = useCallback(async (type: string, description: string, location?: string) => {
    const item: QueuedItem = {
      id: Date.now(),
      type,
      description,
      location: location || null,
      queuedAt: new Date().toISOString(),
    };

    if (navigator.onLine) {
      try {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, description, location: location || null }),
        });
        if (res.ok) {
          toast.success(translate("offlineQueue.sent"));
          return true;
        }
      } catch {}
    }

    // Offline — queue it
    const queue = getQueue();
    queue.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    toast.success(translate("offlineQueue.savedOffline"));
    return true;
  }, [getQueue, translate]);

  const flushQueue = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;

    const queue = getQueue();
    if (queue.length === 0) {
      flushingRef.current = false;
      return;
    }

    let sent = 0;
    for (const item of queue) {
      try {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: item.type,
            description: item.description,
            location: item.location,
          }),
        });
        if (res.ok) sent++;
      } catch {
        break; // Still offline, stop flushing
      }
    }

    if (sent > 0) {
      const remaining = queue.slice(sent);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      toast.success(translate("offlineQueue.flushed").replace("{count}", String(sent)));
    }

    flushingRef.current = false;
  }, [getQueue, translate]);

  useEffect(() => {
    const handler = () => flushQueue();
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [flushQueue]);

  return { addToQueue };
}
