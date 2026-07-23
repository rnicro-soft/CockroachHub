import { useState } from "react";
import { AlertTriangle, Send, Shield, MapPin, Clock } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";
import { SEO } from "../components/SEO";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { useLocale } from "../hooks/useLocale";

export default function SOS() {
  const { t } = useLocale();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const { addToQueue } = useOfflineQueue();

  const presets = [
    { type: "safety", label: t("sos.presets.detained.label"), desc: t("sos.presets.detained.desc"), severity: "red" },
    { type: "safety", label: t("sos.presets.policeForce.label"), desc: t("sos.presets.policeForce.desc"), severity: "red" },
    { type: "medical", label: t("sos.presets.medical.label"), desc: t("sos.presets.medical.desc"), severity: "red" },
    { type: "safety", label: t("sos.presets.lost.label"), desc: t("sos.presets.lost.desc"), severity: "yellow" },
  ];

  const sendSOS = async (label: string, type: string, desc: string) => {
    setSending(true);
    const loc = t("sos.locationShared");
    const description = `[SOS] ${desc} — ${new Date().toLocaleTimeString()}`;

    const ok = await addToQueue(type, description, loc);
    if (ok) {
      setSent(label);
      // Attempt GPS update
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            addToQueue("safety",
              `[GPS UPDATE] ${label} — Location: ${pos.coords.latitude},${pos.coords.longitude}`,
              `${pos.coords.latitude},${pos.coords.longitude}`
            );
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    }
    setSending(false);
  };

  return (
      <>
      <SEO title={t("sos.seoTitle")} description={t("sos.seoDesc")} path="/sos" />
<div className="mx-auto max-w-lg space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center bg-ph-red">
          <AlertTriangle className="h-8 w-8 text-white animate-pulse" />
        </div>
        <h1 className="text-xl font-black text-ph-red">{t("sos.title")}</h1>
        <p className="text-sm text-ph-text-muted mt-1">{t("sos.subtitle")}</p>
      </div>

      {sent ? (
        <Card className="border-ph-green/20 bg-ph-green/5 p-6 text-center">
          <p className="text-sm font-bold text-ph-green mb-1">{t("sos.sent")} {sent}</p>
          <p className="text-xs text-ph-text-muted mb-4">{t("sos.sentSubtext")}</p>
          <div className="flex items-center justify-center gap-1 text-xs text-ph-text-muted">
            <MapPin className="h-3 w-3" />{t("sos.locationSharedStatus")}
            <Clock className="h-3 w-3 ml-2" />{new Date().toLocaleTimeString()}
          </div>
          <Button className="mt-4" variant="ghost" onClick={() => setSent(null)}>{t("sos.sendAnother")}</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-ph-text-muted text-center">{t("sos.helperText")}</p>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => sendSOS(p.label, p.type, p.desc)}
              disabled={sending}
              className="w-full text-left bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border hover:border-ph-red/50 transition-colors p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`rounded p-2.5 ${p.severity === "red" ? "bg-ph-red/10" : "bg-ph-yellow/10"}`}>
                  <AlertTriangle className={`h-5 w-5 ${p.severity === "red" ? "text-ph-red" : "text-ph-yellow"}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{p.label}</h3>
                  <p className="text-xs text-ph-text-muted mt-0.5">{p.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
          <div className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
            <p className="font-bold text-ph-text-dark dark:text-white">{t("sos.howWorks")}</p>
            <p className="mt-1">{t("sos.howWorksDesc")}</p>
          </div>
        </div>
      </Card>
    </div>
      </>
);
}