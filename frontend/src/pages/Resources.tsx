import { useState, useEffect } from "react";
import { ExternalLink, ShieldCheck, Instagram, Camera, AlertTriangle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import fallback from "../data/newsSources.json";

interface Source { id?: number; name: string; platform: string; link: string; description: string | null }

export default function Resources() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [sources, setSources] = useState<Source[]>(() => fallback as Source[]);

  useEffect(() => {
    if (!online) return;
    api.get("/news-sources").then(({ data }) => data?.length && setSources(data)).catch(() => {});
  }, [online]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("resources.seoTitle")} description={t("resources.seoDesc")} path="/resources" />
      <div className="ph-section"><div><h2>{t("resources.title")}</h2><div className="ph-section-accent" /></div></div>
      <Card className="border-ph-orange/20 bg-ph-orange-muted p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ph-orange mb-1"><ShieldCheck className="h-4 w-4" />{t("resources.trustedSources")}</h3>
        <p className="text-sm text-ph-text-dark dark:text-ph-text-secondary">{t("resources.trustedSourcesDesc")}</p>
      </Card>
      {sources.length === 0 && <p className="text-sm text-ph-text-muted py-8 text-center">{t("admin.noneYet")}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {sources.map((s, i) => (
          <a key={s.id || i} href={s.link} target="_blank" rel="noopener noreferrer"
            className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 flex items-center gap-3 hover:border-ph-orange/40 transition-colors">
            <div className="p-2.5 bg-ph-orange-muted shrink-0">
              {s.platform === "instagram" ? <Instagram className="h-5 w-5 text-ph-orange" /> : <Camera className="h-5 w-5 text-ph-orange" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{s.name}</h4>
              <p className="text-xs text-ph-text-muted mt-0.5">{s.description}</p>
              <span className="text-xs text-ph-orange font-bold mt-1 inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />{t("resources.viewOnInstagram")}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
