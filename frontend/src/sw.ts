/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  let data: { title?: string; body?: string; url?: string } = {};
  try {
    data = event.data?.json() || {};
  } catch {}

  const title = data.title || "CockroachHub";
  const options = {
    body: data.body || "New update available",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/live-feed" },
    vibrate: [200, 100, 200] as unknown as number[],
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options as unknown as NotificationOptions));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as any)?.url || "/live-feed";
  event.waitUntil(self.clients.openWindow(url));
});
