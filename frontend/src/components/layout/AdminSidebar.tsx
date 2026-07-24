import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Inbox, Radio, ShieldCheck, Phone, Scale, Users, LogOut, ChevronLeft, Megaphone,
  ClipboardList, Ban, History, UserPlus, Train,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useLocale } from "../../hooks/useLocale";

const links: { to: string; key: string; icon: any }[] = [
  { to: "/admin", key: "dashboard", icon: LayoutDashboard },
  { to: "/admin/submissions", key: "submissions", icon: Inbox },
  { to: "/admin/alerts", key: "alerts", icon: Radio },
  { to: "/admin/detainees", key: "detainees", icon: UserPlus },
  { to: "/admin/fact-checks", key: "factChecks", icon: ShieldCheck },
  { to: "/admin/contacts", key: "contacts", icon: Phone },
  { to: "/admin/rights", key: "rights", icon: Scale },
  { to: "/admin/announcements", key: "announcements", icon: Megaphone },
  { to: "/admin/ip-blacklist", key: "ipBlacklist", icon: Ban },
  { to: "/admin/metro", key: "metroDisruptions", icon: Radio },
  { to: "/admin/metro-stations", key: "metroStations", icon: Train },
  { to: "/admin/audit-log", key: "auditLog", icon: History },
  { to: "/admin/login-attempts", key: "loginAttempts", icon: History },
  { to: "/admin/admins", key: "admins", icon: Users },
];

interface Props { onClose?: () => void }

export function AdminSidebar({ onClose }: Props) {
  const loc = useLocation();
  const nav = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { t } = useLocale();

  return (
    <aside className="flex h-full flex-col border-r border-ph-border-light dark:border-ph-border bg-white dark:bg-ph-dark">
      <div className="flex items-center justify-between border-b border-ph-border-light dark:border-ph-border px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-ph-orange" aria-label={t("app.siteName")}>
          <ChevronLeft className="h-4 w-4" />{t("app.siteName")}
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 text-ph-text-muted hover:bg-gray-100 dark:hover:bg-ph-card-hover md:hidden" aria-label={t("common.close")}>✕</button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {links.map(({ to, key, icon: Icon }) => (
          <Link key={to} to={to} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold transition-colors mb-0.5 ${
              loc.pathname === to
                ? "bg-ph-orange/10 text-ph-orange"
                : "text-ph-text-muted hover:bg-gray-100 dark:hover:bg-ph-card-hover dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t("admin." + key)}
          </Link>
        ))}
      </nav>
      <div className="border-t border-ph-border-light dark:border-ph-border p-2">
        <button onClick={() => { logout(); nav("/admin/login"); }}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-ph-text-muted transition-colors hover:bg-gray-100 dark:hover:bg-ph-card-hover hover:text-ph-red"
          aria-label={t("admin.signOut")}
        >
          <LogOut className="h-4 w-4 shrink-0" />{t("admin.signOut")}
        </button>
      </div>
    </aside>
  );
}
