import { ServerCrash } from "lucide-react";
import { useBackendStatus } from "../../hooks/useBackendStatus";
import { useLocale } from "../../hooks/useLocale";

export function BackendBanner() {
  const online = useBackendStatus();
  const { t } = useLocale();

  if (online) return null;

  return (
    <div className="bg-ph-red/15 border-b border-ph-red/30 px-4 py-2 text-center">
      <p className="flex items-center justify-center gap-2 text-xs font-bold text-ph-red">
        <ServerCrash className="h-3.5 w-3.5" />
        {t("offline.backendBanner")}
      </p>
    </div>
  );
}
