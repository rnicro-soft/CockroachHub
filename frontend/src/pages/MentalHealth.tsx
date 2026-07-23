import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Heart, Phone, Mail, ExternalLink } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

// Online providers from helpline.md
const onlineProviders = [
  { name: "Aditi Pandey", contact: "ap.work.psych@gmail.com", type: "email", details: "Counselling Psychologist", location: "Lucknow/Delhi" },
  { name: "Anvitha Satheesh", contact: "thethirdspace1507@gmail.com", type: "email", details: "Counselling Psychologist", location: "Online" },
  { name: "Maria Senora", contact: "maria.senora1997@gmail.com", type: "email", details: "Counselling Psychologist", location: "Online" },
  { name: "Batul M", contact: "7850810877 (WhatsApp)", type: "phone", details: "WhatsApp counselling", location: "Online" },
  { name: "Sonali Dayal", contact: "thriversweb@gmail.com", type: "email", details: "Counselling Psychologist", location: "Online" },
  { name: "Simran Gera", contact: "simrangera02@gmail.com", type: "email", details: "CBT, Trauma-informed therapy", location: "Online" },
  { name: "Jayeesha Taneja", contact: "firgunmentalhealth@gmail.com", type: "email", details: "Queer & neurodivergence affirmative", location: "Online" },
  { name: "Nivritti Counselling", contact: "8446043977", type: "phone", details: "DM/WhatsApp @nivritticounselling", location: "Online" },
];

const offlineProviders = [
  { name: "Agatsu Foundation", contact: "9004489010 / contact@agatsufoundation.org", details: "Community center & clinic. 51 Pali Village, Bandra (W), Mumbai", location: "Mumbai" },
];

const supportGroups = [
  { name: "Citta India", contact: "Online Support Group", link: "https://form.jotform.com/262005484062046", details: "Online support group — register via form" },
  { name: "Vyakta Space", contact: "vyaktaspace@gmail.com", link: "", details: "Online support space" },
];

export default function MentalHealth() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("mentalHealth.seoTitle")} description={t("mentalHealth.seoDesc")} path="/mental-health" />

      <div className="ph-section">
        <div><h2>{t("mentalHealth.title")}</h2><div className="ph-section-accent" /></div>
      </div>

      <Card className="border-ph-green/20 bg-ph-green/5 p-4">
        <div className="flex items-start gap-3">
          <Heart className="mt-0.5 h-5 w-5 shrink-0 text-ph-green" />
          <div className="text-sm text-ph-text-secondary">
            <p className="font-bold text-white">{t("mentalHealth.youAreNotAlone")}</p>
            <p className="mt-1">{t("mentalHealth.protestingIsHeavy")}</p>
          </div>
        </div>
      </Card>

      <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{t("mentalHealth.onlineCounsellors")}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {onlineProviders.map((p) => (
          <Card key={p.name} className="p-4">
            <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{p.name}</h4>
            <p className="text-xs text-ph-text-muted mt-0.5">{p.details}</p>
            <div className="flex items-center gap-2 mt-2">
              {p.type === "email" ? (
                <a href={`mailto:${p.contact}`} className="text-xs text-ph-orange hover:underline flex items-center gap-1"><Mail className="h-3 w-3" />{p.contact}</a>
              ) : (
                <a href={`tel:${p.contact.replace(/\D/g, "")}`} className="text-xs text-ph-orange hover:underline flex items-center gap-1"><Phone className="h-3 w-3" />{p.contact}</a>
              )}
            </div>
            <Badge variant="green" className="mt-2">{p.location}</Badge>
          </Card>
        ))}
      </div>

      <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mt-4">{t("mentalHealth.offlineClinics")}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {offlineProviders.map((p) => (
          <Card key={p.name} className="p-4">
            <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{p.name}</h4>
            <p className="text-xs text-ph-text-muted mt-0.5">{p.details}</p>
            <p className="text-xs text-ph-orange mt-1">{p.contact}</p>
            <Badge variant="default" className="mt-2">{p.location}</Badge>
          </Card>
        ))}
      </div>

      <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{t("mentalHealth.supportGroups")}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {supportGroups.map((g) => (
          <Card key={g.name} className="p-4">
            <h4 className="text-sm font-bold text-ph-text-dark dark:text-white">{g.name}</h4>
            <p className="text-xs text-ph-text-muted mt-0.5">{g.details}</p>
            {g.link && <a href={g.link} target="_blank" rel="noopener noreferrer" className="text-xs text-ph-orange hover:underline flex items-center gap-1 mt-1"><ExternalLink className="h-3 w-3" />{t("mentalHealth.register")}</a>}
          </Card>
        ))}
      </div>
    </div>
  );
}
