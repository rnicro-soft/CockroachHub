import { useLocale } from "../hooks/useLocale";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Shield, Instagram, ExternalLink, Twitter, Calendar, Users } from "lucide-react";

export default function About() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <SEO title={t("about.seoTitle")} description={t("about.seoDesc")} path="/about" />

      <div className="ph-section">
        <div>
          <h2>{t("about.title")}</h2>
          <div className="ph-section-accent" />
        </div>
      </div>

      <Card className="border-cjp-maroon/30 bg-cjp-maroon/5 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cjp-maroon shrink-0">
            <span className="text-2xl font-black text-white">CJP</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white">{t("about.partyTitle")}</h1>
            <p className="text-sm text-ph-text-secondary italic">{t("about.partyTagline")}</p>
          </div>
        </div>
        <p className="text-sm text-ph-text-secondary leading-relaxed">{t("about.partyDesc1")}</p>
        <p className="text-sm text-ph-text-secondary leading-relaxed mt-3">{t("about.partyDesc2")}</p>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-ph-orange" /> {t("about.aboutApp")}
        </h3>
        <p className="text-sm text-ph-text-secondary leading-relaxed">{t("about.appDesc")}</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-ph-orange-muted border border-ph-orange/20 p-3 text-center">
            <p className="text-lg font-black text-ph-orange">{t("about.statWorks")}</p>
            <p className="text-xs text-ph-text-muted">{t("about.statOffline")}</p>
          </div>
          <div className="bg-ph-green/10 border border-ph-green/20 p-3 text-center">
            <p className="text-lg font-black text-ph-green">{t("about.statZero")}</p>
            <p className="text-xs text-ph-text-muted">{t("about.statNoData")}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-ph-orange" /> {t("about.followCJP")}
        </h3>
        <div className="space-y-3">
          <a href="https://www.instagram.com/cockroachjantaparty/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-ph-card-hover hover:bg-ph-orange/10 transition-colors">
            <Instagram className="h-5 w-5 text-ph-orange" />
            <span className="flex-1 text-sm font-bold text-ph-text-dark dark:text-white">@cockroachjantaparty</span>
            <ExternalLink className="h-4 w-4 text-ph-text-muted" />
          </a>
          <a href="https://x.com/CJP_2029" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-ph-card-hover hover:bg-ph-orange/10 transition-colors">
            <Twitter className="h-5 w-5 text-ph-orange" />
            <span className="flex-1 text-sm font-bold text-ph-text-dark dark:text-white">@CJP_2029</span>
            <ExternalLink className="h-4 w-4 text-ph-text-muted" />
          </a>
          <a href="https://cockroachjantaparty.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-ph-card-hover hover:bg-ph-orange/10 transition-colors">
            <ExternalLink className="h-5 w-5 text-ph-orange" />
            <span className="flex-1 text-sm font-bold text-ph-text-dark dark:text-white">{t("about.officialWebsite")}</span>
            <ExternalLink className="h-4 w-4 text-ph-text-muted" />
          </a>
        </div>
      </Card>

      <Card className="border-ph-orange/20 bg-ph-orange-muted p-4 text-center text-xs text-ph-text-muted">
        <Calendar className="h-4 w-4 inline-block mb-1" />
        <p>{t("about.footer")}</p>
      </Card>
    </div>
  );
}
