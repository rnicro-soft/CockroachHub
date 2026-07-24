import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Home, Utensils, Droplets, Heart, ExternalLink, Phone } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

const bgMap: Record<string, string> = {
  "text-ph-orange": "bg-ph-orange/10",
  "text-ph-green": "bg-ph-green/10",
  "text-ph-red": "bg-ph-red/10",
  "text-ph-yellow": "bg-ph-yellow/10",
};

const accommodations = [
  { name: "Hemkunt Foundation", desc: "Food, accommodation, and aid for protesters", contact: "@hemkuntfoundation (Instagram)", type: "aid" },
  { name: "Gurudwara Bangla Sahib", desc: "Free meals (langar) and accommodation available", contact: "Bangla Sahib, Delhi", type: "accommodation" },
  { name: "Gurudwara Rakab Ganj Sahib", desc: "Free meals (langar) and accommodation", contact: "Rakab Ganj, Delhi", type: "accommodation" },
  { name: "Gurudwara Sis Ganj Sahib", desc: "Free meals (langar) and accommodation", contact: "Chandni Chowk, Delhi", type: "accommodation" },
  { name: "Sachkhand Foundation", desc: "On-site volunteers, food, cleaning", contact: "8287007747", type: "aid" },
  { name: "Chatrron ki Goonj", desc: "Volunteer network at protest sites", contact: "8826970690 / 9211452848 / 9827048238", type: "volunteer" },
];

const aidOrgs = [
  { name: "Warriors Without Cause", purpose: "Food, first aid, clean water", contact: "Anusha: 9315917909", type: "medical" },
  { name: "Aashray", purpose: "Drinking water, first aid, community langar", contact: "9815151895 / 9815157865", type: "aid" },
];

export default function Aid() {
  const { t } = useLocale();
  const typeConfig: Record<string, { icon: typeof Home; color: string; label: string }> = {
    accommodation: { icon: Home, color: "text-ph-orange", label: t("aid.types.accommodation") },
    aid: { icon: Utensils, color: "text-ph-green", label: t("aid.types.aid") },
    medical: { icon: Heart, color: "text-ph-red", label: t("aid.types.medicalAid") },
    volunteer: { icon: Droplets, color: "text-ph-yellow", label: t("aid.types.volunteer") },
  };
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("aid.seoTitle")} description={t("aid.seoDesc")} path="/aid" />

      <div className="ph-section">
        <div><h2>{t("aid.title")}</h2><div className="ph-section-accent" /></div>
      </div>

      <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{t("aid.accommodation")}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {accommodations.map((a) => {
          const cfg = typeConfig[a.type] || typeConfig.aid;
          const Icon = cfg.icon;
          return (
            <Card key={a.name} className="p-4 flex items-start gap-3">
              <div className={`rounded p-2 ${bgMap[cfg.color] || "bg-ph-orange/10"} shrink-0`}>
                <Icon className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{a.name}</h4>
                  <Badge>{cfg.label}</Badge>
                </div>
                <p className="text-xs text-ph-text-muted">{a.desc}</p>
                <p className="text-xs text-ph-orange mt-1">{a.contact}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mt-4">{t("aid.onSiteAid")}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {aidOrgs.map((a) => {
          const cfg = typeConfig[a.type] || typeConfig.aid;
          const Icon = cfg.icon;
          return (
            <Card key={a.name} className="p-4 flex items-start gap-3">
              <div className={`rounded p-2 ${bgMap[cfg.color] || "bg-ph-orange/10"} shrink-0`}>
                <Icon className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{a.name}</h4>
                <p className="text-xs text-ph-text-muted">{a.purpose}</p>
                <p className="text-xs text-ph-orange mt-1">{a.contact}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
