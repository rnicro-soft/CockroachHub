import { useState, useEffect } from "react";
import { Scale, BookOpen } from "lucide-react";
import { Accordion } from "../components/ui/Accordion";
import { fetchWithCache, getCacheAge } from "../lib/offlineCache";
import type { LegalRight } from "../types";
import fallback from "../data/rights.json";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";

export default function LegalRights() {
  const { t } = useLocale();
  const [rights, setRights] = useState<LegalRight[]>(fallback as LegalRight[]);
  const [cat, setCat] = useState("detention");
  const cacheAge = getCacheAge("legal-rights");

  useEffect(() => {
    fetchWithCache("/api/legal-rights", "legal-rights", fallback as LegalRight[])
      .then((d) => { if (d && (d as LegalRight[]).length) setRights(d as LegalRight[]); })
      .catch(() => {});
  }, []);

  const catLabels: Record<string, string> = {
    detention: t("legalRights.categories.detention"),
    search_seizure: t("legalRights.categories.search_seizure"),
    questioning: t("legalRights.categories.questioning"),
    general: t("legalRights.categories.general"),
  };

  const cats = [...new Set(rights.map((r) => r.category))];
  const shown = rights.filter((r) => r.category === cat);

  return (
    <>
      <SEO title={t("legalRights.seoTitle")} description={t("legalRights.seoDesc")} path="/legal-rights" />
      <div className="space-y-5 max-w-4xl">
        <div className="ph-section">
          <div>
            <h2>{t("legalRights.title")}</h2>
            <div className="ph-section-accent" />
          </div>
        </div>

        <div className="ph-tabs">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={cat === c ? "ph-tab-active" : "ph-tab-inactive"}
            >{catLabels[c] || c}</button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-ph-text-muted">{t("common.noResults") || "No rights in this category"}</p>
        ) : (
          <Accordion
            items={shown.map((r) => ({
              id: String(r.id),
              title: r.title,
              content: r.content,
            }))}
          />
        )}

        <div className="bg-ph-orange-muted border border-ph-orange/20 px-5 py-4">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
            <div className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
              <p className="font-bold text-ph-text-dark dark:text-white">{t("legalRights.disclaimerTitle")}</p>
              <p className="mt-1">{t("legalRights.disclaimerText")}</p>
              <p className="mt-1 text-xs text-ph-text-muted">{t("legalRights.sources")} · {cacheAge ? `${t("legalRights.synced")} ${cacheAge}` : t("legalRights.availableOffline")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
