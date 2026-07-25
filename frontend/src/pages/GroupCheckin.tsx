import { useState, useCallback } from "react";
import { Users, Share2, MapPin, Shield, AlertTriangle, Send, RefreshCw, ExternalLink, Copy, Check } from "lucide-react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import toast from "react-hot-toast";

interface Member { id: number; member_name: string; lat: number | null; lng: number | null; status: string; created_at: string; updated_at: string }

export default function GroupCheckin() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [step, setStep] = useState<"create" | "join" | "group">("create");
  const [groupCode, setGroupCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [myStatus, setMyStatus] = useState("safe");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createGroup = async () => {
    if (!memberName.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/group/create", { member_name: memberName.trim() });
      setGroupCode(data.group_code);
      setMembers([data.member]);
      setStep("group");
      toast.success(t("group.checkedInSafe"));
    } catch { toast.error(t("common.error")); }
    setLoading(false);
  };

  const joinGroup = async () => {
    if (!groupCode.trim() || !memberName.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/group/join", { group_code: groupCode.trim().toUpperCase(), member_name: memberName.trim() });
      setMembers([data.member]);
      setStep("group");
      toast.success(t("group.checkedInSafe"));
      fetchMembers();
    } catch { toast.error(t("common.error")); }
    setLoading(false);
  };

  const checkin = async (status: string) => {
    if (!online) return;
    const prevStatus = myStatus;
    setMyStatus(status);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })).catch(() => null);
      if (!pos) toast(t("group.gpsWarning"), { icon: "⚠️" });
      await api.post("/group/checkin", {
        group_code: groupCode, member_name: memberName,
        lat: pos?.coords.latitude ?? null, lng: pos?.coords.longitude ?? null, status,
      });
      toast.success(status === "safe" ? t("group.checkedInSafe") : t("group.helpAlertSent"));
      fetchMembers();
    } catch { setMyStatus(prevStatus); toast.error(t("common.error")); }
  };

  const fetchMembers = useCallback(async () => {
    if (!groupCode) return;
    try {
      const { data } = await api.get(`/group/${groupCode}`);
      setMembers(data.members);
    } catch {}
  }, [groupCode]);

  const copyCode = () => {
    navigator.clipboard.writeText(groupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = (s: string) => s === "safe" ? "bg-ph-green" : s === "help" ? "bg-ph-red" : "bg-ph-yellow";
  const statusIcon = (s: string) => {
    switch (s) {
      case "safe": return <Shield className="h-4 w-4 text-ph-green" />;
      case "help": return <AlertTriangle className="h-4 w-4 text-ph-red" />;
      default: return <Users className="h-4 w-4 text-ph-yellow" />;
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SEO title={t("group.seoTitle")} description={t("group.seoDesc")} path="/group" />

      <div className="ph-section">
        <div><h2>{t("group.title")}</h2><div className="ph-section-accent" /></div>
        <p className="text-sm text-ph-text-muted">{t("group.subtitle")}</p>
      </div>

      {step === "create" || step === "join" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-1 flex items-center gap-2"><Users className="h-4 w-4 text-ph-orange" /> {t("group.createTitle")}</h3>
            <p className="text-xs text-ph-text-muted mb-3">{t("group.createDesc")}</p>
            <input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder={t("group.yourName")} className="ph-input mb-2" maxLength={50} />
            <button onClick={createGroup} disabled={loading || !memberName.trim()} className="ph-btn-primary w-full">{t("group.createBtn")}</button>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-1 flex items-center gap-2"><Share2 className="h-4 w-4 text-ph-orange" /> {t("group.joinTitle")}</h3>
            <p className="text-xs text-ph-text-muted mb-3">{t("group.joinDesc")}</p>
            <input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder={t("group.yourName")} className="ph-input mb-2" maxLength={50} />
            <input value={groupCode} onChange={e => setGroupCode(e.target.value.toUpperCase())} placeholder={t("group.groupCode")} className="ph-input mb-2 font-mono tracking-widest uppercase" maxLength={6} />
            <button onClick={joinGroup} disabled={loading || !groupCode.trim() || !memberName.trim()} className="ph-btn-primary w-full">{t("group.joinBtn")}</button>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Group header */}
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-ph-text-muted">{t("group.groupCodeLabel")}</p>
              <p className="text-lg font-black tracking-widest text-ph-orange font-mono">{groupCode}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyCode} className="ph-btn-outline ph-btn-sm text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-ph-green" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? t("group.copied") : t("group.copy")}
              </button>
              <button onClick={fetchMembers} className="ph-btn-outline ph-btn-sm text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> {t("group.refresh")}
              </button>
            </div>
          </Card>

          {/* My check-in */}
          <Card className="p-4">
            <p className="text-xs text-ph-text-muted mb-2">{t("group.yourStatus")}</p>
            <div className="flex gap-2">
              <button onClick={() => checkin("safe")} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-2 ${myStatus === "safe" ? "border-ph-green bg-ph-green/10 text-ph-green" : "border-ph-border text-ph-text-muted"}`}>
                <Shield className="h-5 w-5" /> {t("group.safe")}
              </button>
              <button onClick={() => checkin("help")} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-2 ${myStatus === "help" ? "border-ph-red bg-ph-red/10 text-ph-red" : "border-ph-border text-ph-text-muted"}`}>
                <AlertTriangle className="h-5 w-5" /> {t("group.needHelp")}
              </button>
            </div>
          </Card>

          {/* Members list */}
          <Card className="p-4">
            <p className="text-xs font-bold text-ph-text-muted uppercase tracking-wider mb-3">{t("group.members")} ({members.length})</p>
            {members.length === 0 && <p className="text-sm text-ph-text-muted">{t("group.noMembers")}</p>}
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2 bg-ph-dark/30">
                  {statusIcon(m.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ph-text-dark dark:text-white">{m.member_name}</p>
                    <p className="text-[10px] text-ph-text-muted">
                      {m.status === "safe" ? t("group.safe") : m.status === "help" ? t("group.needsHelp") : t("group.unknown")}
                      {m.lat && m.lng && <a href={`https://www.google.com/maps?q=${m.lat},${m.lng}`} target="_blank" rel="noopener noreferrer" className="text-ph-orange ml-2 hover:underline inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {t("group.map")}</a>}
                    </p>
                  </div>
                  <span className="text-[10px] text-ph-text-muted shrink-0">{new Date(m.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
