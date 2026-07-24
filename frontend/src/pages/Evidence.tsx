import { Camera, Upload, Scale, Stethoscope, Shield } from "lucide-react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { useLocale } from "../hooks/useLocale";

const sectionIcons: Record<string, any> = {
  capture: Camera,
  preserve: Upload,
  legal: Scale,
  medical: Stethoscope,
};

export default function Evidence() {
  const { t } = useLocale();
  const sections: { key: string; icon: any }[] = [
    { key: "capture", icon: Camera },
    { key: "preserve", icon: Upload },
    { key: "legal", icon: Scale },
    { key: "medical", icon: Stethoscope },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("evidence.seoTitle")} description={t("evidence.seoDesc")} path="/evidence" />

      <div className="ph-section">
        <div><h2>{t("evidence.title")}</h2><div className="ph-section-accent" /></div>
        <p className="text-sm text-ph-text-muted mt-1">{t("evidence.subtitle")}</p>
      </div>

      {sections.map(({ key, icon: Icon }) => {
        const section = t(`evidence.sections.${key}`) as unknown as { title: string; items: string[] };
        if (!section || !section.items) return null;
        return (
          <Card key={key} className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-ph-text-dark dark:text-white mb-3">
              <Icon className="h-4 w-4 text-ph-orange" /> {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ph-text-secondary">
                  <Shield className="h-4 w-4 text-ph-red shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
