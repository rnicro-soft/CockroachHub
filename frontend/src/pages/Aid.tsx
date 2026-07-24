import { useState, useEffect } from "react";
import { Home, Utensils, Droplets, Heart } from "lucide-react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import fallback from "../data/aidOrganizations.json";

interface Org { id?: number; name: string; purpose: string | null; contact: string | null; category: string }

const bgMap: Record<string, string> = {
  "text-ph-orange": "bg-ph-orange/10",
  "text-ph-green": "bg-ph-green/10",
  "text-ph-red": "bg-ph-red/10",
  "text-ph-yellow": "bg-ph-yellow/10",
};

export default function Aid() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [orgs, setOrgs] = useState<Org[]>(() => fallback as Org[]);

  useEffect(() => {
    if (!online) return;
    api.get("/aid-organizations").then(({ data }) => data?.length && setOrgs(data)).catch(() => {});
  }, [online]);

  const typeConfig: Record<string, { icon: typeof Home; color: string; label: string }> = {
    accommodation: { icon: Home, color: "text-ph-orange", label: t("aid.types.accommodation") },
    aid: { icon: Utensils, color: "text-ph-green", label: t("aid.types.aid") },
    medical: { icon: Heart, color: "text-ph-red", label: t("aid.types.medicalAid") },
    volunteer: { icon: Droplets, color: "text-ph-yellow", label: t("aid.types.volunteer") },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("aid.seoTitle")} description={t("aid.seoDesc")} path="/aid" />
      <div className="ph-section"><div><h2>{t("aid.title")}</h2><div className="ph-section-accent" /></div></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {orgs.map((a, i) => {
          const cfg = typeConfig[a.category] || typeConfig.aid;
          const Icon = cfg.icon;
          return (
            <Card key={a.id || i} className="p-4 flex items-start gap-3">
              <div className={`rounded p-2 ${bgMap[cfg.color] || "bg-ph-orange/10"} shrink-0`}>
                <Icon className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{a.name}</h4>
                  <Badge>{cfg.label}</Badge>
                </div>
                <p className="text-xs text-ph-text-muted">{a.purpose}</p>
                <p className="text-xs text-ph-orange mt-1">{a.contact}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
