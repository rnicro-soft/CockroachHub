import { useState, useEffect, useMemo } from "react";
import { Bus, Search, X } from "lucide-react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { useLocale } from "../hooks/useLocale";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import api from "../lib/api";
import fallback from "../data/busRoutes.json";

interface Route { id?: number; direction: string; bus_number: string; start: string; end: string }

const DIRECTION_MAP: Record<string, string> = {
  "Towards Pallika Kendra": "pallika",
  "Towards Patel Chowk Metro Station": "patel",
  "Towards Central Secretariat": "secretariat",
};

export default function BusRoutes() {
  const { t } = useLocale();
  const online = useOnlineStatus();
  const [routes, setRoutes] = useState<Route[]>(() => fallback as Route[]);
  const [tab, setTab] = useState("pallika");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!online) return;
    api.get("/bus-routes").then(({ data }) => data?.length && setRoutes(data)).catch(() => {});
  }, [online]);

  const tabs = [
    { key: "pallika", dir: "Towards Pallika Kendra" },
    { key: "patel", dir: "Towards Patel Chowk Metro Station" },
    { key: "secretariat", dir: "Towards Central Secretariat" },
  ];

  const filtered = useMemo(() => {
    let items = routes.filter((r) => {
      const dir = DIRECTION_MAP[r.direction];
      return dir === tab;
    });
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((r) =>
        r.bus_number.toLowerCase().includes(q) ||
        r.start.toLowerCase().includes(q) ||
        r.end.toLowerCase().includes(q)
      );
    }
    return items;
  }, [routes, tab, search]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SEO title={t("bus.seoTitle")} description={t("bus.seoDesc")} path="/bus" />

      <div className="ph-section">
        <div><h2>{t("bus.title")}</h2><div className="ph-section-accent" /></div>
        <p className="text-sm text-ph-text-muted mt-1">{t("bus.subtitle")}</p>
      </div>

      {/* Direction tabs */}
      <div className="ph-tabs">
        {tabs.map(({ key, dir }) => (
          <button key={key} onClick={() => setTab(key)}
            className={tab === key ? "ph-tab-active" : "ph-tab-inactive"}>
            {t("bus.tabs." + key)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ph-text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bus number, start or end point..." className="ph-input pl-10 w-full" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ph-text-muted hover:text-white"><X className="h-4 w-4" /></button>}
      </div>

      {/* Route count */}
      <p className="text-xs text-ph-text-muted">{filtered.length} bus routes</p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-ph-text-muted">{t("bus.noRoutes")}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ph-border-light dark:border-ph-border text-left">
                <th className="pb-3 font-bold text-ph-text-muted text-xs uppercase tracking-wider">{t("bus.busNumber")}</th>
                <th className="pb-3 font-bold text-ph-text-muted text-xs uppercase tracking-wider">{t("bus.from")}</th>
                <th className="pb-3 font-bold text-ph-text-muted text-xs uppercase tracking-wider">{t("bus.to")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id || i} className="border-b border-ph-border-light/50 dark:border-ph-border/50 hover:bg-ph-card-hover/50">
                  <td className="py-2.5 pr-4 font-bold text-ph-orange font-mono">{r.bus_number}</td>
                  <td className="py-2.5 pr-4 text-ph-text-dark dark:text-white">{r.start}</td>
                  <td className="py-2.5 text-ph-text-muted">{r.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Offline notice */}
      {!online && <div className="text-xs text-ph-text-muted text-center pt-2">Showing cached bus data</div>}
    </div>
  );
}
