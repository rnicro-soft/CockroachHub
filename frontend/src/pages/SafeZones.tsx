import { useState, useEffect } from "react";
import { Navigation, Shield } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import fallback from "../data/safeZones.json";

interface Zone { id?: number; name: string; type: string; description: string | null; status: string; lat: number; lng: number }

const typeColors: Record<string, "green" | "yellow" | "red" | "orange" | "default"> = {
  legal: "default", medical: "green", safe: "orange", alert: "red",
};

export default function SafeZones() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [zones, setZones] = useState<Zone[]>(() => fallback as Zone[]);

  useEffect(() => {
    if (!online) return;
    api.get("/safe-zones").then(({ data }) => data?.length && setZones(data)).catch(() => {});
  }, [online]);

  return (
    <>
      <SEO title={t("safeZones.seoTitle")} description={t("safeZones.seoDesc")} path="/safe-zones" />
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="ph-section"><div><h2>{t("safeZones.title")}</h2><div className="ph-section-accent" /></div></div>
        <Card className="bg-ph-orange-muted border border-ph-orange/20 p-4">
          <p className="text-sm text-ph-text-dark dark:text-ph-text-secondary">{t("safeZones.subtitle")}</p>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {zones.map((z, i) => (
            <a key={z.id || i} href={`https://www.google.com/maps/dir/?api=1&destination=${z.lat},${z.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="block bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border hover:border-ph-orange/50 transition-colors">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{z.name}</h3>
                  <Badge variant={typeColors[z.type] || "default"}>{t(`safeZones.typeLabels.${z.type}`)}</Badge>
                </div>
                <p className="text-xs text-ph-text-muted mb-3">{z.description}</p>
                <div className="flex items-center gap-2 text-xs text-ph-orange font-bold">
                  <Navigation className="h-3.5 w-3.5" />{t("safeZones.getDirections")}
                </div>
              </div>
            </a>
          ))}
        </div>
        <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
            <div className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
              <p className="font-bold text-ph-text-dark dark:text-white">{t("safeZones.proTip")}</p>
              <p className="mt-1">{t("safeZones.proTipDesc")}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
