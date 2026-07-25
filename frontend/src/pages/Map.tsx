import { useState, useEffect, useMemo, useCallback } from "react";
import { MapPin, Navigation, Train, LocateFixed, Footprints, Target, ArrowRight, Search, X } from "lucide-react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import stationsData from "../data/metroStations.json";
import zonesData from "../data/safeZones.json";

const JM_LAT = 28.6271;
const JM_LNG = 77.2174;

interface Station { id: string; name: string; lines: { name: string; color: string }[]; interchange: boolean; type: string; area: string; alternatives: string[]; lat: number; lng: number }
interface Zone { id?: number; name: string; type: string; description: string | null; status: string; lat: number; lng: number }

function dist(a: number, b: number, c: number, d: number): number {
  const R = 6371000;
  const dLat = (c - a) * Math.PI / 180, dLng = (d - b) * Math.PI / 180;
  const h = Math.sin(dLat/2)**2 + Math.cos(a*Math.PI/180) * Math.cos(c*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function fmt(m: number): string { return m >= 1000 ? `${(m/1000).toFixed(1)}km` : `${Math.round(m)}m`; }
function walk(m: number): string { const min = Math.round(m/80); return min < 1 ? "1min" : `${min}min`; }

interface RouteStep { type: "walk" | "line"; label: string; dist?: number }

function findRoute(a: Station, b: Station, stations: Station[]): RouteStep[] {
  if (a.id === b.id) return [];
  const shared = a.lines.filter(l => b.lines.some(l2 => l2.name === l.name));
  if (shared.length > 0) return [{ type: "line" as const, label: `Take ${shared[0].name} Line from ${a.name} to ${b.name}` }];

  for (const s of stations) {
    if (s.id === a.id || s.id === b.id) continue;
    const aShares = a.lines.some(l => s.lines.some(l2 => l2.name === l.name));
    const bShares = b.lines.some(l => s.lines.some(l2 => l2.name === l.name));
    if (aShares && bShares) {
      const lineA = a.lines.find(l => s.lines.some(l2 => l2.name === l.name))!;
      const lineB = b.lines.find(l => s.lines.some(l2 => l2.name === l.name))!;
      return [
        { type: "line" as const, label: `Take ${lineA.name} Line from ${a.name} to ${s.name}` },
        { type: "line" as const, label: `Switch to ${lineB.name} Line to ${b.name}` },
      ];
    }
  }
  return [{ type: "walk" as const, label: "Walk to destination" }];
}

export default function ProtestMap() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [stations, setStations] = useState<Station[]>(() => stationsData as Station[]);
  const [zones, setZones] = useState<Zone[]>(() => zonesData as Zone[]);
  const [disruptions, setDisruptions] = useState<Map<string, { status: string; reason: string }>>(new Map());
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "detecting" | "ok" | "denied" | "error">("idle");
  const [routeStart, setRouteStart] = useState<string>("");
  const [routeSearch, setRouteSearch] = useState("");

  useEffect(() => {
    if (!online) return;
    api.get("/metro/stations").then(({ data }) => data?.length && setStations(data)).catch(() => {});
    api.get("/safe-zones").then(({ data }) => data?.length && setZones(data)).catch(() => {});
    api.get("/metro/disruptions").then(({ data: ds }) => {
      if (ds?.length) {
        const m = new Map<string, { status: string; reason: string }>();
        for (const d of ds) m.set(d.station_id, { status: d.status, reason: d.reason });
        setDisruptions(m);
      }
    }).catch(() => {});
  }, [online]);

  const detect = useCallback(() => {
    if (!navigator.geolocation) { setGpsStatus("error"); return; }
    setGpsStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      p => { setUserLat(p.coords.latitude); setUserLng(p.coords.longitude); setGpsStatus("ok"); },
      e => setGpsStatus(e.code === e.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const disruptionMap = useMemo(() => disruptions, [disruptions]);
  const statusLabel = (s: string) => s === "open" ? "Open" : s === "limited" ? "Limited" : "Closed";

  const stationsWithDist = useMemo(() => {
    const lat = userLat ?? JM_LAT, lng = userLng ?? JM_LNG;
    return stations.map(s => ({ ...s, d: dist(s.lat, s.lng, lat, lng), dJM: dist(s.lat, s.lng, JM_LAT, JM_LNG) }));
  }, [stations, userLat, userLng]);

  const nearestOpenToUser = useMemo(() => {
    const sorted = [...stationsWithDist].sort((a, b) => a.d - b.d);
    return sorted.find(s => !disruptionMap.get(s.id) || disruptionMap.get(s.id)!.status === "open");
  }, [stationsWithDist, disruptionMap]);

  const nearestOpenToJM = useMemo(() => {
    const sorted = [...stationsWithDist].sort((a, b) => a.dJM - b.dJM);
    return sorted.find(s => !disruptionMap.get(s.id) || disruptionMap.get(s.id)!.status === "open");
  }, [stationsWithDist, disruptionMap]);

  // Use manual search station as start if user typed one, else fall back to GPS
  const manualStart = useMemo(() => {
    if (routeSearch) {
      const q = routeSearch.toLowerCase();
      const found = stations.find(s => s.name.toLowerCase().includes(q));
      if (found) setRouteStart(found.name);
      return found || null;
    }
    return null;
  }, [routeSearch, stations]);

  const route = useMemo(() => {
    const from = manualStart || nearestOpenToUser;
    if (!from || !nearestOpenToJM) return null;
    return findRoute(from, nearestOpenToJM, stations);
  }, [manualStart, nearestOpenToUser, nearestOpenToJM, stations]);

  const embedUrl = "https://www.openstreetmap.org/export/embed.html?bbox=77.09%2C28.55%2C77.32%2C28.70&layer=transportmap&marker=28.6271%2C77.2174";

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <SEO title={t("map.title")} description={t("map.subtitle")} path="/map" />

      <div className="ph-section">
        <div><h2>{t("map.title")}</h2><div className="ph-section-accent" /></div>
        <p className="text-sm text-ph-text-muted mt-1">{t("map.subtitle")}</p>
      </div>

      {/* Map embed */}
      <div className="relative w-full h-[300px] sm:h-[400px] bg-ph-dark-2 border border-ph-border overflow-hidden">
        <iframe title="OpenStreetMap" width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0}
          src={embedUrl} className="absolute inset-0 dark:invert dark:hue-rotate-180" />
        <div className="absolute top-2 left-2 bg-ph-dark/80 text-[10px] text-ph-text-muted px-2 py-1 z-10">{t("map.embedMap")}</div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-ph-text-muted px-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-ph-green" /> {t("map.legendOpen")}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-ph-yellow" /> {t("map.legendLimited")}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-ph-red" /> {t("map.legendClosed")}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-ph-orange" /> {t("map.legendLegal")}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-ph-green" /> {t("map.legendMedical")}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-ph-orange" /> {t("map.legendJm")}</span>
      </div>

      {/* GPS + Points of interest */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: stations */}
        <Card className="p-4">
          <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-3 flex items-center gap-2">
            <Train className="h-4 w-4 text-ph-orange" /> {t("map.stations")}
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {stationsWithDist.sort((a, b) => a.dJM - b.dJM).slice(0, 20).map(s => {
              const d = disruptionMap.get(s.id);
              const open = !d || d.status === "open";
              return (
                <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-ph-card-hover">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${open ? "bg-ph-green" : d?.status === "limited" ? "bg-ph-yellow" : "bg-ph-red"}`} />
                  <span className="flex-1 font-bold text-ph-text-dark dark:text-white">{s.name}</span>
                  <span className="text-ph-text-muted">{fmt(s.dJM)}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 text-white ${open ? "bg-ph-green" : d?.status === "limited" ? "bg-ph-yellow" : "bg-ph-red"}`}>
                    {open ? "Open" : statusLabel(d!.status)}
                  </span>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer"
                    className="text-ph-orange hover:underline shrink-0">
                    <Navigation className="h-3 w-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Safe Zones */}
        <Card className="p-4">
          <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ph-orange" /> {t("map.safeZones")}
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {zones.map((z, i) => (
              <div key={z.id || i} className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-ph-card-hover">
                <span className={`w-2 h-2 rounded-full shrink-0 ${z.type === "legal" ? "bg-ph-orange" : z.type === "medical" ? "bg-ph-green" : z.type === "safe" ? "bg-ph-yellow" : "bg-ph-red"}`} />
                <span className="flex-1 font-bold text-ph-text-dark dark:text-white">{z.name}</span>
                <Badge variant={z.type === "legal" ? "orange" as const : z.type === "medical" ? "green" as const : z.type === "safe" ? "yellow" as const : "red" as const}>
                  {t(`safeZones.typeLabels.${z.type}`)}
                </Badge>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${z.lat},${z.lng}`} target="_blank" rel="noopener noreferrer"
                  className="text-ph-orange hover:underline shrink-0">
                  <Navigation className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Route Planner */}
      <Card className="p-5 border-cjp-maroon/30 bg-cjp-maroon/5">
        <h3 className="text-base font-black text-white flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-ph-orange" /> {t("map.routePlanner")}
        </h3>
        <p className="text-sm text-ph-text-secondary mb-4">{t("map.routePlannerDesc")}</p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Left: controls */}
          <div className="space-y-3">
            {/* GPS button */}
            <div className="flex items-center gap-2">
              {gpsStatus === "idle" && (
                <button onClick={detect} className="ph-btn-outline ph-btn-sm text-xs">
                  <LocateFixed className="h-3.5 w-3.5" /> {t("map.detect")}
                </button>
              )}
              {gpsStatus === "detecting" && <span className="text-xs text-ph-text-muted animate-pulse">{t("map.detecting")}</span>}
              {(gpsStatus === "denied" || gpsStatus === "error") && (
                <button onClick={detect} className="ph-btn-outline ph-btn-sm text-xs">
                  <LocateFixed className="h-3.5 w-3.5" /> Retry
                </button>
              )}
              {gpsStatus === "ok" && userLat && (
                <span className="text-xs text-ph-green flex items-center gap-1">
                  <LocateFixed className="h-3.5 w-3.5" /> GPS active
                </span>
              )}
            </div>

            {/* Manual station search */}
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ph-text-muted" />
                <input type="text" value={routeSearch} onChange={e => setRouteSearch(e.target.value)}
                  placeholder={t("map.startSearch")} className="ph-input pl-8 py-1.5 text-sm" />
                {routeSearch && <button onClick={() => { setRouteSearch(""); setRouteStart(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-ph-text-muted"><X className="h-3.5 w-3.5" /></button>}
              </div>
              {routeSearch && (
                <div className="mt-1 max-h-32 overflow-y-auto border border-ph-border bg-ph-dark-2">
                  {stations.filter(s => s.name.toLowerCase().includes(routeSearch.toLowerCase())).slice(0, 5).map(s => (
                    <button key={s.id} onClick={() => { setRouteStart(s.name); setRouteSearch(s.name); }}
                      className="block w-full text-left px-3 py-1.5 text-xs hover:bg-ph-card-hover text-ph-text-dark dark:text-white">{s.name}</button>
                  ))}
                </div>
              )}
            </div>

            {/* From / To display */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-ph-text-secondary">
                <span className="w-6 h-6 rounded-full bg-ph-orange/10 text-ph-orange flex items-center justify-center text-xs font-bold">A</span>
                {routeStart || (userLat ? "Current location" : "—")}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cjp-maroon/20 text-cjp-maroon flex items-center justify-center text-xs font-bold">B</span>
                <span className="text-white font-bold">{t("map.routeTo")}</span>
              </div>
            </div>
          </div>

          {/* Right: route steps */}
          <div>
            {(route && nearestOpenToJM) ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-ph-text-muted mb-1">
                  <Train className="h-3.5 w-3.5 text-ph-orange" />
                  {t("map.routeFrom")} {routeStart || nearestOpenToUser?.name || "Current location"} → {t("map.routeTo")}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-ph-orange/30">
                  {/* Walk from current location to start station */}
                  {!manualStart && nearestOpenToUser && (
                    <div className="flex items-center gap-2 text-xs">
                      <Footprints className="h-3.5 w-3.5 text-ph-orange shrink-0" />
                      <span className="text-ph-text-secondary">{t("map.routeStepWalk").replace("{station}", nearestOpenToUser.name)}
                        <span className="text-ph-text-muted ml-1">({fmt(nearestOpenToUser.d)} · {walk(nearestOpenToUser.d)})</span>
                      </span>
                    </div>
                  )}
                  {/* Route steps */}
                  {route.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {step.type === "walk" ? <Footprints className="h-3.5 w-3.5 text-ph-orange shrink-0" />
                        : <Train className="h-3.5 w-3.5 text-ph-orange shrink-0" />}
                      <span className="text-ph-text-secondary">{step.label}</span>
                    </div>
                  ))}
                  {/* Walk to JM */}
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-ph-orange shrink-0" />
                    <span className="text-white font-bold">{t("map.routeStepWalkTo").replace("{dist}", `${fmt(nearestOpenToJM!.dJM)} · ${walk(nearestOpenToJM!.dJM)}`)}</span>
                  </div>
                </div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=28.6271,77.2174&waypoints=${(manualStart || nearestOpenToUser)!.lat},${(manualStart || nearestOpenToUser)!.lng}`}
                  target="_blank" rel="noopener noreferrer" className="ph-btn-primary ph-btn-sm w-full mt-2">
                  <Navigation className="h-4 w-4" /> Open route in Google Maps
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-sm text-ph-text-muted text-center">
                <ArrowRight className="h-6 w-6 mb-2 text-ph-text-muted" />
                {t("map.routeStartSearch")}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* bottom spacing */}
    </div>
  );
}
