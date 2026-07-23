import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Scale } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";
import type { LegalRight } from "../../types";

export default function AdminRights() {
  const { t } = useLocale();
  const [items, setItems] = useState<LegalRight[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 50;
  const [edit, setEdit] = useState<LegalRight | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "detention", sort_order: 0 });

  const fetch = () => {
    setLoading(true);
    api.get(`/admin/rights?page=${page}&per_page=${perPage}`).then(({ data }) => { setItems(data.items); setTotal(data.total); }).catch(() => toast.error(t("common.error"))).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page]);

  const openC = () => { setEdit(null); setForm({ title: "", content: "", category: "detention", sort_order: 0 }); setModal(true); };
  const openE = (r: LegalRight) => { setEdit(r); setForm({ title: r.title, content: r.content, category: r.category, sort_order: r.sort_order }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/admin/rights/${edit.id}`, form); toast.success(t("common.updated")); }
      else { await api.post("/admin/rights", form); toast.success(t("common.created")); }
      setModal(false); fetch();
    } catch { toast.error(t("common.error")); }
  };

  const del = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try { await api.delete(`/admin/rights/${id}`); toast.success(t("common.deleted")); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.rights")}</h1>
        <Button size="sm" onClick={openC}><Plus className="h-4 w-4" />{t("admin.add")}</Button>
      </div>

      {loading ? <div className="space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <div className="py-16 text-center text-sm text-ph-text-muted">{t("admin.noData.rights")}</div>
      : <><div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 flex items-start gap-4">
              <div className="p-2.5 bg-ph-orange-muted shrink-0"><Scale className="h-5 w-5 text-ph-orange" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{r.title}</h3>
                <p className="text-xs text-ph-text-muted mb-1 capitalize">{r.category} · {t("admin.sortOrder")} {r.sort_order}</p>
                <p className="text-xs text-ph-text-muted line-clamp-2">{r.content.slice(0, 150)}...</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openE(r)} className="p-2 text-ph-text-muted hover:text-ph-text-dark dark:hover:text-white" aria-label={t("admin.editAria").replace("{title}", r.title)}><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => del(r.id)} className="p-2 text-ph-text-muted hover:text-ph-red" aria-label={t("admin.deleteAria").replace("{title}", r.title)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} perPage={perPage} total={total} onPageChange={setPage} />
      </>}

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? t("admin.edit") : t("admin.addLegalRight")}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="ph-label">{t("admin.title")}</label><input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.category")}</label><select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="ph-select"><option value="detention">{t("admin.categories.detention")}</option><option value="search_seizure">{t("admin.categories.searchSeizure")}</option><option value="questioning">{t("admin.categories.questioning")}</option><option value="general">{t("admin.categories.general")}</option></select></div>
          <div><label className="ph-label">{t("admin.sortOrder")}</label><input type="number" value={form.sort_order} onChange={(e) => setForm({...form, sort_order: parseInt(e.target.value) || 0})} className="ph-input" /></div>
          <div><label className="ph-label">{t("admin.content")}</label><textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="ph-input resize-none" rows={8} required /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setModal(false)}>{t("admin.cancel")}</button><Button type="submit">{edit ? t("admin.actions.update") : t("admin.actions.create")}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
