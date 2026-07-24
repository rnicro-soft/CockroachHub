import { useState, useEffect, useMemo } from "react";
import { Search, X, MapPin, Train, AlertTriangle, Circle, Send, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";

import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import stationsData from "../data/metroStations.json";

interface Line { name: string; color: string }
interface Station { id: string; name: string; lines: Line[]; interchange: boolean; type: string; area: string; alternatives: string[]; lat: number; lng: number }
interface Disruption { station_id: string; status: string; reason: string; created_at: string }

const lineNames = ["Blue", "Yellow", "Red", "Violet", "Pink", "Magenta", "Green", "Airport Express"];

export default function Metro() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [stations, setStations] = useState<Station[]>(() => stationsData as Station[]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Station | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState("closed");
  const [reportReason, setReportReason] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [detailDisruption, setDetailDisruption] = useState<Disruption | null>(null);

  useEffect(() => {
    if (!online) return;
    Promise.all([
      api.get("/metro/stations").then(({ data }) => setStations(data)).catch(() => {}),
      api.get("/metro/disruptions").then(({ data }) => setDisruptions(data)).catch(() => {}),
    ]);
  }, [online]);

  const disruptionMap = useMemo(() => {
    const m = new Map<string, Disruption>();
    for (const d of disruptions) m.set(d.station_id, d);
    return m;
  }, [disruptions]);

  const filtered = useMemo(() => {
    let s = stations;
    if (search) {
      const q = search.toLowerCase();
      s = s.filter((st) => st.name.toLowerCase().includes(q) || st.area.toLowerCase().includes(q));
    }
    if (lineFilter) s = s.filter((st) => st.lines.some((l) => l.name === lineFilter));
    return s;
  }, [stations, search, lineFilter]);

  const statusColor = (status: string) =>
    status === "open" ? "bg-ph-green" : status === "limited" ? "bg-ph-yellow" : "bg-ph-red";
  const statusText = (status: string) => t(`metro.status.${status}`);
  const statusDesc = (status: string) => t(`metro.statusDesc.${status}`);

  const handleSelect = (station: Station) => {
    setSelected(station);
    setDetailDisruption(disruptionMap.get(station.id) || null);
  };

  const handleReport = async () => {
    if (!selected || !reportReason) return;
    setReportBusy(true);
    try {
      await api.post("/metro/submit", { station_id: selected.id, status: reportStatus, reason: reportReason });
      toast.success(t("metro.reportSuccess"));
      setReportOpen(false);
      setReportReason("");
    } catch { toast.error(t("common.error")); }
    setReportBusy(false);
  };

  const lineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of stations) for (const l of s.lines) counts[l.name] = (counts[l.name] || 0) + 1;
    return counts;
  }, [stations]);

  const totalInterchanges = stations.filter((s) => s.interchange).length;
  const activeDisruptions = disruptions.filter((d) => d.status !== "open").length;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <SEO title={t("metro.seoTitle")} description={t("metro.seoDesc")} path="/metro" />

      <div className="ph-section">
        <div><h2>{t("metro.title")}</h2><div className="ph-section-accent" /></div>
        <p className="text-sm text-ph-text-muted mt-1">{t("metro.subtitle")}</p>
      </div>

      {!online && (
        <div className="bg-ph-orange-muted border border-ph-orange/20 px-4 py-2 text-sm text-ph-text-secondary">{t("metro.offlineData")}</div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ph-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t("metro.searchPlaceholder")}
            className="ph-input pl-10 w-full" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ph-text-muted hover:text-white"><X className="h-4 w-4" /></button>}
        </div>
        <button onClick={() => setLineFilter(null)}
          className={`ph-btn-sm ${!lineFilter ? "ph-btn-primary" : "ph-btn-outline"}`}>{t("metro.filterAll")}</button>
        {lineNames.map((name) => (
          <button key={name} onClick={() => setLineFilter(lineFilter === name ? null : name)}
            className={`ph-btn-sm ${lineFilter === name ? "ph-btn-primary" : "ph-btn-outline"}`}>{name}</button>
        ))}
      </div>

      {/* Network Overview */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-3">{t("metro.networkOverview")}</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div><span className="font-bold text-white">{stations.length}</span> <span className="text-ph-text-muted">{t("metro.totalStations")}</span></div>
          <div><span className="font-bold text-ph-red">{activeDisruptions}</span> <span className="text-ph-text-muted">{t("metro.activeDisruptions")}</span></div>
          <div><span className="font-bold text-white">{totalInterchanges}</span> <span className="text-ph-text-muted">{t("metro.interchanges")}</span></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(lineCounts).map(([name, count]) => {
            const color = stations.find((s) => s.lines.some((l) => l.name === name))?.lines.find((l) => l.name === name)?.color || "#888";
            return <span key={name} className="text-[11px] flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />{name} ({count})</span>;
          })}
        </div>
      </Card>

      {/* Station grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((station) => {
          const d = disruptionMap.get(station.id);
          const status = d?.status || "open";
          return (
            <button key={station.id} onClick={() => handleSelect(station)}
              className="text-left bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 hover:border-ph-orange/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-ph-text-dark dark:text-white truncate">{station.name}</h4>
                  <p className="text-xs text-ph-text-muted">{station.area}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 text-white ${statusColor(status)}`}>
                  {statusText(status)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {station.lines.map((l) => (
                  <span key={l.name} className="text-[10px] px-1.5 py-0.5 text-white font-bold" style={{ backgroundColor: l.color }}>
                    {l.name}
                  </span>
                ))}
                {station.interchange && <span className="text-[10px] px-1.5 py-0.5 border border-ph-orange/40 text-ph-orange font-bold">{t("metro.card.interchange")}</span>}
              </div>
              {d && d.status !== "open" && (
                <p className="text-[11px] text-ph-text-muted mt-2 line-clamp-1">{d.reason}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ""}>
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 text-white ${statusColor(detailDisruption?.status || "open")}`}>
                {statusText(detailDisruption?.status || "open")}
              </span>
              <span className="text-[11px] text-ph-text-muted">{statusDesc(detailDisruption?.status || "open")}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-ph-text-muted">{t("metro.card.area")}</span><p className="text-white font-bold">{selected.area}</p></div>
              <div><span className="text-ph-text-muted">{t("metro.detail.type")}</span><p className="text-white font-bold">{selected.type}</p></div>
            </div>

            <div>
              <span className="text-sm text-ph-text-muted">{t("metro.detail.lines")}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selected.lines.map((l) => (
                  <span key={l.name} className="text-[11px] px-2 py-0.5 text-white font-bold" style={{ backgroundColor: l.color }}>{l.name}</span>
                ))}
              </div>
            </div>

            {selected.alternatives.length > 0 && (
              <div>
                <span className="text-sm text-ph-text-muted">{t("metro.card.alternatives")}</span>
                <p className="text-sm text-white font-bold">{selected.alternatives.join(", ")}</p>
              </div>
            )}

            {detailDisruption && (
              <>
                <div className="border-t border-ph-border-light dark:border-ph-border pt-2">
                  <span className="text-sm text-ph-text-muted">{t("metro.detail.reason")}</span>
                  <p className="text-sm text-white">{detailDisruption.reason}</p>
                </div>
                <div className="text-xs text-ph-text-muted">
                  {t("metro.detail.lastUpdated")}: {new Date(detailDisruption.created_at).toLocaleString()}
                </div>
              </>
            )}

            <button onClick={() => { setReportOpen(true); }} className="ph-btn-outline w-full mt-2">
              <AlertTriangle className="h-4 w-4" /> {t("metro.reportDisruption")}
            </button>
          </div>
        )}
      </Modal>

      {/* Report modal */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title={t("metro.reportTitle")}>
        <div className="space-y-3">
          <p className="text-sm text-ph-text-secondary">{t("metro.reportDesc")}</p>
          <div>
            <label className="ph-label">{t("admin.severity")}</label>
            <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="ph-select">
              <option value="closed">{t("metro.status.closed")}</option>
              <option value="limited">{t("metro.status.limited")}</option>
            </select>
          </div>
          <div>
            <label className="ph-label">{t("metro.reportReason")}</label>
            <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)}
              placeholder={t("metro.reportReasonPlaceholder")} className="ph-input resize-none" rows={3} />
          </div>
          <button onClick={handleReport} disabled={reportBusy || !reportReason} className="ph-btn-primary w-full">
            <Send className="h-4 w-4" /> {reportBusy ? t("admin.broadcasting") : t("metro.reportDisruption")}
          </button>
        </div>
      </Modal>

      {/* Import toast */}
      <style>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
