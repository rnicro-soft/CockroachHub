import { useState } from "react";
import {
  AlertTriangle, Shield, Thermometer, Users, ChevronDown, Heart,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import fallback from "../data/firstAid.json";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";

const iconMap: Record<string, typeof AlertTriangle> = {
  AlertTriangle, Shield, Thermometer, Users, Heart,
};

const sevColor = { red: "border-l-ph-red", yellow: "border-l-ph-yellow", green: "border-l-ph-green" };

export default function FirstAid() {
  const { t } = useLocale();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <SEO title={t("firstAid.seoTitle")} description={t("firstAid.seoDesc")} path="/first-aid" />
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="ph-section">
          <div>
            <h2>{t("firstAid.title")}</h2>
            <div className="ph-section-accent" />
          </div>
        </div>

        <Card className="border-ph-red/20 bg-ph-red/5 p-4">
          <p className="text-sm font-bold text-ph-red flex items-center gap-2">
            <Heart className="h-4 w-4" />{t("firstAid.printThis")}
          </p>
          <p className="text-xs text-ph-text-muted mt-2">{t("firstAid.source")}</p>
        </Card>

        <div className="space-y-4">
          {(fallback as any[]).map((item) => {
            const Icon = iconMap[item.icon] || AlertTriangle;
            const isOpen = open === item.id;

            return (
              <div key={item.id}
                className={`border bg-white dark:bg-ph-dark-2 border-ph-border-light dark:border-ph-border ${sevColor[item.severity as keyof typeof sevColor] || ""}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-ph-card-hover"
                >
                  <div className={`rounded p-2.5 shrink-0 ${
                    item.severity === "red" ? "bg-ph-red/10" : item.severity === "yellow" ? "bg-ph-yellow/10" : "bg-ph-green/10"
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      item.severity === "red" ? "text-ph-red" : item.severity === "yellow" ? "text-ph-yellow" : "text-ph-green"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{item.title}</h3>
                    <p className="text-xs text-ph-text-muted mt-0.5">{item.symptoms.slice(0, 80)}...</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-ph-text-muted shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-ph-border-light dark:border-ph-border px-4 py-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ph-green mb-2">{t("firstAid.whatToDo")}</h4>
                      <ol className="list-decimal list-inside space-y-1.5">
                        {item.steps.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-ph-text-dark dark:text-ph-text-secondary leading-relaxed">{s}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ph-red mb-2">{t("firstAid.doNot")}</h4>
                      <ul className="space-y-1.5">
                        {item.doNot.map((d: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ph-red">
                            <span className="font-bold shrink-0">✗</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Card className="border-ph-orange/20 bg-ph-orange-muted p-3">
                      <p className="text-xs font-bold text-ph-orange">{t("firstAid.supplies")}</p>
                      <p className="text-xs text-ph-text-dark dark:text-ph-text-secondary mt-0.5">{item.supplies}</p>
                    </Card>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
