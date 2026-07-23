import { useEffect, useState } from "react";
import { Radio, Inbox, ShieldCheck, Phone, Users, Bell, Send, Megaphone, RefreshCw } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface Stats { active_alerts: number; pending_submissions: number; published_checks: number; total_contacts: number; total_admins: number }
interface ExpandedStats { type_breakdown: Record<string, number>; approval_rate: number; severity: Record<string, number>; push_subscribers: number }

const sc = [
  { key: "active_alerts", label: "stats.activeAlerts", icon: Radio, color: "text-ph-yellow" },
  { key: "pending_submissions", label: "stats.pendingSubmissions", icon: Inbox, color: "text-ph-orange" },
  { key: "published_checks", label: "stats.publishedChecks", icon: ShieldCheck, color: "text-ph-green" },
  { key: "total_contacts", label: "stats.totalContacts", icon: Phone, color: "text-ph-orange" },
  { key: "total_admins", label: "stats.totalAdmins", icon: Users, color: "text-white" },
];

export default function AdminDashboard() {
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);
  const [expanded, setExpanded] = useState<ExpandedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [bcForm, setBcForm] = useState({ type: "general", title: "", description: "", severity: "red", location: "" });
  const [bcBusy, setBcBusy] = useState(false);
  const admin = useAuthStore((s) => s.admin);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats").then(({ data }) => setStats(data)),
      api.get("/admin/expanded-stats").then(({ data }) => setExpanded(data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const broadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBcBusy(true);
    try {
      const { data } = await api.post("/admin/broadcast", bcForm);
      toast.success(t("admin.alertBroadcasted").replace("{alert_id}", data.alert_id).replace("{push_sent}", data.push_sent));
      setBroadcastOpen(false);
      setBcForm({ type: "general", title: "", description: "", severity: "red", location: "" });
    } catch { toast.error(t("common.error")); }
    setBcBusy(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between border-b border-ph-border-light dark:border-ph-border pb-4">
        <div>
          <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.dashboard")}</h1>
          <p className="text-sm text-ph-text-muted mt-0.5">{t("admin.dashboardGreeting")} {admin?.name}</p>
        </div>
        <Button size="sm" onClick={() => setBroadcastOpen(true)}>
          <Megaphone className="h-4 w-4" />{t("admin.emergencyBroadcast")}
        </Button>
      </div>

      {loading ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      : stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sc.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 dark:bg-ph-card"><Icon className={`h-5 w-5 ${color}`} /></div>
                <div><p className="text-2xl font-black text-ph-text-dark dark:text-white">{(stats as any)[key] ?? 0}</p><p className="text-xs font-bold text-ph-text-muted">{t("admin." + label)}</p></div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {expanded && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4">
            <p className="text-xs font-bold text-ph-text-muted uppercase tracking-wider mb-2">{t("admin.approvalRate")}</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-ph-text-dark dark:text-white">{expanded.approval_rate}%</p>
              <p className="text-xs text-ph-text-muted mb-1">{t("admin.ofReviewed")}</p>
            </div>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-ph-card-hover">
              <div className="h-full bg-ph-green transition-all" style={{ width: `${expanded.approval_rate}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4">
            <p className="text-xs font-bold text-ph-text-muted uppercase tracking-wider mb-2">{t("admin.byType")}</p>
            <div className="space-y-2">
              {Object.entries(expanded.type_breakdown).map(([typeKey, c]) => (
                <div key={typeKey} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-ph-text-dark dark:text-white">{typeKey}</span>
                  <span className="font-bold text-ph-text-muted">{c as number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4">
            <p className="text-xs font-bold text-ph-text-muted uppercase tracking-wider mb-2">{t("admin.alertSeverity")}</p>
            <div className="space-y-2">
              {Object.entries(expanded.severity).map(([s, c]) => (
                <div key={s} className="flex items-center justify-between text-sm">
                  <span className="capitalize flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s === "red" ? "bg-ph-red" : s === "yellow" ? "bg-ph-yellow" : "bg-ph-green"}`} />
                    <span className="text-ph-text-dark dark:text-white">{s}</span>
                  </span>
                  <span className="font-bold text-ph-text-muted">{c as number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4">
            <p className="text-xs font-bold text-ph-text-muted uppercase tracking-wider mb-2">{t("admin.pushSubscribers")}</p>
            <div className="flex items-end gap-2">
              <Bell className="h-8 w-8 text-ph-orange" />
              <p className="text-3xl font-black text-ph-text-dark dark:text-white">{expanded.push_subscribers}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-ph-orange-muted border border-ph-orange/20 p-5">
        <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-3">{t("admin.quickActions")}</h3>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/submissions" className="ph-btn-primary ph-btn-sm">{t("admin.reviewSubmissions")}</a>
          <a href="/admin/detainees" className="ph-btn-outline ph-btn-sm">{t("admin.detaineeTracker")}</a>
          <a href="/admin/audit-log" className="ph-btn-outline ph-btn-sm">{t("admin.auditLog")}</a>
          <a href="/admin/ip-blacklist" className="ph-btn-outline ph-btn-sm">{t("admin.ipBlacklist")}</a>
          <button onClick={() => api.post("/admin/sync-helpline").then(() => toast.success(t("admin.synced"))).catch(() => toast.error(t("admin.syncFailed")))} className="ph-btn-outline ph-btn-sm">
            <RefreshCw className="h-3.5 w-3.5" />{t("admin.syncHelpline")}
          </button>
        </div>
      </div>

      <Modal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} title={t("admin.emergencyBroadcast")}>
        <form onSubmit={broadcast} className="space-y-3">
          <p className="text-sm text-ph-red font-bold">{t("admin.broadcastWarning")}</p>
          <div><label className="ph-label">{t("admin.severity")}</label><select value={bcForm.severity} onChange={(e) => setBcForm({...bcForm, severity: e.target.value})} className="ph-select"><option value="red">{t("admin.redUrgent")}</option><option value="yellow">{t("admin.yellowCaution")}</option></select></div>
          <div><label className="ph-label">{t("admin.title")}</label><input value={bcForm.title} onChange={(e) => setBcForm({...bcForm, title: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.description")}</label><textarea value={bcForm.description} onChange={(e) => setBcForm({...bcForm, description: e.target.value})} className="ph-input resize-none" rows={3} required /></div>
          <div><label className="ph-label">{t("admin.type")}</label><select value={bcForm.type} onChange={(e) => setBcForm({...bcForm, type: e.target.value})} className="ph-select"><option value="safety">{t("admin.types.safety")}</option><option value="medical">{t("admin.types.medical")}</option><option value="legal">{t("admin.types.legal")}</option><option value="general">{t("admin.types.general")}</option></select></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setBroadcastOpen(false)}>{t("admin.cancel")}</button><Button type="submit" disabled={bcBusy}>{bcBusy ? t("admin.broadcasting") : t("admin.broadcast")}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
