import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Phone } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";
import type { EmergencyContact } from "../../types";

export default function AdminContacts() {
  const { t } = useLocale();
  const [items, setItems] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 50;
  const [edit, setEdit] = useState<EmergencyContact | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", category: "legal", description: "", city: "" });

  const fetch = () => {
    setLoading(true);
    api.get(`/admin/contacts?page=${page}&per_page=${perPage}`).then(({ data }) => { setItems(data.items); setTotal(data.total); }).catch(() => toast.error(t("common.error"))).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page]);

  const openC = () => { setEdit(null); setForm({ name: "", phone: "", category: "legal", description: "", city: "" }); setModal(true); };
  const openE = (c: EmergencyContact) => { setEdit(c); setForm({ name: c.name, phone: c.phone, category: c.category, description: c.description || "", city: c.city || "" }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/admin/contacts/${edit.id}`, form); toast.success(t("common.updated")); }
      else { await api.post("/admin/contacts", form); toast.success(t("common.created")); }
      setModal(false); fetch();
    } catch { toast.error(t("common.error")); }
  };

  const del = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try { await api.delete(`/admin/contacts/${id}`); toast.success(t("common.deleted")); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.contacts")}</h1>
        <Button size="sm" onClick={openC}><Plus className="h-4 w-4" />{t("admin.add")}</Button>
      </div>

      {loading ? <div className="grid gap-3 sm:grid-cols-2 cv-auto"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <div className="py-16 text-center text-sm text-ph-text-muted">{t("admin.noData.contacts")}</div>
      : <><div className="grid gap-3 sm:grid-cols-2 cv-auto">
          {items.map((c) => (
            <div key={c.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 flex items-start gap-4">
              <div className="p-2.5 bg-ph-orange-muted shrink-0"><Phone className="h-5 w-5 text-ph-orange" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{c.name}</h3>
                  <span className="ph-badge-default">{c.category}</span>
                  {c.is_verified && <span className="ph-badge-green">{t("emergency.verified")}</span>}
                </div>
                <p className="text-sm font-bold text-ph-orange mb-1">{c.phone}</p>
                {c.description && <p className="text-xs text-ph-text-muted">{c.description}</p>}
                {c.city && <p className="text-xs text-ph-text-muted">{c.city}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openE(c)} className="p-2 text-ph-text-muted hover:text-ph-text-dark dark:hover:text-white" aria-label={t("admin.editAria").replace("{title}", c.name)}><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => del(c.id)} className="p-2 text-ph-text-muted hover:text-ph-red" aria-label={t("admin.deleteAria").replace("{title}", c.name)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} perPage={perPage} total={total} onPageChange={setPage} />
      </>}

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? t("admin.edit") : t("admin.addContact")}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="ph-label">{t("admin.name")}</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.phone")}</label><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.category")}</label><select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="ph-select"><option value="legal">{t("admin.categories.legal")}</option><option value="medical">{t("admin.categories.medical")}</option><option value="helpline">{t("admin.categories.helpline")}</option><option value="safe_house">{t("admin.categories.safeHouse")}</option></select></div>
          <div><label className="ph-label">{t("admin.descriptionOpt")}</label><input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="ph-input" /></div>
          <div><label className="ph-label">{t("admin.cityOpt")}</label><input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="ph-input" /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setModal(false)}>{t("admin.cancel")}</button><Button type="submit">{edit ? t("admin.actions.update") : t("admin.actions.create")}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
