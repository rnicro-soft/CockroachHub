import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X, AlertTriangle, Send, MapPin, Navigation, Target, LocateFixed, Footprints } from "lucide-react";
import toast from "react-hot-toast";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import stationsData from "../data/metroStations.json";
import fallbackDisruptions from "../data/metroDisruptions.json";

const JM_LAT = 28.6271;
const JM_LNG = 77.2174;

interface Line { name: string; color: string }
interface Station { id: string; name: string; lines: Line[]; interchange: boolean; type: string; area: string; alternatives: string[]; lat: number; lng: number }
interface Disruption { station_id: string; status: string; reason: string; featured?: boolean; created_at: string }

const lineNames = ["Blue", "Yellow", "Red", "Violet", "Pink", "Magenta", "Green", "Airport Express"];

function haversineDist(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function walkTime(meters: number): string {
  const min = Math.round(meters / 80);
  return min < 1 ? "1m" : `${min}m`;
}

function formatDist(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

export default function Metro() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [stations, setStations] = useState<Station[]>(() => stationsData as Station[]);
  const [disruptions, setDisruptions] = useState<Disruption[]>(() => {
    const fb = fallbackDisruptions as any[];
    return fb.map((d: any) => ({ station_id: d.stationId, status: d.status === "Open" ? "open" : d.status === "Limited" ? "limited" : "closed", reason: d.reason, created_at: d.lastUpdated }));
  });
  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState<string | null>(null);
  const [nearJMFilter, setNearJMFilter] = useState(false);
  const [selected, setSelected] = useState<Station | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState("closed");
  const [reportReason, setReportReason] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [detailDisruption, setDetailDisruption] = useState<Disruption | null>(null);

  // GPS state
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "detecting" | "ok" | "denied" | "error">("idle");

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { setGpsStatus("error"); return; }
    setGpsStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); setGpsStatus("ok"); },
      (err) => { setGpsStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error"); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => { if (!online) return;
    Promise.all([
      api.get("/metro/stations").then(({ data }) => data?.length && setStations(data)).catch(() => {}),
      api.get("/metro/disruptions").then(({ data }) => data?.length && setDisruptions(data)).catch(() => {}),
    ]);
  }, [online]);

  const disruptionMap = useMemo(() => {
    const m = new Map<string, Disruption>();
    for (const d of disruptions) m.set(d.station_id, d);
    return m;
  }, [disruptions]);

  const stationsWithJM = useMemo(() =>
    stations.map((s) => ({ ...s, distToJM: haversineDist(s.lat, s.lng, JM_LAT, JM_LNG) })).sort((a, b) => a.distToJM - b.distToJM),
  [stations]);

  const nearJMThreshold = 3000;

  const filtered = useMemo(() => {
    let s = stationsWithJM;
    if (search) { const q = search.toLowerCase(); s = s.filter((st) => st.name.toLowerCase().includes(q) || st.area.toLowerCase().includes(q)); }
    if (lineFilter) s = s.filter((st) => st.lines.some((l) => l.name === lineFilter));
    if (nearJMFilter) s = s.filter((st) => st.distToJM < nearJMThreshold);
    return s;
  }, [stationsWithJM, search, lineFilter, nearJMFilter]);

  const statusColor = (status: string) => status === "open" ? "bg-ph-green" : status === "limited" ? "bg-ph-yellow" : "bg-ph-red";
  const statusText = (status: string) => t(`metro.status.${status}`);
  const statusDesc = (status: string) => t(`metro.statusDesc.${status}`);

  const handleSelect = (station: Station) => { setSelected(station); setDetailDisruption(disruptionMap.get(station.id) || null); };

  const handleReport = async () => {
    if (!selected || !reportReason) return;
    setReportBusy(true);
    try { await api.post("/metro/submit", { station_id: selected.id, status: reportStatus, reason: reportReason }); toast.success(t("metro.reportSuccess")); setReportOpen(false); setReportReason(""); }
    catch { toast.error(t("common.error")); }
    setReportBusy(false);
  };

  // --- Protest Hub: Jantar Mantar ---

  const stationsNearJM = useMemo(() =>
    stationsWithJM.filter((s) => s.distToJM < 3000),
  [stationsWithJM]);

  const nearestOpen = useMemo(() => {
    if (userLat === null || userLng === null) return null;
    const withDist = stations.map((s) => ({ ...s, dist: haversineDist(s.lat, s.lng, userLat!, userLng!) }));
    const sorted = withDist.sort((a, b) => a.dist - b.dist);
    const open = sorted.find((s) => !disruptionMap.get(s.id) || disruptionMap.get(s.id)?.status === "open");
    const all = sorted.slice(0, 5);
    return { open, all };
  }, [stations, userLat, userLng, disruptionMap]);

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

      {!online && <div className="bg-ph-orange-muted border border-ph-orange/20 px-4 py-2 text-sm text-ph-text-secondary">{t("metro.offlineData")}</div>}

      {/* ════════════════════ PROTEST HUB: JANTAR MANTAR ════════════════════ */}
      <div className="border-2 border-cjp-maroon/40 bg-cjp-maroon/5 p-5">
        <div className="flex items-start gap-4 flex-col sm:flex-row">
          {/* Left: JM info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-ph-orange" /> {t("metro.protestHub.title")}
            </h3>
            <p className="text-sm text-ph-text-secondary mt-1">{t("metro.protestHub.subtitle")}</p>

            {/* Destination card */}
            <div className="mt-3 bg-ph-black/30 border border-ph-border-light p-3 flex items-center gap-3">
              <div className="p-2 bg-cjp-maroon/20 rounded-full">
                <MapPin className="h-5 w-5 text-ph-orange" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{t("metro.protestHub.destination")}</p>
                <p className="text-xs text-ph-text-muted">{t("metro.protestHub.destinationDesc")}</p>
              </div>
              <a href="https://www.google.com/maps/dir/?api=1&destination=28.6271,77.2174" target="_blank" rel="noopener noreferrer"
                className="ph-btn-outline ph-btn-sm shrink-0 text-xs">
                <Navigation className="h-3.5 w-3.5" /> {t("metro.protestHub.openInMaps")}
              </a>
            </div>

            {/* GPS / Your location */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ph-text-muted uppercase tracking-wider">{t("metro.protestHub.yourLocation")}</span>
                {gpsStatus === "idle" && (
                  <button onClick={detectLocation} className="ph-btn-outline ph-btn-sm text-xs flex items-center gap-1">
                    <LocateFixed className="h-3.5 w-3.5" /> Detect
                  </button>
                )}
                {gpsStatus === "detecting" && <span className="text-xs text-ph-text-muted animate-pulse">{t("metro.protestHub.detecting")}</span>}
                {(gpsStatus === "denied" || gpsStatus === "error") && (
                  <button onClick={detectLocation} className="ph-btn-outline ph-btn-sm text-xs flex items-center gap-1">
                    <LocateFixed className="h-3.5 w-3.5" /> Retry
                  </button>
                )}
              </div>

              {gpsStatus === "ok" && nearestOpen && (
                <div className="space-y-2">
                  {/* Nearest OPEN station */}
                  {nearestOpen.open ? (
                    <div className="bg-ph-green/10 border border-ph-green/20 p-3 flex items-center gap-3">
                      <Footprints className="h-5 w-5 text-ph-green shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ph-text-muted">{t("metro.protestHub.nearestStation")}</p>
                        <p className="text-sm font-bold text-white">{nearestOpen.open.name}
                          <span className="text-xs text-ph-text-muted font-normal ml-2">({formatDist(nearestOpen.open.dist)} · {walkTime(nearestOpen.open.dist)} {t("metro.protestHub.minutes")})</span>
                        </p>
                      </div>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${nearestOpen.open.lat},${nearestOpen.open.lng}`}
                        target="_blank" rel="noopener noreferrer" className="ph-btn-primary ph-btn-sm text-xs shrink-0">
                        <Navigation className="h-3.5 w-3.5" /> {t("metro.protestHub.getDirections")}
                      </a>
                    </div>
                  ) : (
                    <div className="bg-ph-red/10 border border-ph-red/20 p-3 text-sm text-ph-red font-bold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />{t("metro.protestHub.noOpenNearby")}
                    </div>
                  )}

                  {/* Nearby stations list */}
                  <div className="text-xs text-ph-text-muted space-y-1">
                    {nearestOpen.all.slice(0, 4).map((s) => {
                      const d = disruptionMap.get(s.id);
                      const isOpen = !d || d.status === "open";
                      return (
                        <div key={s.id} className="flex items-center gap-2 px-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-ph-green" : d?.status === "limited" ? "bg-ph-yellow" : "bg-ph-red"}`} />
                          <span className="flex-1">{s.name}</span>
                          <span className="text-ph-text-muted">{formatDist(s.dist)}</span>
                          <span className={isOpen ? "text-ph-green" : "text-ph-red"}>{isOpen ? "Open" : d?.status === "limited" ? "Limited" : "Closed"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {gpsStatus === "denied" && <p className="text-xs text-ph-text-muted mt-1">{t("metro.protestHub.gpsDenied")}</p>}
              {gpsStatus === "error" && <p className="text-xs text-ph-text-muted mt-1">{t("metro.protestHub.gpsFailed")}</p>}
            </div>
          </div>

          {/* Right: Stations near Jantar Mantar */}
          <div className="sm:w-64 w-full border-l sm:border-l-ph-border-light sm:pl-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-ph-border-light">
            <p className="text-xs font-bold text-ph-text-muted uppercase tracking-wider mb-2">{t("metro.protestHub.stationsNear")}</p>
            <div className="space-y-2">
              {stationsNearJM.map((s) => {
                const d = disruptionMap.get(s.id);
                const isOpen = !d || d.status === "open";
                return (
                  <button key={s.id} onClick={() => handleSelect(s)}
                    className="w-full text-left flex items-center gap-2 p-2 bg-ph-black/30 hover:bg-ph-card-hover transition-colors">
                    <div className="flex flex-col items-center gap-0.5 w-8 sm:w-12 shrink-0">
                      {s.lines.slice(0, 2).map((l) => (
                        <span key={l.name} className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-ph-text-muted">{formatDist(s.distToJM)} · {walkTime(s.distToJM)} {t("metro.protestHub.minutes")}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 text-white shrink-0 ${isOpen ? "bg-ph-green" : d?.status === "limited" ? "bg-ph-yellow" : "bg-ph-red"}`}>
                      {isOpen ? t("metro.status.open") : t(`metro.status.${d!.status}`)}
                    </span>
                  </button>
                );
              })}
            </div>
            {stationsNearJM.some((s) => disruptionMap.get(s.id)?.status && disruptionMap.get(s.id)!.status !== "open") && (
              <p className="text-[10px] text-ph-text-muted mt-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-ph-yellow" />{t("metro.protestHub.allClosed")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ph-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t("metro.searchPlaceholder")} className="ph-input pl-10 w-full" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ph-text-muted hover:text-white"><X className="h-4 w-4" /></button>}
        </div>
      </div>
      <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2 whitespace-nowrap">
          <button onClick={() => setLineFilter(null)} className={`ph-btn-sm ${!lineFilter && !nearJMFilter ? "ph-btn-primary" : "ph-btn-outline"}`}>{t("metro.filterAll")}</button>
          <button onClick={() => setNearJMFilter(!nearJMFilter)}
            className={`ph-btn-sm ${nearJMFilter ? "ph-btn-primary" : "ph-btn-outline"}`}>
            <MapPin className="h-3.5 w-3.5" /> JM
          </button>
          {lineNames.map((name) => (
            <button key={name} onClick={() => setLineFilter(lineFilter === name ? null : name)}
              className={`ph-btn-sm ${lineFilter === name ? "ph-btn-primary" : "ph-btn-outline"}`}>{name}</button>
          ))}
        </div>
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
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-ph-text-muted">{t("common.noResults")}</div>
      ) : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((station) => {
          const d = disruptionMap.get(station.id);
          const status = d?.status || "open";
          return (
            <button key={station.id} onClick={() => handleSelect(station)}
              className="text-left bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-3 sm:p-4 hover:border-ph-orange/40 transition-colors min-h-[72px]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-ph-text-dark dark:text-white truncate flex items-center gap-1">
                <span className="truncate">{station.name}</span>
                {(station as any).distToJM < nearJMThreshold && <span className="text-[8px] sm:text-[9px] font-bold px-1 py-0.5 bg-cjp-maroon/10 text-cjp-maroon border border-cjp-maroon/30 shrink-0">📍 JM {formatDist((station as any).distToJM)}</span>}
                {d?.featured && <span className="text-[8px] sm:text-[9px] font-bold px-1 py-0.5 bg-cjp-maroon/10 text-cjp-maroon border border-cjp-maroon/30 shrink-0">Featured</span>}
              </h4>
                  <p className="text-xs text-ph-text-muted">{station.area}</p>
                  {(station as any).distToJM < nearJMThreshold && (
                    <p className="text-[10px] text-ph-orange mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> JM {formatDist((station as any).distToJM)}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 text-white ${statusColor(status)}`}>{statusText(status)}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {station.lines.map((l) => (
                  <span key={l.name} className="text-[10px] px-1.5 py-0.5 text-white font-bold" style={{ backgroundColor: l.color }}>{l.name}</span>
                ))}
                {station.interchange && <span className="text-[10px] px-1.5 py-0.5 border border-ph-orange/40 text-ph-orange font-bold">{t("metro.card.interchange")}</span>}
              </div>
              {d && d.status !== "open" && <p className="text-[11px] text-ph-text-muted mt-2 line-clamp-1">{d.reason}</p>}
            </button>
          );
        })}
      </div>}

      {/* Detail panel */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ""}>
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 text-white ${statusColor(detailDisruption?.status || "open")}`}>{statusText(detailDisruption?.status || "open")}</span>
              <span className="text-[11px] text-ph-text-muted">{statusDesc(detailDisruption?.status || "open")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-ph-text-muted">{t("metro.card.area")}</span><p className="text-white font-bold">{selected.area}</p></div>
              <div><span className="text-ph-text-muted">{t("metro.detail.type")}</span><p className="text-white font-bold">{selected.type}</p></div>
            </div>
            <div>
              <span className="text-sm text-ph-text-muted">{t("metro.detail.lines")}</span>
              <div className="flex flex-wrap gap-1 mt-1">{selected.lines.map((l) => (
                <span key={l.name} className="text-[11px] px-2 py-0.5 text-white font-bold" style={{ backgroundColor: l.color }}>{l.name}</span>
              ))}</div>
            </div>
            {selected.alternatives.length > 0 && (
              <div><span className="text-sm text-ph-text-muted">{t("metro.card.alternatives")}</span><p className="text-sm text-white font-bold">{selected.alternatives.join(", ")}</p></div>
            )}
            {detailDisruption && (
              <>
                <div className="border-t border-ph-border-light pt-2"><span className="text-sm text-ph-text-muted">{t("metro.detail.reason")}</span><p className="text-sm text-white">{detailDisruption.reason}</p></div>
                <div className="text-xs text-ph-text-muted">{t("metro.detail.lastUpdated")}: {new Date(detailDisruption.created_at).toLocaleString()}</div>
              </>
            )}
            <div className="border-t border-ph-border-light pt-2">
              <span className="text-xs text-ph-orange flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Jantar Mantar · {formatDist(haversineDist(selected.lat, selected.lng, JM_LAT, JM_LNG))} · {walkTime(haversineDist(selected.lat, selected.lng, JM_LAT, JM_LNG))} walk
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                target="_blank" rel="noopener noreferrer" className="ph-btn-outline flex-1 text-xs"><Navigation className="h-4 w-4" /> {t("safeZones.getDirections")}</a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=28.6271,77.2174&waypoints=${selected.lat},${selected.lng}`}
                target="_blank" rel="noopener noreferrer" className="ph-btn-outline flex-1 text-xs"><MapPin className="h-4 w-4" /> To JM</a>
              <button onClick={() => { setReportOpen(true); }} className="ph-btn-outline flex-1 text-xs"><AlertTriangle className="h-4 w-4" /> {t("metro.reportDisruption")}</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Report modal */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title={t("metro.reportTitle")}>
        <div className="space-y-3">
          <p className="text-sm text-ph-text-secondary">{t("metro.reportDesc")}</p>
          <div><label className="ph-label">{t("metro.reportSelectStatus")}</label>
            <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="ph-select">
              <option value="closed">{t("metro.status.closed")}</option>
              <option value="limited">{t("metro.status.limited")}</option>
            </select>
          </div>
          <div><label className="ph-label">{t("metro.reportReason")}</label>
            <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)}
              placeholder={t("metro.reportReasonPlaceholder")} className="ph-input resize-none" rows={3} />
          </div>
          <button onClick={handleReport} disabled={reportBusy || !reportReason} className="ph-btn-primary w-full">
            <Send className="h-4 w-4" /> {reportBusy ? t("common.loading") : t("metro.reportDisruption")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
