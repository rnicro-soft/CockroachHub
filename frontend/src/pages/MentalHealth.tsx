import { useState, useEffect } from "react";
import { Heart, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import fallback from "../data/mentalHealthProviders.json";

interface Provider { id?: number; name: string; contact: string | null; email: string | null; service_type: string; details: string | null; location: string | null }

export default function MentalHealth() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [providers, setProviders] = useState<Provider[]>(() => fallback as Provider[]);

  useEffect(() => {
    if (!online) return;
    api.get("/mental-health").then(({ data }) => data?.length && setProviders(data)).catch(() => {});
  }, [online]);

  const onlineProv = providers.filter((p) => p.service_type === "online");
  const offlineProv = providers.filter((p) => p.service_type === "offline");

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("mentalHealth.seoTitle")} description={t("mentalHealth.seoDesc")} path="/mental-health" />
      <div className="ph-section"><div><h2>{t("mentalHealth.title")}</h2><div className="ph-section-accent" /></div></div>
      <Card className="border-cjp-maroon/30 bg-cjp-maroon/5 p-5">
        <p className="text-lg font-bold text-white mb-1">{t("mentalHealth.youAreNotAlone")}</p>
        <p className="text-sm text-ph-text-secondary">{t("mentalHealth.protestingIsHeavy")}</p>
      </Card>
      <h3 className="text-sm font-bold text-ph-text-dark dark:text-white flex items-center gap-2"><MessageCircle className="h-4 w-4 text-ph-orange" />{t("mentalHealth.onlineCounsellors")}</h3>
      {onlineProv.length === 0 && <p className="text-sm text-ph-text-muted py-4">{t("admin.noneYet")}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {onlineProv.map((p, i) => (
          <Card key={p.id || i} className="p-4">
            <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{p.name}</h4>
            {p.details && <p className="text-xs text-ph-text-muted mt-0.5">{p.details}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {p.email && <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1 text-xs text-ph-orange hover:underline"><Mail className="h-3 w-3" />{p.email}</a>}
              {p.contact && /^\d/.test(p.contact) && <a href={`tel:${p.contact.replace(/\D/g, "")}`} className="inline-flex items-center gap-1 text-xs text-ph-green hover:underline"><Phone className="h-3 w-3" />{p.contact}</a>}
            </div>
            {p.location && <p className="text-xs text-ph-text-muted mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</p>}
          </Card>
        ))}
      </div>
      {offlineProv.length > 0 && (
        <><h3 className="text-sm font-bold text-ph-text-dark dark:text-white flex items-center gap-2 mt-4"><MapPin className="h-4 w-4 text-ph-green" />{t("mentalHealth.offlineClinics")}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {offlineProv.map((p, i) => (
            <Card key={p.id || i} className="p-4">
              <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{p.name}</h4>
              {p.details && <p className="text-xs text-ph-text-muted mt-0.5">{p.details}</p>}
              {p.contact && <p className="text-xs text-ph-green mt-1 flex items-center gap-1"><Phone className="h-3 w-3" />{p.contact}</p>}
              {p.location && <p className="text-xs text-ph-text-muted mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</p>}
            </Card>
          ))}
        </div></>
      )}
    </div>
  );
}
