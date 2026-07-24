import { useEffect, useState, useMemo } from "react";
import { CheckSquare, ClipboardList } from "lucide-react";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";

const ITEM_IDS = [
  { id: "water", category: "essentials" },
  { id: "ors", category: "essentials" },
  { id: "mask", category: "essentials" },
  { id: "id", category: "essentials" },
  { id: "phone-charged", category: "essentials" },
  { id: "emergency-nums", category: "essentials" },
  { id: "snacks", category: "essentials" },
  { id: "first-aid", category: "essentials" },
  { id: "wet-cloth", category: "safety" },
  { id: "eye-drops", category: "safety" },
  { id: "soap", category: "safety" },
  { id: "cash", category: "legal" },
  { id: "lawyer-num", category: "legal" },
  { id: "medicines", category: "medical" },
  { id: "glucose", category: "medical" },
  { id: "whistle", category: "safety" },
  { id: "power-bank", category: "essentials" },
  { id: "chappal", category: "safety" },
  { id: "hat", category: "essentials" },
  { id: "contacts-out", category: "safety" },
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

  const allItems = useMemo(() => {
    const items = ITEM_IDS.map((item) => ({
      ...item,
      label: t(`checklist.items.${item.id}`),
    }));
    for (const cId of custom) {
      const stored = localStorage.getItem(`protest-checklist-custom-label-${cId}`);
      if (stored) items.push({ id: cId, category: "essentials", label: stored });
    }
    return items;
  }, [t, custom]);

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
      setCustom(newCustom);
      localStorage.setItem("protest-checklist-custom", JSON.stringify(newCustom));
      localStorage.setItem(`protest-checklist-custom-label-${id}`, label.trim());
    }
  };

  const total = allItems.length;
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
          const items = allItems.filter((i) => i.category === key);
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