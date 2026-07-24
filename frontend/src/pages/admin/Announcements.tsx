import { useEffect, useState } from "react";
import { Plus, Trash2, Megaphone, Check } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface Announcement {
  id: number;
  message: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncements() {
  const { t } = useLocale();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState("");

  const fetch = () => {
    setLoading(true);
    api.get("/admin/announcements").then(({ data }) => setItems(data)).catch(() => toast.error(t("common.error"))).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    try { await api.post("/admin/announcements", { message: msg }); toast.success(t("common.created")); setModal(false); setMsg(""); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  const toggle = async (id: number) => {
    try { await api.patch(`/admin/announcements/${id}/toggle`); toast.success(t("admin.activated")); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  const del = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try { await api.delete(`/admin/announcements/${id}`); toast.success(t("common.deleted")); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.announcements")}</h1>
        <Button size="sm" onClick={() => setModal(true)}><Plus className="h-4 w-4" />{t("admin.new")}</Button>
      </div>

      {loading ? <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <div className="py-16 text-center text-sm text-ph-text-muted">{t("admin.noData.announcements")}</div>
      : <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 flex items-start gap-4">
              <div className="p-2.5 bg-ph-orange-muted shrink-0"><Megaphone className="h-5 w-5 text-ph-orange" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ph-text-dark dark:text-white">{a.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  {a.is_active && <span className="ph-badge-green"><Check className="h-3 w-3 mr-0.5" />{t("admin.active")}</span>}
                  <span className="text-xs text-ph-text-muted">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                {!a.is_active && (
                  <button onClick={() => toggle(a.id)} className="p-2 text-ph-text-muted hover:text-ph-green" aria-label={t("admin.activate")}><Check className="h-4 w-4" /></button>
                )}
                <button onClick={() => del(a.id)} className="p-2 text-ph-text-muted hover:text-ph-red" aria-label={t("admin.delete")}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      }

      <Modal open={modal} onClose={() => setModal(false)} title={t("admin.newAnnouncement")}>
        <form onSubmit={create} className="space-y-3">
          <div><label className="ph-label">{t("admin.message")}</label>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="ph-input resize-none" rows={3} required placeholder={t("admin.messagePlaceholder")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setModal(false)}>{t("admin.cancel")}</button>
            <Button type="submit">{t("admin.actions.create")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
