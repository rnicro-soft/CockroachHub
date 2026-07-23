import { useEffect, useState } from "react";
import { Clock, Shield } from "lucide-react";
import { Pagination } from "../../components/ui/Pagination";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";

interface LogEntry { id: number; admin_id: number; action: string; resource_type: string; resource_id: number | null; details: string | null; ip_address: string | null; created_at: string }

export default function AdminAuditLog() {
  const { t } = useLocale();
  const [items, setItems] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const perPage = 30;

  const fetch = () => {
    setLoading(true);
    let url = `/admin/audit-log?page=${page}&per_page=${perPage}`;
    if (actionFilter) url += `&action=${actionFilter}`;
    api.get(url).then(({ data }) => { setItems(data.items); setTotal(data.total); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { setPage(1); }, [actionFilter]);
  useEffect(() => { fetch(); }, [page, actionFilter]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.auditLog")}</h1>
      <div className="ph-tabs">
        {["", "create", "update", "delete", "review", "publish"].map((a) => (
          <button key={a} onClick={() => setActionFilter(a)}
            className={actionFilter === a ? "ph-tab-active capitalize" : "ph-tab-inactive capitalize"}>{a || t("admin.all")}</button>
        ))}
      </div>
      {loading ? <div className="space-y-2"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      : items.length === 0 ? <p className="text-sm text-ph-text-muted py-8 text-center">{t("admin.noData.auditLog")}</p>
      : <><div className="space-y-2">{items.map((e) => (
        <div key={e.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-3 flex items-start gap-3 text-sm">
          <Shield className="h-4 w-4 mt-0.5 shrink-0 text-ph-text-muted" />
          <div className="flex-1 min-w-0">
            <p><span className="font-bold capitalize">{e.action}</span> {t("admin.on")} <span className="font-semibold">{e.resource_type}</span>{e.resource_id ? ` #${e.resource_id}` : ""}</p>
            {e.details && <p className="text-xs text-ph-text-muted mt-0.5">{e.details}</p>}
            <p className="text-xs text-ph-text-muted mt-0.5 flex items-center gap-2">
              <Clock className="h-3 w-3" />{new Date(e.created_at).toLocaleString()}
              {e.ip_address && <span>IP: {e.ip_address}</span>}
            </p>
          </div>
        </div>
      ))}</div>
      <Pagination page={page} perPage={perPage} total={total} onPageChange={setPage} /></>}
    </div>
  );
}
