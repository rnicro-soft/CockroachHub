import React from "react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Shield, Download, MapPin, WifiOff, Users, Camera, ClipboardList } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

export default function Preparation() {
  const { t } = useLocale();
  const beforeI18n = t("preparation.beforeItems") as unknown as { label: string; desc: string }[];
  const afterI18n = t("preparation.afterItems") as unknown as string[];
  const icons = [MapPin, WifiOff, MapPin, ClipboardList, Camera, Users, Download, Shield];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("preparation.seoTitle")} description={t("preparation.seoDesc")} path="/preparation" />

      <div className="ph-section">
        <div><h2>{t("preparation.title")}</h2><div className="ph-section-accent" /></div>
      </div>

      <Card className="border-cjp-maroon/30 bg-cjp-maroon/5 p-5">
        <p className="text-sm font-bold text-ph-orange mb-1">⚠️ {t("preparation.warningTitle")}</p>
        <p className="text-sm text-ph-text-secondary">{t("preparation.warningText")}</p>
      </Card>

      <h3 className="text-sm font-bold text-ph-text-dark dark:text-white flex items-center gap-2">
        <Shield className="h-4 w-4 text-ph-orange" /> {t("preparation.beforeProtest")}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {beforeI18n.map((item, idx) => (
          <Card key={idx} className="p-4 flex items-start gap-3">
            <div className="rounded p-2 bg-ph-orange/10 shrink-0">{React.createElement(icons[idx] || Shield, { className: "h-5 w-5 text-ph-orange" })}</div>
            <div>
              <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{item.label}</h4>
              <p className="text-xs text-ph-text-muted mt-0.5">{item.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <h3 className="text-sm font-bold text-ph-text-dark dark:text-white flex items-center gap-2 mt-4">
        <Camera className="h-4 w-4 text-ph-green" /> {t("preparation.afterProtest")}
      </h3>

      <Card className="p-5 space-y-3">
        {afterI18n.map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-ph-text-secondary">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ph-green/10 text-ph-green text-xs font-bold shrink-0">{i + 1}</span>
            <span>{item}</span>
          </div>
        ))}
      </Card>

      <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
        <p className="text-sm text-ph-text-secondary">
          <strong className="text-white">{t("preparation.solidarityKit")}</strong>{' '}
          <a href="https://protest.uskhokhar.xyz" target="_blank" rel="noopener noreferrer" className="text-ph-orange hover:underline">protest.uskhokhar.xyz</a>
          {' '}— {t("preparation.solidarityKitDesc")}
        </p>
      </Card>
    </div>
  );
}
