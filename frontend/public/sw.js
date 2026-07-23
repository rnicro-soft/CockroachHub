self.addEventListener("push", (event) => {
  let data = { title: "CockroachHub", body: "New update available", url: "/live-feed" };
  try {
    if (event.data) data = event.data.json();
  } catch {}

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/live-feed" },
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/live-feed";
  clients.openWindow(url);
});
