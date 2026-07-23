import { useState } from "react";
import { Send, Shield, CheckCircle, WifiOff } from "lucide-react";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";
import { SEO } from "../components/SEO";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { useLocale } from "../hooks/useLocale";

const types = ["medical", "legal", "safety", "general"];

export default function SubmitReport() {
  const { t } = useLocale();
  const [type, setType] = useState("general");
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const { addToQueue } = useOfflineQueue();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) { toast.error(t("submit.validationError")); return; }
    setBusy(true);
    const ok = await addToQueue(type, desc.trim(), loc.trim() || undefined);
    if (ok) {
      setDone(true);
      setDesc(""); setLoc("");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <>
        <SEO title={t("submit.seoTitle")} description={t("submit.seoDesc")} path="/submit" />
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
          <CheckCircle className="h-14 w-14 text-ph-green" />
          <h2 className="mt-4 text-lg font-bold text-ph-text-dark dark:text-white">{t("submit.success")}</h2>
          <p className="mt-1 text-sm text-ph-text-muted">{t("submit.success")}</p>
          <Button className="mt-6" onClick={() => setDone(false)}>{t("submit.submitAnother")}</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={t("submit.seoTitle")} description={t("submit.seoDesc")} path="/submit" />
      <div className="mx-auto max-w-lg space-y-5">
        <div className="ph-section">
          <div>
            <h2>{t("submit.title")}</h2>
            <div className="ph-section-accent" />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="ph-label">{t("submit.type")}</label>
            <div className="ph-tabs">
              {types.map((value) => (
                <button key={value} type="button" onClick={() => setType(value)}
                  className={type === value ? "ph-tab-active" : "ph-tab-inactive"}
                >{t("submit.types." + value)}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="ph-label" htmlFor="desc">{t("submit.description")}</label>
            <textarea id="desc" value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder={t("submit.descriptionPlaceholder")} rows={5} className="ph-input resize-none" required />
          </div>
          <div>
            <label className="ph-label" htmlFor="loc">{t("submit.location")}</label>
            <input id="loc" value={loc} onChange={(e) => setLoc(e.target.value)}
              placeholder={t("submit.locationPlaceholder")} className="ph-input" />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? t("submit.sending") : <><Send className="h-4 w-4" /> {t("submit.send")}</>}
          </Button>
        </form>

        <div className="bg-ph-orange-muted border border-ph-orange/20 px-5 py-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
            <div className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
              <p className="font-bold text-ph-text-dark dark:text-white">{t("submit.privacyTitle")}</p>
              <p className="mt-1">{t("submit.privacyDesc")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
