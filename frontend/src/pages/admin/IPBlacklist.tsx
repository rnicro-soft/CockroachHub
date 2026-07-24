import { useEffect, useState } from "react";
import { Plus, Trash2, Ban } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface Entry { id: number; ip_address: string; reason: string | null; created_at: string }

export default function AdminIPBlacklist() {
  const { t } = useLocale();
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");

  const fetch = () => {
    setLoading(true);
    api.get("/admin/ip-blacklist").then(({ data }) => setItems(data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim()) return;
    try { await api.post("/admin/ip-blacklist", { ip_address: ip.trim(), reason: reason.trim() || null }); toast.success(t("admin.ipBlacklisted")); setModal(false); setIp(""); setReason(""); fetch(); }
    catch (err: any) { toast.error(err.response?.data?.detail || t("common.error")); }
  };

  const del = async (id: number) => {
    try { await api.delete(`/admin/ip-blacklist/${id}`); toast.success(t("common.removed")); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.ipBlacklist")}</h1>
        <Button size="sm" onClick={() => setModal(true)}><Plus className="h-4 w-4" />{t("admin.addIP")}</Button>
      </div>

      {loading ? <div className="space-y-2"><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <p className="text-sm text-ph-text-muted py-8 text-center">{t("admin.noData.ipBlacklist")}</p>
      : <div className="space-y-2">{items.map((e) => (
        <div key={e.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ban className="h-4 w-4 text-ph-red shrink-0" />
            <div>
              <p className="text-sm font-bold text-ph-text-dark dark:text-white font-mono">{e.ip_address}</p>
              {e.reason && <p className="text-xs text-ph-text-muted">{e.reason}</p>}
            </div>
          </div>
          <button onClick={() => del(e.id)} className="p-2 text-ph-text-muted hover:text-ph-red" aria-label={t("admin.deleteAria").replace("{title}", e.ip_address)}><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}</div>}

      <Modal open={modal} onClose={() => setModal(false)} title={t("admin.blacklistIP")}>
        <form onSubmit={add} className="space-y-3">
          <div><label className="ph-label">{t("admin.ipAddress")}</label><input value={ip} onChange={(e) => setIp(e.target.value)} className="ph-input" required placeholder={t("admin.ipPlaceholder")} /></div>
          <div><label className="ph-label">{t("admin.reason")}</label><input value={reason} onChange={(e) => setReason(e.target.value)} className="ph-input" placeholder={t("admin.reasonPlaceholder")} /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setModal(false)}>{t("admin.cancel")}</button><Button type="submit">{t("admin.blacklist")}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
