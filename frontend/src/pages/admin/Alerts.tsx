import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Radio } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";
import type { Alert } from "../../types";

export default function AdminAlerts() {
  const { t } = useLocale();
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;
  const [edit, setEdit] = useState<Alert | null>(null);
  const [form, setForm] = useState({ type: "general", title: "", description: "", severity: "yellow", location: "" });

  const fetch = () => {
    setLoading(true);
    api.get(`/admin/alerts?all=true&page=${page}&per_page=${perPage}`)
      .then(({ data }) => { setItems(data.items); setTotal(data.total); })
      .catch(() => toast.error(t("common.error")))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page]);

  const openC = () => { setEdit(null); setForm({ type: "general", title: "", description: "", severity: "yellow", location: "" }); setModal(true); };
  const openE = (a: Alert) => { setEdit(a); setForm({ type: a.type, title: a.title, description: a.description, severity: a.severity, location: a.location || "" }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/admin/alerts/${edit.id}`, form); toast.success(t("common.updated")); }
      else { await api.post("/admin/alerts", form); toast.success(t("common.created")); }
      setModal(false); fetch();
    } catch { toast.error(t("common.error")); }
  };

  const del = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try { await api.delete(`/admin/alerts/${id}`); toast.success(t("common.deleted")); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.alerts")}</h1>
        <Button size="sm" onClick={openC}><Plus className="h-4 w-4" />{t("admin.newAlert")}</Button>
      </div>

      {loading ? <div className="space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <div className="py-16 text-center text-sm text-ph-text-muted">{t("admin.noData.alerts")}</div>
      : <><div className="grid gap-3 sm:grid-cols-2 cv-auto">
          {items.map((a) => (
            <div key={a.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 flex items-start gap-4">
              <div className={`p-2.5 shrink-0 ${a.severity === "red" ? "bg-ph-red/10" : a.severity === "yellow" ? "bg-ph-yellow/10" : "bg-ph-green/10"}`}>
                <Radio className={`h-5 w-5 ${a.severity === "red" ? "text-ph-red" : a.severity === "yellow" ? "text-ph-yellow" : "text-ph-green"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{a.title}</h3>
                  <span className={a.severity === "red" ? "ph-badge-red" : a.severity === "yellow" ? "ph-badge-yellow" : "ph-badge-green"}>{a.severity}</span>
                  {!a.is_active && <span className="ph-badge-default">{t("admin.inactive")}</span>}
                </div>
                <p className="text-xs text-ph-text-muted mb-1">{a.description}</p>
                {a.location && <p className="text-xs text-ph-text-muted">{a.location}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openE(a)} className="p-2 text-ph-text-muted hover:text-ph-text-dark dark:hover:text-white" aria-label={t("admin.editAria").replace("{title}", a.title)}><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => del(a.id)} className="p-2 text-ph-text-muted hover:text-ph-red" aria-label={t("admin.deleteAria").replace("{title}", a.title)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
          <Pagination page={page} perPage={perPage} total={total} onPageChange={setPage} />
        </>}

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? t("admin.editAlert") : t("admin.createAlert")}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="ph-label">{t("admin.type")}</label><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="ph-select"><option value="medical">{t("admin.types.medical")}</option><option value="legal">{t("admin.types.legal")}</option><option value="safety">{t("admin.types.safety")}</option><option value="general">{t("admin.types.general")}</option></select></div>
          <div><label className="ph-label">{t("admin.severity")}</label><select value={form.severity} onChange={(e) => setForm({...form, severity: e.target.value})} className="ph-select"><option value="green">{t("admin.severityLevels.clear")}</option><option value="yellow">{t("admin.severityLevels.caution")}</option><option value="red">{t("admin.severityLevels.active")}</option></select></div>
          <div><label className="ph-label">{t("admin.title")}</label><input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.description")}</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="ph-input resize-none" rows={3} required /></div>
          <div><label className="ph-label">{t("admin.locationOpt")}</label><input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="ph-input" /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setModal(false)}>{t("admin.cancel")}</button><Button type="submit">{edit ? t("admin.actions.update") : t("admin.actions.create")}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
