import { useLocale } from "../hooks/useLocale";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Shield, Users, ExternalLink } from "lucide-react";

const demands = [
  { num: 1, key: "1" },
  { num: 2, key: "2" },
  { num: 3, key: "3" },
  { num: 4, key: "4" },
  { num: 5, key: "5" },
];

export default function Manifesto() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <SEO title={t("manifesto.seoTitle")} description={t("manifesto.seoDesc")} path="/manifesto" />

      <div className="ph-section">
        <div>
          <h2>{t("manifesto.title")}</h2>
          <div className="ph-section-accent" />
        </div>
      </div>

      <Card className="border-cjp-maroon/30 bg-cjp-maroon/5 p-5 text-center">
        <Shield className="mx-auto h-8 w-8 text-cjp-maroon mb-2" />
        <h1 className="text-lg font-black text-white mb-1">{t("manifesto.partyTitle")}</h1>
        <p className="text-sm text-ph-text-secondary italic">{t("manifesto.partyDesc")}</p>
        <p className="text-xs text-ph-text-muted mt-2">{t("manifesto.founded")}</p>
      </Card>

      <p className="text-xs text-ph-text-muted text-center">{t("manifesto.subtitle")}</p>

      <div className="space-y-4">
        {demands.map((d) => (
          <Card key={d.num} className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-cjp-maroon text-white font-black text-lg">
                {d.num}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-ph-text-dark dark:text-white mb-1">{t(`manifesto.demands.${d.key}.title`)}</h3>
                <p className="text-sm text-ph-text-secondary">{t(`manifesto.demands.${d.key}.desc`)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
          <div className="text-sm text-ph-text-secondary">
            <p className="font-bold text-white">{t("manifesto.join")}</p>
            <p className="mt-1">{t("manifesto.joinDesc")}</p>
            <div className="flex gap-3 mt-2">
              <a href="https://www.instagram.com/cockroachjantaparty/" target="_blank" rel="noopener noreferrer" className="text-xs text-ph-orange hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />{t("manifesto.socialInstagram")}</a>
              <a href="https://x.com/CJP_2029" target="_blank" rel="noopener noreferrer" className="text-xs text-ph-orange hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />{t("manifesto.socialX")}</a>
              <a href="https://cockroachjantaparty.org" target="_blank" rel="noopener noreferrer" className="text-xs text-ph-orange hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />{t("manifesto.socialSite")}</a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
