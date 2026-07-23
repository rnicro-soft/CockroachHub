import { useState, useEffect } from "react";
import { Phone, Copy, Check, Shield } from "lucide-react";
import { SEO } from "../components/SEO";
import { CardSkeleton } from "../components/ui/Skeleton";
import { ShareButton } from "../components/ui/ShareButton";
import { fetchWithCache, getCacheAge } from "../lib/offlineCache";
import { useLocale } from "../hooks/useLocale";
import type { EmergencyContact } from "../types";
import fallback from "../data/emergencyContacts.json";

export default function Emergency() {
  const { t } = useLocale();
  const cats = [
    { key: "legal", label: t("emergency.categories.legal") },
    { key: "medical", label: t("emergency.categories.medical") },
    { key: "helpline", label: t("emergency.categories.helpline") },
  ] as const;
  const [contacts, setContacts] = useState<EmergencyContact[]>(fallback as EmergencyContact[]);
  const [cat, setCat] = useState("legal");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const cacheAge = getCacheAge("emergency-contacts");

  useEffect(() => {
    setLoading(true);
    fetchWithCache("/api/emergency-contacts", "emergency-contacts", fallback as EmergencyContact[])
      .then((d) => { if (d && d.length) setContacts(d as EmergencyContact[]); })
      .finally(() => setLoading(false));
  }, []);

  const copy = async (id: number, phone: string) => {
    try { await navigator.clipboard.writeText(phone); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); } catch {}
  };

  const filtered = contacts.filter((c) => c.category === cat);

  return (
    <>
      <SEO title={t("emergency.seoTitle")} description={t("emergency.seoDesc")} path="/emergency" />
      <div className="space-y-5">
      <div className="ph-section">
        <div>
          <h2>{t("emergency.title")}</h2>
          <div className="ph-section-accent" />
        </div>
      </div>

      <div className="ph-tabs">
        {cats.map(({ key, label }) => (
          <button key={key} onClick={() => setCat(key)}
            className={cat === key ? "ph-tab-active" : "ph-tab-inactive"}
          >{label}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 cv-auto">
        {loading ? (<>
<CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
</>) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-ph-text-muted">{t("emergency.noContacts")}</div>
        ) : (
          filtered.map((c) => (
          <div key={c.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-bold text-ph-text-dark dark:text-white">{c.name}</h3>
                  {c.description && <p className="text-[11px] text-ph-text-muted mt-0.5">{c.description}</p>}
                  {c.city && <p className="text-[11px] text-ph-text-muted mt-0.5">{c.city}</p>}
                </div>
                {c.is_verified && (
                  <span className="ph-badge-green"><Shield className="mr-0.5 h-3 w-3" />{t("emergency.verified")}</span>
                )}
              </div>
              <p className="text-lg font-black text-ph-orange mb-3">{c.phone}</p>
              <div className="flex gap-2">
                <a href={`tel:${c.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 ph-btn-primary ph-btn-sm"
                  aria-label={t("emergency.callAria").replace("{name}", c.name).replace("{phone}", c.phone)}>
                  <Phone className="h-4 w-4" />{t("emergency.call")}
                </a>
                <button onClick={() => copy(c.id, c.phone)}
                  className="ph-btn-outline ph-btn-sm flex-1"
                  aria-label={t("emergency.copyAria").replace("{phone}", c.phone)}>
                  {copiedId === c.id ? <><Check className="h-4 w-4" />{t("emergency.copied")}</> : <><Copy className="h-4 w-4" />{t("emergency.copy")}</>}
                </button>
                <ShareButton name={c.name} phone={c.phone} />
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      <p className="text-[11px] text-ph-text-muted text-center">
        {cacheAge ? `${t("emergency.synced")} ${cacheAge}` : t("emergency.loadedFromCache")} · {t("emergency.footerNote")}
      </p>

      <div className="bg-ph-orange-muted border border-ph-orange/20 px-5 py-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
          <div className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
            <p className="font-bold text-ph-text-dark dark:text-white">{t("emergency.privacyTitle")}</p>
            <p className="mt-1">{t("emergency.privacyDesc")}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}