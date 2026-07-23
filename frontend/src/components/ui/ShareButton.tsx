import { Share2, Check, MessageCircle, Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale } from "../../hooks/useLocale";

interface ShareButtonProps {
  name: string;
  phone: string;
  whatsapp?: boolean;
}

export function ShareButton({ name, phone, whatsapp = true }: ShareButtonProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const shareText = `🚨 *${name}* — ${phone}\n\nVia CockroachHub — works offline, no data collected.\nhttps://cockroachhub.lol\n\n#MainBhiCockroach #CJP`;

  const handleShare = async () => {
    // WhatsApp deep link (primary share method for Indian users)
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: shareText.replace(/\*/g, "") });
        return;
      } catch {}
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText.replace(/\*/g, ""));
      setCopied(true);
      toast.success(t("share.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy this:", shareText.replace(/\*/g, ""));
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText.replace(/\*/g, ""))}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex gap-1.5">
      <button
        onClick={handleShare}
        className="ph-btn-outline ph-btn-sm flex-1"
        aria-label={t("share.shareAria").replace("{name}", name)}
      >
        {copied ? (
          <><Check className="h-4 w-4" />{t("share.copyLabel")}</>
        ) : (
          <><Share2 className="h-4 w-4" />{t("share.share")}</>
        )}
      </button>
      {whatsapp && (
        <button
          onClick={handleWhatsApp}
          className="ph-btn-primary ph-btn-sm flex-shrink-0"
          aria-label={t("share.whatsappAria").replace("{name}", name)}
          style={{ backgroundColor: "#25D366", border: "none" }}
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
