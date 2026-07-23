import { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, HelpCircle, ExternalLink } from "lucide-react";
import type { FactCheck } from "../types";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";

const vc: Record<string, { icon: typeof ShieldCheck; badge: string }> = {
  true: { icon: CheckCircle, badge: "ph-badge-green" },
  false: { icon: XCircle, badge: "ph-badge-red" },
  misleading: { icon: AlertTriangle, badge: "ph-badge-yellow" },
  unverified: { icon: HelpCircle, badge: "ph-badge-default" },
};

const sample = [
  { id: 1, title: "NEET 2024 Paper Leak", claim: "CBI confirmed coordinated leak across 6 states", verdict: "true", explanation: "CBI found evidence of coordinated NEET-UG 2024 paper leak across Bihar, Gujarat, Maharashtra, Rajasthan, Haryana, UP. Multiple arrests made.", source: "CBI official statement, Supreme Court", is_published: true, created_at: "2025-07-23T08:00:00Z" },
  { id: 2, title: "50,000 students arrested?", claim: "Over 10,000 students arrested during NEET protests", verdict: "false", explanation: "Exaggerated. ~350-400 detained across Delhi, Lucknow, Patna over 3 days. Most released within 24h.", source: "Verified news reports, legal aid volunteers", is_published: true, created_at: "2025-07-22T10:00:00Z" },
  { id: 3, title: "Supreme Court NEET Hearing", claim: "SC hearing petition to cancel NEET-UG 2024 results", verdict: "true", explanation: "SC hearing multiple petitions. Court sought NTA and CBI responses. Final decision pending.", source: "Supreme Court orders, LiveLaw", is_published: true, created_at: "2025-07-21T14:00:00Z" },
  { id: 4, title: "Holidays declared due to protests", claim: "Delhi govt declared holidays for all schools", verdict: "misleading", explanation: "Some individual institutions closed 1-2 days. No government-wide mandate.", source: "Delhi Govt Education Department", is_published: true, created_at: "2025-07-20T09:00:00Z" },
  { id: 5, title: "PM Modi Announces Fast-Track Courts for Paper Leaks", claim: "PM Modi announced fast-track courts for NEET and other exam paper leak cases", verdict: "true", explanation: "On July 23, 2026, PM Modi confirmed fast-track courts for paper leak cases, stating 'Nothing is more important than the welfare and future of our youth.' Education Minister Pradhan faces sustained resignation demands from CJP-led protests.", source: "Times of India, PMO India", is_published: true, created_at: "2026-07-23T06:00:00Z" },
  { id: 6, title: "CBI Gives Clean Chit to NEET Kingpin", claim: "CBI gave clean chit to alleged kingpin Sanjeev Mukhiya", verdict: "true", explanation: "CBI found 'no evidence' against Sanjeev Mukhiya, the alleged kingpin in the NEET-UG 2024 paper leak case. 13 others remain arrested. This has sparked further outrage among student protesters.", source: "Times of India, July 23, 2026", is_published: true, created_at: "2026-07-23T08:00:00Z" },
];

export default function FactCheck() {
  const { t } = useLocale();
  const [checks, setChecks] = useState<FactCheck[]>(sample as unknown as FactCheck[]);

  useEffect(() => {
    fetch("/api/fact-checks")
      .then((r) => r.ok && r.json())
      .then((d) => d?.length && setChecks(d))
      .catch(() => {});
  }, []);

  return (
    <>
      <SEO title={t("factCheck.seoTitle")} description={t("factCheck.seoDesc")} path="/fact-check" />
      <div className="space-y-5 max-w-5xl">
        <div className="ph-section">
          <div>
            <h2>{t("factCheck.title")}</h2>
            <div className="ph-section-accent" />
          </div>
        </div>

        <div className="bg-ph-orange-muted border border-ph-orange/20 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ph-orange mb-1">
            <ShieldCheck className="h-4 w-4" />{t("factCheck.bustRumors")}
          </h3>
          <p className="text-sm text-ph-text-dark dark:text-ph-text-secondary">{t("factCheck.description")}</p>
        </div>

        <div className="grid gap-4">
          {checks.map((c) => {
            const v = vc[c.verdict] || vc.unverified;
            const Icon = v.icon;
            const verdictKey = c.verdict in vc ? c.verdict : "unverified";
            return (
              <div key={c.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 shrink-0 ${
                      c.verdict === "true" ? "bg-ph-green/10" : c.verdict === "false" ? "bg-ph-red/10" : c.verdict === "misleading" ? "bg-ph-yellow/10" : "bg-gray-100 dark:bg-ph-card-hover"
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        c.verdict === "true" ? "text-ph-green" : c.verdict === "false" ? "text-ph-red" : c.verdict === "misleading" ? "text-ph-yellow" : "text-ph-text-muted"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-[14px] font-bold text-ph-text-dark dark:text-white">{c.title}</h3>
                        <span className={v.badge}>{t("factCheck.verdicts." + verdictKey)}</span>
                      </div>
                      <p className="text-xs italic text-ph-text-muted mb-2">"{(c as any).claim}"</p>
                      <p className="text-sm text-ph-text-dark dark:text-ph-text-secondary leading-relaxed">{c.explanation}</p>
                      {c.source && <p className="mt-2 flex items-center gap-1.5 text-xs text-ph-text-muted"><ExternalLink className="h-3 w-3" />{t("factCheck.source")}: {c.source}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
