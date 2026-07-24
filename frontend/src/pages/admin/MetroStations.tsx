import { useEffect, useState } from "react";
import { Train, Power, PowerOff } from "lucide-react";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface Station { id: string; name: string; lines: { name: string; color: string }[]; interchange: boolean; type: string; area: string; is_active: boolean }

export default function AdminMetroStations() {
  const { t } = useLocale();
  const [items, setItems] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get("/admin/metro/stations")
      .then(({ data }) => setItems(data))
      .catch(() => toast.error(t("common.error")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const toggle = async (id: string, name: string) => {
    try {
      const { data } = await api.patch(`/admin/metro/stations/${id}`);
      setItems((prev) => prev.map((s) => s.id === id ? { ...s, is_active: data.is_active } : s));
      toast.success(`${name}: ${data.is_active ? "active" : "inactive"}`);
    } catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.metroStations")}</h1>

      {loading ? <div className="space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      : <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ph-border-light dark:border-ph-border text-left text-ph-text-muted">
                <th className="pb-2 font-bold">{t("common.name")}</th>
                <th className="pb-2 font-bold">{t("metro.card.area")}</th>
                <th className="pb-2 font-bold">{t("metro.detail.lines")}</th>
                <th className="pb-2 font-bold">{t("metro.detail.type")}</th>
                <th className="pb-2 font-bold">{t("metro.card.interchange")}</th>
                <th className="pb-2 font-bold">{t("admin.status")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-ph-border-light dark:border-ph-border">
                  <td className="py-2 font-bold text-ph-text-dark dark:text-white">{s.name}</td>
                  <td className="py-2 text-ph-text-secondary">{s.area}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {s.lines.map((l) => (
                        <span key={l.name} className="text-[10px] px-1.5 py-0.5 text-white font-bold" style={{ backgroundColor: l.color }}>{l.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-ph-text-muted">{s.type}</td>
                  <td className="py-2">{s.interchange && <span className="text-[10px] px-1.5 py-0.5 border border-ph-orange/40 text-ph-orange font-bold">{t("metro.card.interchange")}</span>}</td>
                  <td className="py-2">
                    <button onClick={() => toggle(s.id, s.name)}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                        s.is_active ? "bg-ph-green/10 text-ph-green" : "bg-ph-red/10 text-ph-red"
                      }`}>
                      {s.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                      {s.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </div>
  );
}
