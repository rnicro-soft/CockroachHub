import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";
import type { FactCheck } from "../../types";

const vb: Record<string, string> = { true: "ph-badge-green", false: "ph-badge-red", misleading: "ph-badge-yellow", unverified: "ph-badge-default" };

export default function AdminFactChecks() {
  const { t } = useLocale();
  const [items, setItems] = useState<FactCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;
  const [edit, setEdit] = useState<FactCheck | null>(null);
  const [form, setForm] = useState({ title: "", claim: "", verdict: "true", explanation: "", source: "" });

  const fetch = () => {
    setLoading(true);
    api.get(`/admin/fact-checks?all=true&page=${page}&per_page=${perPage}`)
      .then(({ data }) => { setItems(data.items); setTotal(data.total); })
      .catch(() => toast.error(t("common.error")))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page]);

  const openC = () => { setEdit(null); setForm({ title: "", claim: "", verdict: "true", explanation: "", source: "" }); setModal(true); };
  const openE = (c: FactCheck) => { setEdit(c); setForm({ title: c.title, claim: c.claim, verdict: c.verdict, explanation: c.explanation, source: c.source || "" }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/admin/fact-checks/${edit.id}`, form); toast.success(t("common.updated")); }
      else { await api.post("/admin/fact-checks", form); toast.success(t("common.created")); }
      setModal(false); fetch();
    } catch { toast.error(t("common.error")); }
  };

  const del = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try { await api.delete(`/admin/fact-checks/${id}`); toast.success(t("common.deleted")); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.factChecks")}</h1>
        <Button size="sm" onClick={openC}><Plus className="h-4 w-4" />{t("admin.new")}</Button>
      </div>

      {loading ? <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <div className="py-16 text-center text-sm text-ph-text-muted">{t("admin.noneYet")}</div>
      : <><div className="grid gap-3 sm:grid-cols-2 cv-auto">
          {items.map((c) => (
            <div key={c.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 flex items-start gap-4">
              <div className="p-2.5 bg-ph-orange-muted shrink-0"><ShieldCheck className="h-5 w-5 text-ph-orange" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{c.title}</h3>
                  <span className={vb[c.verdict]}>{t("factCheck.verdicts." + c.verdict)}</span>
                  {!c.is_published && <span className="ph-badge-default">{t("admin.draft")}</span>}
                </div>
                <p className="text-xs italic text-ph-text-muted mb-1">"{c.claim.slice(0, 80)}..."</p>
                <p className="text-xs text-ph-text-muted">{c.explanation.slice(0, 100)}...</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openE(c)} className="p-2 text-ph-text-muted hover:text-ph-text-dark dark:hover:text-white" aria-label={t("admin.editAria").replace("{title}", c.title)}><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => del(c.id)} className="p-2 text-ph-text-muted hover:text-ph-red" aria-label={t("admin.deleteAria").replace("{title}", c.title)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
          <Pagination page={page} perPage={perPage} total={total} onPageChange={setPage} />
        </>}

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? t("admin.edit") : t("admin.createFactCheck")}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="ph-label">{t("admin.title")}</label><input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.claim")}</label><textarea value={form.claim} onChange={(e) => setForm({...form, claim: e.target.value})} className="ph-input resize-none" rows={2} required /></div>
          <div><label className="ph-label">{t("admin.verdict")}</label><select value={form.verdict} onChange={(e) => setForm({...form, verdict: e.target.value})} className="ph-select"><option value="true">{t("factCheck.verdicts.true")}</option><option value="false">{t("factCheck.verdicts.false")}</option><option value="misleading">{t("factCheck.verdicts.misleading")}</option><option value="unverified">{t("factCheck.verdicts.unverified")}</option></select></div>
          <div><label className="ph-label">{t("admin.explanation")}</label><textarea value={form.explanation} onChange={(e) => setForm({...form, explanation: e.target.value})} className="ph-input resize-none" rows={3} required /></div>
          <div><label className="ph-label">{t("admin.sourceOpt")}</label><input value={form.source} onChange={(e) => setForm({...form, source: e.target.value})} className="ph-input" /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setModal(false)}>{t("admin.cancel")}</button><Button type="submit">{edit ? t("admin.actions.update") : t("admin.actions.create")}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
