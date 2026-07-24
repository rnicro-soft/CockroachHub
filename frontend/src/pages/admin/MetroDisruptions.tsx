import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Send } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface Disruption { id: number; station_id: string; status: string; reason: string; source: string; published: boolean; created_at: string }
interface Station { id: string; name: string; lines: { name: string; color: string }[] }

export default function AdminMetroDisruptions() {
  const { t } = useLocale();
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Disruption> & { station_id: string; status: string; reason: string }>({ station_id: "", status: "closed", reason: "" });

  const fetch = () => {
    setLoading(true);
    Promise.all([
      api.get("/admin/metro/stations").then(({ data }) => setStations(data)).catch(() => {}),
      api.get("/admin/metro/disruptions").then(({ data }) => setDisruptions(data.items)).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    try {
      if (editing.id) {
        await api.put(`/admin/metro/disruptions/${editing.id}`, { status: editing.status, reason: editing.reason, published: true });
        toast.success(t("admin.disruptionUpdated"));
      } else {
        await api.post("/admin/metro/disruptions", { ...editing, published: true });
        toast.success(t("admin.disruptionCreated"));
      }
      setEditOpen(false);
      fetch();
    } catch { toast.error(t("common.error")); }
  };

  const remove = async (id: number) => {
    if (!confirm(t("admin.confirmDeleteDisruption"))) return;
    try {
      await api.delete(`/admin/metro/disruptions/${id}`);
      toast.success(t("admin.disruptionDeleted"));
      fetch();
    } catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.metroTitle")}</h1>
        <button onClick={() => { setEditing({ station_id: "", status: "closed", reason: "" }); setEditOpen(true); }}
          className="ph-btn-primary ph-btn-sm"><Plus className="h-4 w-4" />{t("admin.createDisruption")}</button>
      </div>

      {loading ? <p className="text-sm text-ph-text-muted">{t("common.loading")}</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ph-border-light dark:border-ph-border text-left text-ph-text-muted">
                <th className="pb-2 font-bold">{t("common.name")}</th>
                <th className="pb-2 font-bold">{t("admin.status")}</th>
                <th className="pb-2 font-bold">{t("admin.reason")}</th>
                <th className="pb-2 font-bold">{t("admin.source")}</th>
                <th className="pb-2 font-bold">{t("admin.created")}</th>
                <th className="pb-2 font-bold">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {disruptions.map((d) => (
                <tr key={d.id} className="border-b border-ph-border-light dark:border-ph-border">
                  <td className="py-2 font-bold text-ph-text-dark dark:text-white">{stations.find((s) => s.id === d.station_id)?.name || d.station_id}</td>
                  <td className="py-2"><span className={`text-[11px] font-bold px-2 py-0.5 text-white ${d.status === "open" ? "bg-ph-green" : d.status === "limited" ? "bg-ph-yellow" : "bg-ph-red"}`}>{d.status}</span></td>
                  <td className="py-2 text-ph-text-secondary max-w-xs truncate">{d.reason}</td>
                  <td className="py-2 text-ph-text-muted">{d.source}</td>
                  <td className="py-2 text-ph-text-muted text-[11px]">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="py-2">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(d); setEditOpen(true); }} className="p-1 text-ph-text-muted hover:text-ph-orange"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(d.id)} className="p-1 text-ph-text-muted hover:text-ph-red"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {disruptions.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ph-text-muted">{t("admin.noData.submissions").replace("{filter}", "")}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editing.id ? t("admin.editDisruption") : t("admin.createDisruption")}>
        <div className="space-y-3">
          <div>
            <label className="ph-label">{t("common.name")}</label>
            <select value={editing.station_id} onChange={(e) => setEditing({ ...editing, station_id: e.target.value })} className="ph-select">
              <option value="">—</option>
              {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="ph-label">{t("admin.status")}</label>
            <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="ph-select">
              <option value="open">{t("metro.status.open")}</option>
              <option value="limited">{t("metro.status.limited")}</option>
              <option value="closed">{t("metro.status.closed")}</option>
            </select>
          </div>
          <div>
            <label className="ph-label">{t("admin.reason")}</label>
            <textarea value={editing.reason} onChange={(e) => setEditing({ ...editing, reason: e.target.value })} className="ph-input resize-none" rows={3} required />
          </div>
          <button onClick={save} className="ph-btn-primary w-full"><Send className="h-4 w-4" />{editing.id ? t("admin.actions.update") : t("admin.actions.create")}</button>
        </div>
      </Modal>
    </div>
  );
}
