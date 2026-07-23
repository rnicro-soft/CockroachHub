import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ExternalLink, Instagram, FileText, Shield } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

const sources = [
  { name: "Cockroach Janta Party", link: "https://www.instagram.com/cockroachjantaparty/", desc: "Official CJP page — all on-site protest footage and regular official updates", platform: "Instagram" },
  { name: "PeekTV", link: "https://www.instagram.com/peektv_in/", desc: "News page — all footage of protest violence and credible info", platform: "Instagram" },
  { name: "Faye D'Souza", link: "https://www.instagram.com/fayedsouza/", desc: "Credible news source with on-ground reporting", platform: "Instagram" },
  { name: "The News Pinch", link: "https://www.instagram.com/thenewspinch/", desc: "News page with on-ground visuals and credible reporting", platform: "Instagram" },
  { name: "Indian Express Hindi", link: "https://www.instagram.com/expresshindi/", desc: "Credible news reported with on-ground visuals", platform: "Instagram" },
  { name: "Sarthak Goswami", link: "https://www.instagram.com/sundaysarthak/", desc: "Individual creator sharing protest narrative", platform: "Instagram" },
  { name: "Faizan Siddiqui", link: "https://www.instagram.com/faizansiddiqui56/", desc: "On-site updates on IG stories and posts", platform: "Instagram" },
  { name: "Harsh Yadav", link: "https://www.instagram.com/harshdelhise/", desc: "Individual news page — footage of protest violence", platform: "Instagram" },
  { name: "Tanushree Pandey", link: "https://www.instagram.com/tanushree_pandey/", desc: "Independent journalist — credible information", platform: "Instagram" },
  { name: "Pyaari Delhi", link: "https://www.instagram.com/pyari_delhi1/", desc: "Independent journalism and credible information", platform: "Instagram" },
];

export default function Resources() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("resources.seoTitle")} description={t("resources.seoDesc")} path="/resources" />

      <div className="ph-section">
        <div><h2>{t("resources.title")}</h2><div className="ph-section-accent" /></div>
      </div>

      <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
          <div className="text-sm text-ph-text-secondary">
            <p className="font-bold text-white">{t("resources.trustedSources")}</p>
            <p className="mt-1">{t("resources.trustedSourcesDesc")}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {sources.map((s) => (
          <a key={s.name} href={s.link} target="_blank" rel="noopener noreferrer"
            className="block bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border hover:border-ph-orange/50 transition-colors p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{s.name}</h3>
              <Badge variant="default" className="shrink-0">
                <Instagram className="h-3 w-3 mr-1" />{s.platform}
              </Badge>
            </div>
            <p className="text-xs text-ph-text-muted mb-2">{s.desc}</p>
            <span className="text-xs text-ph-orange font-bold flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />{t("resources.viewOnInstagram")}
            </span>
          </a>
        ))}
      </div>

      <Card className="border-ph-red/20 bg-ph-red/5 p-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ph-red" />
          <div className="text-sm text-ph-text-secondary">
            <p className="font-bold text-ph-red">{t("resources.submitEvidence")}</p>
            <p className="mt-1">{t("resources.submitEvidenceDesc")}</p>
            <a href="https://sites.google.com/view/delhiprotest/home" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-ph-orange font-bold hover:underline mt-1"
            ><ExternalLink className="h-3 w-3" />{t("resources.submitEvidenceForm")}</a>
          </div>
        </div>
      </Card>
    </div>
  );
}
