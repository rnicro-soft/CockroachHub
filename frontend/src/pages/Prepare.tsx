import { useState, useMemo } from "react";
import { MapPin, Train, Shield, Phone, CheckCircle, Download, WifiOff, BookOpen } from "lucide-react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { useLocale } from "../hooks/useLocale";
import stationsData from "../data/metroStations.json";
import zonesData from "../data/safeZones.json";
import contactsData from "../data/emergencyContacts.json";

const LOCATIONS = [
  { id: "jantar-mantar", name: "Jantar Mantar", area: "Connaught Place", lat: 28.6271, lng: 77.2174, desc: "Main CJP protest site" },
  { id: "india-gate", name: "India Gate", area: "Central Delhi", lat: 28.6129, lng: 77.2295, desc: "Major protest venue" },
  { id: "ramlila-maidan", name: "Ramlila Maidan", area: "Old Delhi", lat: 28.6390, lng: 77.2340, desc: "Large gathering venue" },
  { id: "central-secretariat", name: "Central Secretariat", area: "Central Delhi", lat: 28.6150, lng: 77.2130, desc: "Government offices area" },
  { id: "mandi-house", name: "Mandi House", area: "Central Delhi", lat: 28.6257, lng: 77.2343, desc: "Cultural & protest hub" },
];

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Prepare() {
  const { t } = useLocale();
  const [packs, setPacks] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("offline-packs") || "{}"); }
    catch { return {}; }
  });

  const locationData = useMemo(() => LOCATIONS.map((loc) => {
    const stations = (stationsData as any[]).filter((s) => haversine(s.lat, s.lng, loc.lat, loc.lng) < 3000);
    const zones = (zonesData as any[]).filter((z) => haversine(z.lat, z.lng, loc.lat, loc.lng) < 3000);
    const contacts = (contactsData as any[]).filter((c) => {
      const city = (c.city || "").toLowerCase();
      return city === "" || city === "delhi" || city === "national";
    });
    return { ...loc, stations, zones, contacts, stationCount: stations.length, zoneCount: zones.length, contactCount: contacts.length };
  }), []);

  const downloadPack = (id: string) => {
    const next = { ...packs, [id]: true };
    setPacks(next);
    localStorage.setItem("offline-packs", JSON.stringify(next));
  };

  const allReady = locationData.every((loc) => packs[loc.id]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("prepare.title")} description={t("prepare.subtitle")} path="/prepare" />

      <div className="ph-section">
        <div><h2>{t("prepare.title")}</h2><div className="ph-section-accent" /></div>
        <p className="text-sm text-ph-text-muted mt-1">{t("prepare.subtitle")}</p>
      </div>

      {/* Global status */}
      <Card className={`p-4 ${allReady ? "border-ph-green/30 bg-ph-green/5" : "border-ph-orange/30 bg-ph-orange/5"}`}>
        <div className="flex items-center gap-3">
          {allReady ? (
            <CheckCircle className="h-8 w-8 text-ph-green shrink-0" />
          ) : (
            <Download className="h-8 w-8 text-ph-orange shrink-0" />
          )}
          <div>
            <p className="text-sm font-bold text-ph-text-dark dark:text-white">{t(allReady ? "prepare.allReady" : "prepare.title")}</p>
            <p className="text-xs text-ph-text-muted mt-0.5">{t("prepare.allReadyDesc")}</p>
          </div>
        </div>
      </Card>

      {/* Location packs */}
      <div className="grid gap-4">
        {locationData.map((loc) => {
          const ready = packs[loc.id];
          return (
            <div key={loc.id} className={`bg-white dark:bg-ph-dark-2 border ${ready ? "border-ph-green/20" : "border-ph-border-light dark:border-ph-border"} p-5 hover:border-ph-orange/30 transition-colors`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-ph-orange shrink-0" />
                    <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">
                      {t(`prepare.locations.${loc.id}` as any) || loc.name}
                    </h3>
                    {ready && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-ph-green/10 text-ph-green border border-ph-green/30">{t("prepare.ready")}</span>}
                  </div>
                  <p className="text-xs text-ph-text-muted">{loc.area} · {loc.desc}</p>

                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-ph-text-muted">
                      <Train className="h-3.5 w-3.5 text-ph-orange" /> {loc.stationCount} {t("prepare.stations")}
                    </span>
                    <span className="flex items-center gap-1 text-ph-text-muted">
                      <Shield className="h-3.5 w-3.5 text-ph-green" /> {loc.zoneCount} {t("prepare.safeZones")}
                    </span>
                    <span className="flex items-center gap-1 text-ph-text-muted">
                      <Phone className="h-3.5 w-3.5 text-ph-blue" /> {loc.contactCount} {t("prepare.contacts")}
                    </span>
                    <span className="flex items-center gap-1 text-ph-text-muted">
                      <BookOpen className="h-3.5 w-3.5 text-ph-yellow" /> {t("prepare.guides")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => downloadPack(loc.id)}
                  disabled={ready}
                  className={`ph-btn-sm w-full sm:w-auto ${ready ? "ph-btn-ghost text-ph-green" : "ph-btn-primary"}`}
                >
                  {ready ? <CheckCircle className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                  {ready ? t("prepare.ready") : t("prepare.download")}
                </button>
              </div>

              {ready && (
                <div className="mt-3 pt-3 border-t border-ph-border-light dark:border-ph-border space-y-1">
                  <p className="text-xs text-ph-text-muted flex items-center gap-1"><WifiOff className="h-3 w-3" /> {t("prepare.packReady")}</p>
                  <div className="text-[11px] text-ph-text-muted space-y-0.5">
                    {loc.stations.slice(0, 5).map((s: any) => <p key={s.id} className="truncate">🚇 {s.name} ({s.area})</p>)}
                    {loc.stations.length > 5 && <p className="text-ph-text-muted">+{loc.stations.length - 5} more stations</p>}
                    {loc.zones.map((z: any, i: number) => <p key={i} className="truncate">🏥 {z.name}</p>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
