import { Shield, Smartphone, Wifi, Lock, Eye, Camera, BatteryCharging, FileText } from "lucide-react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { useLocale } from "../hooks/useLocale";

const sectionIcons: Record<string, any> = {
  phoneSecurity: Smartphone,
  digitalPrivacy: Wifi,
  ifSeized: Lock,
  surveillance: Eye,
};

const sectionIconsName: Record<string, any> = {
  PhoneSecurity: Smartphone,
  DigitalPrivacy: Wifi,
  IfSeized: Lock,
  Surveillance: Eye,
};

export default function Privacy() {
  const { t } = useLocale();
  const sections: { key: string; icon: any }[] = [
    { key: "phoneSecurity", icon: Smartphone },
    { key: "digitalPrivacy", icon: Wifi },
    { key: "ifSeized", icon: Lock },
    { key: "surveillance", icon: Camera },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("privacy.seoTitle")} description={t("privacy.seoDesc")} path="/privacy" />

      <div className="ph-section">
        <div><h2>{t("privacy.title")}</h2><div className="ph-section-accent" /></div>
        <p className="text-sm text-ph-text-muted mt-1">{t("privacy.subtitle")}</p>
      </div>

      {sections.map(({ key, icon: Icon }) => {
        const section = t(`privacy.sections.${key}`) as unknown as { title: string; items: string[] };
        if (!section || !section.items) return null;
        return (
          <Card key={key} className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-ph-text-dark dark:text-white mb-3">
              <Icon className="h-4 w-4 text-ph-orange" /> {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ph-text-secondary">
                  <Shield className="h-4 w-4 text-ph-green shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
        <p className="text-sm text-ph-text-secondary">
          <strong className="text-white">{t("emergency.privacyTitle")}</strong>{' '}
          {t("emergency.privacyDesc")}
        </p>
      </Card>
    </div>
  );
}
