import { useEffect, useState } from "react";
import { Clock, ShieldCheck, ShieldX } from "lucide-react";
import { Pagination } from "../../components/ui/Pagination";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";

interface Attempt {
  id: number; email: string; ip_address: string | null; success: boolean; created_at: string;
}

export default function AdminLoginAttempts() {
  const { t } = useLocale();
  const [items, setItems] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);
  const perPage = 30;

  const fetch = () => {
    setLoading(true);
    const f = filter === "success" ? "success" : filter === "fail" ? "fail" : "";
    api.get(`/admin/login-attempts?page=${page}&per_page=${perPage}${f ? `&success=${f === "success"}` : ""}`)
      .then(({ data }) => { setItems(data.items); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page, filter]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.loginAttempts")}</h1>

      <div className="ph-tabs">
        {[
          { key: null, label: t("admin.all") },
          { key: "success", label: t("admin.successful") },
          { key: "fail", label: t("admin.failed") },
        ].map(({ key, label }) => (
          <button key={label} onClick={() => setFilter(key)}
            className={filter === key ? "ph-tab-active" : "ph-tab-inactive"}>{label}</button>
        ))}
      </div>

      {loading ? <div className="space-y-2"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <p className="text-sm text-ph-text-muted py-8 text-center">{t("admin.noData.loginAttempts")}</p>
      : <><div className="space-y-2">{items.map((a) => (
        <div key={a.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-3 flex items-center gap-3 text-sm">
          {a.success ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-ph-green" />
          ) : (
            <ShieldX className="h-4 w-4 shrink-0 text-ph-red" />
          )}
          <div className="flex-1 min-w-0">
            <span className="font-bold text-ph-text-dark dark:text-white">{a.email}</span>
            {a.ip_address && <span className="text-ph-text-muted ml-2 font-mono text-xs">{a.ip_address}</span>}
          </div>
          <span className="text-xs text-ph-text-muted flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />{new Date(a.created_at).toLocaleString()}
          </span>
        </div>
      ))}</div>
      <Pagination page={page} perPage={perPage} total={total} onPageChange={setPage} /></>}
    </div>
  );
}
