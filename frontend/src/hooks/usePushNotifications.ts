import { useCallback, useEffect, useState } from "react";

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  const getVapidKey = async (): Promise<Uint8Array | null> => {
    try {
      const res = await fetch("/api/push/vapid-key");
      const { public_key } = await res.json();
      const binary = atob(public_key);
      const arr = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
      return arr;
    } catch {
      return null;
    }
  };

  const subscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = await getVapidKey();
      if (!vapidKey) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey as BufferSource,
      });

      const body = JSON.parse(JSON.stringify(sub));
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: body.endpoint, auth: body.keys.auth, p256dh: body.keys.p256dh }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscribe error:", err);
    }
  }, [supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const body = JSON.parse(JSON.stringify(sub));
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: body.endpoint, auth: body.keys.auth, p256dh: body.keys.p256dh }),
        });
        await sub.unsubscribe();
        setSubscribed(false);
      }
    } catch (err) {
      console.error("Push unsubscribe error:", err);
    }
  }, [supported]);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub))
    );
  }, [supported]);

  return { supported, subscribed, subscribe, unsubscribe };
}
