import { useEffect, useState } from "react";
import { CheckSquare, ClipboardList } from "lucide-react";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";

const DEFAULT_ITEMS = [
  { id: "water", label: "Water bottle (1L)", category: "essentials" },
  { id: "ors", label: "ORS packets /Electral", category: "essentials" },
  { id: "mask", label: "N95 mask (2x)", category: "essentials" },
  { id: "id", label: "ID card (Aadhaar/Voter)", category: "essentials" },
  { id: "phone-charged", label: "Phone charged + power bank", category: "essentials" },
  { id: "emergency-nums", label: "Emergency numbers memorized", category: "essentials" },
  { id: "snacks", label: "Dry snacks (biscuits, nuts)", category: "essentials" },
  { id: "first-aid", label: "First aid kit (bandages, antiseptic)", category: "essentials" },
  { id: "wet-cloth", label: "Wet cloth / bandana for tear gas", category: "safety" },
  { id: "eye-drops", label: "Saline eye drops", category: "safety" },
  { id: "soap", label: "Small soap / dish soap for pepper spray", category: "safety" },
  { id: "cash", label: "Cash (small bills) + bail money", category: "legal" },
  { id: "lawyer-num", label: "Lawyer contact saved", category: "legal" },
  { id: "medicines", label: "Personal medicines (if any)", category: "medical" },
  { id: "glucose", label: "Glucose / sugar", category: "medical" },
  { id: "whistle", label: "Whistle (to alert others)", category: "safety" },
  { id: "power-bank", label: "Power bank + cable", category: "essentials" },
  { id: "chappal", label: "Sturdy closed-toe shoes (not chappals)", category: "safety" },
  { id: "hat", label: "Cap / hat for sun protection", category: "essentials" },
  { id: "contacts-out", label: "Remove contact lenses", category: "safety" },
];

const categories = [
  { key: "essentials", labelKey: "checklist.categories.essentials", color: "text-ph-orange" },
  { key: "safety", labelKey: "checklist.categories.safety", color: "text-ph-red" },
  { key: "medical", labelKey: "checklist.categories.medical", color: "text-ph-green" },
  { key: "legal", labelKey: "checklist.categories.legal", color: "text-ph-yellow" },
];

const STORAGE_KEY = "protest-checklist";

export default function Checklist() {
  const { t } = useLocale();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("protest-checklist-custom") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setChecked(new Set(stored));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const addCustom = () => {
    const label = prompt(t("checklist.addCustom"));
    if (label && label.trim()) {
      const id = `custom-${Date.now()}`;
      const newCustom = [...custom, id];
      DEFAULT_ITEMS.push({ id, label: label.trim(), category: "essentials" });
      setCustom(newCustom);
      localStorage.setItem("protest-checklist-custom", JSON.stringify(newCustom));
    }
  };

  const total = DEFAULT_ITEMS.length;
  const done = checked.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
      <>
      <SEO title={t("checklist.seoTitle")} description={t("checklist.seoDesc")} path="/checklist" />
<div className="mx-auto max-w-2xl space-y-5">
      <div className="ph-section">
        <div>
          <h2>{t("checklist.title")}</h2>
          <div className="ph-section-accent" />
        </div>
      </div>

      <div className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-ph-text-dark dark:text-white">{t("checklist.prep")}</span>
          <span className="text-xs font-bold text-ph-text-muted">{done}/{total} ({pct}%)</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-ph-card-hover">
          <div className="h-full bg-ph-orange transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(({ key, labelKey, color }) => {
          const items = DEFAULT_ITEMS.filter((i) => i.category === key);
          if (items.length === 0) return null;
          return (
<div key={key}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${color} mb-2`}>{t(labelKey)}</h3>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      checked.has(item.id)
                        ? "text-ph-text-muted line-through"
                        : "text-ph-text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-ph-card-hover"
                    }`}
                  >
                    <CheckSquare className={`h-4 w-4 shrink-0 ${
                      checked.has(item.id) ? "text-ph-green" : "text-ph-text-muted"
                    }`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

      );
})}
      </div>

      <button onClick={addCustom} className="ph-btn-outline w-full">
        <ClipboardList className="h-4 w-4" />{t("checklist.addCustom")}
      </button>
    </div>
    </>
  );
}