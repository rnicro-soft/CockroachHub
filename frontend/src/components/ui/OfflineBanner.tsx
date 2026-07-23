import { Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useLocale } from "../../hooks/useLocale";

export function OfflineBanner() {
  const online = useOnlineStatus();
  const { t } = useLocale();

  if (online) return null;

  return (
    <div className="bg-ph-yellow/15 border-b border-ph-yellow/30 px-4 py-2 text-center">
      <p className="flex items-center justify-center gap-2 text-xs font-bold text-ph-yellow">
        <WifiOff className="h-3.5 w-3.5" />
        {t("offline.banner")}
      </p>
    </div>
  );
}
