import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { Home } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SEO title={t("notFound.seoTitle")} description={t("notFound.seoDesc")} path="/404" />
      <span className="text-6xl font-black text-ph-orange mb-2">404</span>
      <span className="text-4xl mb-4">🪳</span>
      <h1 className="text-xl font-bold text-ph-text-dark dark:text-white mb-2">{t("notFound.title")}</h1>
      <p className="text-sm text-ph-text-muted max-w-md mb-1">{t("notFound.desc")}</p>
      <p className="text-xs text-ph-text-muted mb-6">{t("notFound.desc2")}</p>
      <Link to="/" className="ph-btn-primary">
        <Home className="h-4 w-4" /> {t("notFound.backHome")}
      </Link>
    </div>
  );
}
