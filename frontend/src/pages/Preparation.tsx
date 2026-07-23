import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Shield, Download, MapPin, WifiOff, Users, Camera, ClipboardList } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

const beforeItems = [
  { icon: MapPin, label: "Download Offline Google Maps", desc: "Save Delhi/NCR map to your phone for navigation during internet shutdown" },
  { icon: WifiOff, label: "Install Briar or BitChat", desc: "Uses Bluetooth to communicate when internet is cut. Works mesh-network style." },
  { icon: MapPin, label: "Memorize an exit location", desc: "Know a safe exit route and meetup point in case of emergency" },
  { icon: ClipboardList, label: "Write contacts on your arm", desc: "Use permanent marker: 2 lawyer numbers, 1 family contact, 1 medical contact" },
  { icon: Camera, label: "Enable auto cloud backup", desc: "Set phone photos/videos to auto-upload so evidence is saved even if phone is seized" },
  { icon: Users, label: "Go with a buddy or group", desc: "Never protest alone — ensure someone knows your location at all times" },
  { icon: Download, label: "Download Solidarity Kit", desc: "Works offline and auto-updates when internet returns — protest.uskhokhar.xyz" },
  { icon: Shield, label: "Carry ID and bail money", desc: "Aadhaar/Voter ID + ₹10,000-20,000 cash minimum for bail" },
];

const afterItems = [
  "Take care of any immediate medical needs — refer to First Aid and Medical contacts",
  "Account for everyone you attended with. Leave no one behind.",
  "Download all videos, photos, and voice recordings for legal evidence",
  "Store backup copies in cloud storage immediately",
  "Contact a lawyer if anyone was detained",
  "Rest, hydrate, eat — your health comes first",
];

export default function Preparation() {
  const { t } = useLocale();
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
        {beforeItems.map((item) => (
          <Card key={item.label} className="p-4 flex items-start gap-3">
            <div className="rounded p-2 bg-ph-orange/10 shrink-0"><item.icon className="h-5 w-5 text-ph-orange" /></div>
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
        {afterItems.map((item, i) => (
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
