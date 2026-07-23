import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Item { id: string; title: string; content: string }
interface Props { items: Item[] }

export function Accordion({ items }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="divide-y divide-ph-border-light dark:divide-ph-border border border-ph-border-light dark:border-ph-border">
      {items.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => setOpen(open === item.id ? null : item.id)}
            className="flex w-full items-center justify-between gap-4 bg-white dark:bg-ph-dark-2 px-4 py-3.5 text-left text-[14px] font-bold text-ph-text-dark dark:text-white transition-colors hover:bg-gray-50 dark:hover:bg-ph-card-hover"
          >
            {item.title}
            <ChevronDown className={`h-4 w-4 shrink-0 text-ph-text-muted transition-transform ${open === item.id ? "rotate-180" : ""}`} />
          </button>
          {open === item.id && (
            <div className="bg-ph-light dark:bg-ph-card px-4 py-4 text-sm leading-relaxed text-ph-text-dark dark:text-ph-text-secondary">
              {item.content.split("\n").map((line, i) => (
                <p key={i} className="mb-2 last:mb-0">{line}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
