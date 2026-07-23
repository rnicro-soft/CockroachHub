import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Clock, MapPin } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface Detainee { id: number; name: string; phone: string | null; location: string | null; status: string; notes: string | null; created_at: string }

export default function AdminDetainees() {
  const { t } = useLocale();
  const [items, setItems] = useState<Detainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Detainee | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;
  const [form, setForm] = useState({ name: "", phone: "", location: "", status: "detained", notes: "" });

  const fetch = () => {
    setLoading(true);
    api.get(`/admin/detainees?page=${page}&per_page=${perPage}${filter ? `&status=${filter}` : ""}`)
      .then(({ data }) => { setItems(data.items); setTotal(data.total); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { fetch(); }, [page, filter]);

  const openC = () => { setEdit(null); setForm({ name: "", phone: "", location: "", status: "detained", notes: "" }); setModal(true); };
  const openE = (d: Detainee) => { setEdit(d); setForm({ name: d.name, phone: d.phone || "", location: d.location || "", status: d.status, notes: d.notes || "" }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/admin/detainees/${edit.id}`, form); toast.success(t("common.updated")); }
      else { await api.post("/admin/detainees", form); toast.success(t("common.created")); }
      setModal(false); fetch();
    } catch { toast.error(t("common.error")); }
  };

  const del = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try { await api.delete(`/admin/detainees/${id}`); toast.success(t("common.deleted")); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.detaineeTracker")}</h1>
        <Button size="sm" onClick={openC}><Plus className="h-4 w-4" />{t("admin.add")}</Button>
      </div>

      <div className="ph-tabs">
        {["", "detained", "released", "hospitalized", "unknown"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={filter === s ? "ph-tab-active capitalize" : "ph-tab-inactive capitalize"}>{s || t("admin.all")}</button>
        ))}
      </div>

      {loading ? <div className="grid gap-3 sm:grid-cols-2 cv-auto"><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <p className="text-sm text-ph-text-muted py-8 text-center">{t("admin.noData.detainees")}</p>
      : <><div className="grid gap-3 sm:grid-cols-2 cv-auto">{items.map((d) => (
        <div key={d.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{d.name}</h3>
              <span className={d.status === "released" ? "ph-badge-green" : d.status === "hospitalized" ? "ph-badge-yellow" : d.status === "unknown" ? "ph-badge-default" : "ph-badge-red"}>{t("admin.filterDetainee." + d.status)}</span>
            </div>
            {d.phone && <p className="text-xs text-ph-text-muted">{d.phone}</p>}
            {d.location && <p className="text-xs text-ph-text-muted flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{d.location}</p>}
            {d.notes && <p className="text-xs text-ph-text-secondary mt-1">{d.notes}</p>}
            <p className="text-xs text-ph-text-muted mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(d.created_at).toLocaleString()}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button onClick={() => openE(d)} className="p-2 text-ph-text-muted hover:text-ph-text-dark dark:hover:text-white"><Edit3 className="h-4 w-4" /></button>
            <button onClick={() => del(d.id)} className="p-2 text-ph-text-muted hover:text-ph-red"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}</div>
      <Pagination page={page} perPage={perPage} total={total} onPageChange={setPage} /></>}

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? t("admin.editDetainee") : t("admin.addDetainee")}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="ph-label">{t("admin.name")}</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.phoneOpt")}</label><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="ph-input" /></div>
          <div><label className="ph-label">{t("admin.locationOpt")}</label><input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="ph-input" placeholder={t("admin.locationPlaceholder")} /></div>
          <div><label className="ph-label">{t("admin.status")}</label><select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="ph-select"><option value="detained">{t("admin.filterDetainee.detained")}</option><option value="released">{t("admin.filterDetainee.released")}</option><option value="hospitalized">{t("admin.filterDetainee.hospitalized")}</option><option value="unknown">{t("admin.filterDetainee.unknown")}</option></select></div>
          <div><label className="ph-label">{t("admin.notesOpt")}</label><textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="ph-input resize-none" rows={3} /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setModal(false)}>{t("admin.cancel")}</button><Button type="submit">{edit ? t("admin.actions.update") : t("admin.actions.create")}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
