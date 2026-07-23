import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props { open: boolean; onClose: () => void; title: string; children: React.ReactNode }

export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" ref={ref} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="fixed inset-0 bg-black/70" />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-6">
        <div className="flex items-center justify-between border-b border-ph-border-light dark:border-ph-border pb-3 mb-5">
          <h2 className="text-base font-bold text-ph-text-dark dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1 text-ph-text-muted hover:bg-gray-100 dark:hover:bg-ph-card-hover"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
