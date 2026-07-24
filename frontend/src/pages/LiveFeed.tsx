import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Radio, MapPin, Clock, AlertTriangle, Info, Stethoscope, Shield, RefreshCw, WifiOff,
} from "lucide-react";
import { LiveAnnouncer } from "../components/ui/LiveAnnouncer";
import { fetchWithCache, getCacheAge } from "../lib/offlineCache";
import { useLocale } from "../hooks/useLocale";
import type { Alert } from "../types";
import fallback from "../data/liveAlerts.json";
import { SEO } from "../components/SEO";

const icons: Record<string, typeof Radio> = {
  medical: Stethoscope, legal: Shield, safety: AlertTriangle, general: Info,
};

const sevBorder: Record<string, string> = {
  green: "ph-sev-green", yellow: "ph-sev-yellow", red: "ph-sev-red",
};

export default function LiveFeed() {
  const { t } = useLocale();

  const filters = [
    { key: "", label: t("liveFeed.filters.all"), icon: Radio },
    { key: "medical", label: t("liveFeed.filters.medical"), icon: Stethoscope },
    { key: "legal", label: t("liveFeed.filters.legal"), icon: Shield },
    { key: "safety", label: t("liveFeed.filters.safety"), icon: AlertTriangle },
    { key: "general", label: t("liveFeed.filters.general"), icon: Info },
  ] as const;

  function timeAgo(d: string): string {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return t("liveFeed.justNow");
    if (m < 60) return `${m}${t("liveFeed.mAgo")}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}${t("liveFeed.hAgo")}`;
    return `${Math.floor(h / 24)}${t("liveFeed.dAgo")}`;
  }
  const [alerts, setAlerts] = useState<Alert[]>(fallback as Alert[]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get("q") || "";
  const cacheAge = getCacheAge("alerts");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    const params = new URLSearchParams();
    if (filter) params.set("type", filter);
    if (searchQ) params.set("q", searchQ);
    const qs = params.toString();
    const data = await fetchWithCache(`/api/alerts${qs ? `?${qs}` : ""}`, "alerts", fallback as Alert[]);
    if (data && (data as Alert[]).length) setAlerts(data as Alert[]);
    else setFetchError(true);
    setLoading(false);
  }, [filter, searchQ]);

  useEffect(() => { fetchAlerts(); const id = setInterval(fetchAlerts, 30000); return (
) => clearInterval(id); }, [fetchAlerts]);

  const shown = filter ? alerts.filter((a) => a.type === filter) : alerts;
  const alertTitles = shown.map((a) => a.title);

  return (
    <>
<SEO title={t("liveFeed.seoTitle")} description={t("liveFeed.seoDesc")} path="/live-feed" />
<div className="space-y-5">
        <div className="flex items-center justify-between">
        <div className="ph-section flex-1 mb-0 border-b-0 pb-0">
          <div>
            <h2>{t("liveFeed.title")}</h2>
            <div className="ph-section-accent" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fetchError && (
            <span className="flex items-center gap-1 text-xs text-ph-red font-bold">
              <WifiOff className="h-3 w-3" />{t("liveFeed.cached")} {cacheAge || t("liveFeed.unknown")}
            </span>
          )}
          {!fetchError && cacheAge && (
            <span className="text-[11px] text-ph-text-muted">{t("liveFeed.synced")} {cacheAge}</span>
          )}
          <button onClick={fetchAlerts} className="ph-btn-ghost ph-btn-sm" aria-label={t("liveFeed.refreshAria")}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />{t("liveFeed.refresh")}
          </button>
        </div>
      </div>

      <div className="ph-tabs">
        {filters.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={filter === key ? "ph-tab-active flex items-center gap-1.5" : "ph-tab-inactive flex items-center gap-1.5"}
          ><Icon className="h-3.5 w-3.5" />{label}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 cv-auto">
        {shown.length === 0 && (
          <div className="col-span-full py-20 text-center"><Radio className="mx-auto h-8 w-8 text-ph-text-muted" /><p className="mt-2 text-sm text-ph-text-muted">{t("liveFeed.noAlerts")}</p></div>
        )}
        {shown.map((a) => {
          const Icon = icons[a.type as keyof typeof icons] || Info;
          return (
<div key={a.id} className={`bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border ${sevBorder[a.severity]}`}>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2.5 ${
                    a.severity === "red" ? "bg-ph-red/10" : a.severity === "yellow" ? "bg-ph-yellow/10" : "bg-ph-green/10"
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      a.severity === "red" ? "text-ph-red" : a.severity === "yellow" ? "text-ph-yellow" : "text-ph-green"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-ph-text-dark dark:text-white">{a.title}</h3>
                      {a.featured && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-cjp-maroon/10 text-cjp-maroon border border-cjp-maroon/30">{t("liveFeed.featured") || "Featured"}</span>}
                    </div>
                    <p className="text-xs text-ph-text-muted mt-0.5 leading-relaxed">{a.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-ph-border-light dark:border-ph-border pt-3 text-[11px] text-ph-text-muted">
                  <div className="flex flex-wrap gap-3">
                    {a.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(a.created_at)}</span>
                  </div>
                  <span className={`ph-chip text-[10px] ${
                    a.severity === "red" ? "ph-badge-red" : a.severity === "yellow" ? "ph-badge-yellow" : "ph-badge-green"
                  }`}>{a.severity === "red" ? t("liveFeed.severity.red") : a.severity === "yellow" ? t("liveFeed.severity.yellow") : t("liveFeed.severity.green")}</span>
                </div>
              </div>
            </div>
      );
})}
      </div>
      <LiveAnnouncer messages={alertTitles} />
    </div>
    </>
      );
}