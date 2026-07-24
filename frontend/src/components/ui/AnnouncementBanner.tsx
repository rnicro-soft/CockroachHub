import { useEffect, useState } from "react";
import { X, Megaphone } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useLocale } from "../../hooks/useLocale";

interface Announcement {
  id: number;
  message: string;
  is_active: boolean;
}

export function AnnouncementBanner() {
  const { t } = useLocale();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    if (!online) return;
    fetch("/api/announcement")
      .then((r) => r.ok && r.json())
      .then((d) => { if (d && d.message) setAnnouncement(d); })
      .catch(() => {});
  }, [online]);

  if (!announcement || dismissed) return null;

  return (
    <div className="bg-ph-orange-muted border-b border-ph-orange/20 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-ph-orange" />
          <p className="text-sm font-semibold text-ph-text-dark dark:text-white leading-tight">
            {announcement.message}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 text-ph-text-muted hover:text-ph-text-dark dark:hover:text-white"
          aria-label={t("common.close")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
