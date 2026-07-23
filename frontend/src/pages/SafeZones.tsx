import { MapPin, Navigation, Shield, Plus } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";

const zones = [
  { name: "Legal Aid Desk — Jantar Mantar", type: "legal", desc: "Pro bono lawyers stationed near main protest entrance", status: "active", coords: "28.6271,77.2174" },
  { name: "Medical Tent — India Gate Lawns", type: "medical", desc: "First aid, ORS, and volunteer doctors. Look for Red Cross flag.", status: "active", coords: "28.6129,77.2295" },
  { name: "Safe House — Central Delhi", type: "safe", desc: "Temporary shelter for protesters. Women and injured prioritized.", status: "active", coords: "28.6268,77.2163" },
  { name: "Hydration Point — Patel Chowk", type: "medical", desc: "Free water, ORS, and glucose. Green and white flags.", status: "active", coords: "28.6265,77.2182" },
  { name: "Lawyer Coordination — Supreme Court", type: "legal", desc: "Legal team coordinating bail and detainee tracking.", status: "active", coords: "28.6226,77.2395" },
  { name: "Metro Station — Central Secretariat", type: "alert", desc: "⚠ Police checkpoints near gate 2. Use gate 4 instead.", status: "caution", coords: "28.6156,77.2131" },
];

const typeColors: Record<string, "green" | "yellow" | "red" | "orange" | "default"> = {
  legal: "default", medical: "green", safe: "orange", alert: "red",
};

export default function SafeZones() {
  const { t } = useLocale();

  return (
    <>
      <SEO title={t("safeZones.seoTitle")} description={t("safeZones.seoDesc")} path="/safe-zones" />
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="ph-section">
          <div>
            <h2>{t("safeZones.title")}</h2>
            <div className="ph-section-accent" />
          </div>
        </div>

        <div className="bg-ph-orange-muted border border-ph-orange/20 p-4">
          <p className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
            {t("safeZones.subtitle")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {zones.map((z) => (
            <a
              key={z.name}
              href={`https://www.google.com/maps/dir/?api=1&destination=${z.coords}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border hover:border-ph-orange/50 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{z.name}</h3>
                  <Badge variant={typeColors[z.type] || "default"}>{z.type}</Badge>
                </div>
                <p className="text-xs text-ph-text-muted mb-3">{z.desc}</p>
                <div className="flex items-center gap-2 text-xs text-ph-orange font-bold">
                  <Navigation className="h-3.5 w-3.5" />{t("safeZones.getDirections")}
                </div>
              </div>
            </a>
          ))}
        </div>

        <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
            <div className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
              <p className="font-bold text-ph-text-dark dark:text-white">{t("safeZones.proTip")}</p>
              <p className="mt-1">{t("safeZones.proTipDesc")}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
