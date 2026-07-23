import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";

export default function Torch() {
  const { t } = useLocale();
  const [on, setOn] = useState(false);

  if (on) {
    return (
      <>
      <SEO title={t("torch.seoTitle")} description={t("torch.seoDesc")} path="/torch" />
<div
        className="fixed inset-0 z-50 bg-white cursor-pointer"
        onClick={() => setOn(false)}
        style={{ filter: "brightness(200%)" }}
      >
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <button
            onClick={(e) => { e.stopPropagation(); setOn(false); }}
            className="inline-flex items-center gap-2 bg-black/20 px-6 py-3 text-sm font-bold text-black/60 hover:bg-black/30 transition-colors"
          >
            <Moon className="h-5 w-5" /> {t("torch.turnOff")}
          </button>
        </div>
      </div>
      </>
      );
}

  return (
<div className="flex flex-col items-center justify-center py-20 text-center">
      <Sun className="h-16 w-16 text-ph-orange mb-4" />
      <h1 className="text-xl font-black text-ph-text-dark dark:text-white mb-2">{t("torch.title")}</h1>
      <p className="text-sm text-ph-text-muted mb-6">{t("torch.subtitle")}</p>
      <button
        onClick={() => setOn(true)}
        className="ph-btn-primary text-lg px-10 py-4"
      >
        <Sun className="h-6 w-6" />{t("torch.turnOn")}
      </button>
      <p className="text-xs text-ph-text-muted mt-4">{t("torch.tapAnywhere")}</p>
    </div>
);
}