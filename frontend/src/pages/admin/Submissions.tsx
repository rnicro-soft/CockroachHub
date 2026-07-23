import { useEffect, useState } from "react";
import { Check, X, Clock, MapPin, Inbox, Send, CheckSquare } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";
import type { Submission } from "../../types";

const tBadge: Record<string, string> = {
  medical: "ph-badge-green", legal: "ph-badge-default", safety: "ph-badge-red", general: "ph-badge-yellow",
};

export default function AdminSubmissions() {
  const { t } = useLocale();
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const perPage = 20;

  const fetch = () => {
    setLoading(true);
    setSelected(new Set());
    api.get(`/admin/submissions?page=${page}&per_page=${perPage}${filter ? `&status_filter=${filter}` : ""}`)
      .then(({ data }) => { setItems(data.items); setTotal(data.total); })
      .catch(() => toast.error(t("common.error")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { fetch(); }, [filter, page]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.filter((s) => s.status === "pending").length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.filter((s) => s.status === "pending").map((s) => s.id)));
    }
  };

  const batchReview = async (status: string) => {
    if (selected.size === 0) { toast.error(t("admin.errors.selectFirst")); return; }
    try {
      const body = Array.from(selected).map((id) => ({ id, status }));
      const { data } = await api.post("/admin/submissions/batch-review", body);
      toast.success(`${data.reviewed} ${t("admin.submissions")} ${status}`);
      fetch();
    } catch { toast.error(t("common.error")); }
  };

  const review = async (id: number, status: string) => {
    try { await api.patch(`/admin/submissions/${id}`, { status, action: status }); toast.success(`${status}!`); fetch(); }
    catch { toast.error(t("common.error")); }
  };

  const publish = async (id: number) => {
    try {
      const { data } = await api.post(`/admin/submissions/${id}/publish`);
      toast.success(t("admin.publishedAsAlert").replace("{id}", data.id));
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("admin.errors.failedToPublish"));
    }
  };

  const pendingItems = items.filter((s) => s.status === "pending");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.submissions")}</h1>
        {filter === "pending" && pendingItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={() => batchReview("approved")} className="ph-btn-primary ph-btn-sm" disabled={selected.size === 0}>
              <Check className="h-3.5 w-3.5" />{t("admin.batchApprove").replace("{count}", String(selected.size))}
            </button>
            <button onClick={() => batchReview("rejected")} className="ph-btn-danger ph-btn-sm" disabled={selected.size === 0}>
              <X className="h-3.5 w-3.5" />{t("admin.batchReject").replace("{count}", String(selected.size))}
            </button>
          </div>
        )}
      </div>

      <div className="ph-tabs">
        {["pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={filter === s ? "ph-tab-active capitalize" : "ph-tab-inactive capitalize"}>{t("admin." + s)}</button>
        ))}
      </div>

      {loading ? <div className="grid gap-3 sm:grid-cols-2 cv-auto"><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? (
        <div className="py-16 text-center">
          <Inbox className="mx-auto h-8 w-8 text-ph-text-muted" />
          <p className="mt-2 text-sm text-ph-text-muted">{t("admin.noData.submissions").replace("{filter}", filter)}</p>
        </div>
      ) : (
        <>
          {filter === "pending" && pendingItems.length > 0 && (
            <button onClick={toggleAll} className="flex items-center gap-2 text-xs font-bold text-ph-text-muted hover:text-ph-orange transition-colors">
              <CheckSquare className="h-4 w-4" />
              {selected.size === pendingItems.length ? t("admin.deselectAll") : t("admin.selectAll") + ` (${pendingItems.length})`}
            </button>
          )}
          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            {items.map((s) => (
              <div key={s.id} className={`bg-white dark:bg-ph-dark-2 border p-4 ${s.status === "pending" && selected.has(s.id) ? "border-ph-orange" : "border-ph-border-light dark:border-ph-border"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {s.status === "pending" && (
                        <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)}
                          className="accent-ph-orange" aria-label={t("admin.selectSubmission").replace("{id}", String(s.id))} />
                      )}
                      <span className={tBadge[s.type] || "ph-badge-default"}>{t("admin.types." + s.type)}</span>
                      <span className={s.status === "approved" ? "ph-badge-green" : s.status === "rejected" ? "ph-badge-red" : "ph-badge-yellow"}>{t("admin." + s.status)}</span>
                    </div>
                    <p className="text-sm text-ph-text-dark dark:text-ph-text-secondary mb-2">{s.description}</p>
                    <div className="flex items-center gap-3 text-xs text-ph-text-muted">
                      {s.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(s.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  {s.status === "pending" && (
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button size="sm" variant="primary" onClick={() => review(s.id, "approved")}><Check className="h-3.5 w-3.5" />{t("admin.approve")}</Button>
                      <Button size="sm" variant="primary" onClick={() => publish(s.id)}><Send className="h-3.5 w-3.5" />{t("admin.publish")}</Button>
                      <Button size="sm" variant="danger" onClick={() => review(s.id, "rejected")}><X className="h-3.5 w-3.5" />{t("admin.reject")}</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} perPage={perPage} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
