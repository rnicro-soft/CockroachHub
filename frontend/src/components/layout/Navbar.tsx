import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Flame, Phone, Radio, Scale, ShieldCheck, Menu, X, Send, Search, Shield,
  Moon, Sun, Download, Bell, BellOff, Heart, AlertTriangle, Sun as SunIcon,
  ClipboardList, MapPin, Lock, BookOpen, Droplets, Globe, Eye, Train, Users,
} from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { usePwaInstall } from "../../hooks/usePwaInstall";
import { useLocale } from "../../hooks/useLocale";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useStealth } from "./StealthGate";
import { PanicTrigger } from "./PanicButton";

const pageImports: Record<string, () => Promise<any>> = {
  "/": () => import("../../pages/Home"),
  "/emergency": () => import("../../pages/Emergency"),
  "/live-feed": () => import("../../pages/LiveFeed"),
  "/first-aid": () => import("../../pages/FirstAid"),
  "/sos": () => import("../../pages/SOS"),
  "/safe-zones": () => import("../../pages/SafeZones"),
  "/preparation": () => import("../../pages/Preparation"),
  "/legal-rights": () => import("../../pages/LegalRights"),
  "/bail-info": () => import("../../pages/BailInfo"),
  "/checklist": () => import("../../pages/Checklist"),
  "/mental-health": () => import("../../pages/MentalHealth"),
  "/aid": () => import("../../pages/Aid"),
  "/resources": () => import("../../pages/Resources"),
  "/fact-check": () => import("../../pages/FactCheck"),
  "/manifesto": () => import("../../pages/Manifesto"),
  "/about": () => import("../../pages/About"),
  "/privacy": () => import("../../pages/Privacy"),
  "/evidence": () => import("../../pages/Evidence"),
  "/metro": () => import("../../pages/Metro"),
  "/map": () => import("../../pages/Map"),
  "/group": () => import("../../pages/GroupCheckin"),
  "/prepare": () => import("../../pages/Prepare"),
};

const navLinks: { to: string; key: string; icon: any }[] = [
  { to: "/", key: "home", icon: Flame },
  { to: "/metro", key: "metro", icon: Train },
  { to: "/emergency", key: "emergency", icon: Phone },
  { to: "/live-feed", key: "liveFeed", icon: Radio },
  { to: "/sos", key: "sos", icon: AlertTriangle },
  { to: "/first-aid", key: "firstAid", icon: Heart },
  { to: "/safe-zones", key: "safeZones", icon: MapPin },
  { to: "/legal-rights", key: "rights", icon: Scale },
  { to: "/bail-info", key: "bail", icon: Scale },
  { to: "/checklist", key: "checklist", icon: ClipboardList },
  { to: "/preparation", key: "prep", icon: BookOpen },
  { to: "/prepare", key: "prepare", icon: Download },
  { to: "/mental-health", key: "mentalHealth", icon: Heart },
  { to: "/aid", key: "aid", icon: Droplets },
  { to: "/resources", key: "resources", icon: Globe },
  { to: "/fact-check", key: "factCheck", icon: ShieldCheck },
  { to: "/privacy", key: "privacy", icon: Eye },
  { to: "/evidence", key: "evidence", icon: Shield },
  { to: "/manifesto", key: "manifesto", icon: ShieldCheck },
  { to: "/about", key: "about", icon: Shield },
];

const NavLink = memo(({ to, icon: Icon, isActive, label }: { to: string; icon: any; isActive: boolean; label: string }) => {
  const preload = useCallback(() => {
    if (pageImports[to]) pageImports[to]();
  }, [to]);

  return (
    <Link to={to} onMouseEnter={preload} onTouchStart={preload}
      className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[12px] font-bold border-b-2 ${
        isActive ? "text-ph-orange border-ph-orange" : "text-ph-text-secondary border-transparent hover:text-white hover:border-ph-text-muted"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />{label}
    </Link>
  );
});
NavLink.displayName = "NavLink";

export const Navbar = memo(function Navbar({ onLogoClick }: { onLogoClick?: () => void }) {
  const loc = useLocation();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(searchParams.get("q") || "");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { theme, toggle } = useTheme();
  const { canInstall, install } = usePwaInstall();
  const { locale, setLocale, t } = useLocale();
  const { supported: pushSupported, subscribed: pushSubscribed, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications();
  const { lock } = useStealth();

  const doSearch = (val: string) => {
    setSearchVal(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      nav(val.trim() ? `/live-feed?q=${encodeURIComponent(val.trim())}` : "/live-feed");
    }, 300);
  };

  return (
    <>
    <header className="sticky top-0 z-40 bg-ph-dark border-b border-ph-border">
      {/* Row 1: Logo + Search + Actions */}
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" onClick={onLogoClick} className="flex items-center gap-2 shrink-0">
          <Shield className="h-6 w-6 text-ph-orange" />
          <span className="text-base font-black tracking-tight text-white">
            Cockroach<span className="text-ph-orange">Hub</span>
          </span>
        </Link>

        <div className="hidden sm:flex flex-1 max-w-md mx-auto">
          <div className="relative w-full">
            <input type="text" value={searchVal} onChange={(e) => doSearch(e.target.value)}
              placeholder={t("search.placeholder")}
              className="ph-input-search w-full pl-8 pr-3" aria-label={t("search.ariaLabel")}
              onFocus={() => { if (loc.pathname !== "/live-feed") nav("/live-feed"); }}
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ph-text-secondary pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link to="/torch" className="hidden sm:flex p-2 text-ph-text-secondary hover:text-white" title={t("torch.title")} aria-label={t("torch.title")}>
            <SunIcon className="h-4 w-4" />
          </Link>
          {pushSupported && (
            <button onClick={pushSubscribed ? pushUnsubscribe : pushSubscribe}
              className="p-2 text-ph-text-secondary hover:text-white"
              title={pushSubscribed ? t("push.enabled") : t("push.disabled")}
              aria-label={pushSubscribed ? t("push.disable") : t("push.enable")}
            >
              {pushSubscribed ? <Bell className="h-4 w-4 text-ph-orange" /> : <BellOff className="h-4 w-4" />}
            </button>
          )}
          <button onClick={lock} className="p-2 text-ph-text-secondary hover:text-ph-orange" title={t("nav.lock")} aria-label={t("nav.lock")}>
            <Lock className="h-4 w-4" />
          </button>
          <button onClick={() => setLocale(locale === "en" ? "hi" : "en")}
            className="p-2 text-xs font-bold text-ph-text-secondary hover:text-white" title={t("lang.switchTo")} aria-label={t("lang.switchTo")}>
            {locale === "en" ? t("lang.shortHi") : t("lang.shortEn")}
          </button>
          <button onClick={toggle} className="p-2 text-ph-text-secondary hover:text-white" title={theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")} aria-label={t("theme.toggle")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {canInstall && (
            <button onClick={install} className="hidden sm:flex items-center gap-1 ph-btn-outline ph-btn-sm text-xs" title={t("install.title")} aria-label={t("install.button")}>
              <Download className="h-3.5 w-3.5" />{t("install.button")}
            </button>
          )}
          <PanicTrigger />
          <Link to="/submit" className="hidden sm:inline-flex items-center gap-1.5 ph-btn-primary ph-btn-sm">
            <Send className="h-3.5 w-3.5" />{t("nav.submit")}
          </Link>
          <button onClick={() => setOpen(!open)} className="p-3 text-ph-text-secondary hover:text-white md:hidden" aria-label={t("footer.menu")}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Row 2: Navigation (scrollable) */}
      <div className="hidden md:block border-t border-ph-border overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex items-center gap-0.5 -mb-px">
            {navLinks.map(({ to, key, icon }) => (
              <NavLink key={to} to={to} label={t("nav." + key)} icon={icon} isActive={loc.pathname === to} />
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ph-border bg-ph-dark max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-2">
            <input type="text" value={searchVal} onChange={(e) => doSearch(e.target.value)}
              placeholder={t("search.mobilePlaceholder")} className="ph-input-search w-full" aria-label={t("search.ariaLabel")}
              onFocus={() => nav("/live-feed")}
            />
          </div>
          <nav className="flex flex-col px-4 pb-2">
            {navLinks.map(({ to, key, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold transition-colors ${
                  loc.pathname === to ? "text-ph-orange" : "text-ph-text-secondary hover:text-white"
                }`}>
                <Icon className="h-4 w-4" />{t("nav." + key)}
              </Link>
            ))}
            <div className="border-t border-ph-border my-2 pt-2 space-y-1">
              <Link to="/torch" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-ph-text-secondary hover:text-white">
                <SunIcon className="h-4 w-4" />{t("torch.title")}
              </Link>
              <button onClick={() => { lock(); setOpen(false); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-ph-text-secondary hover:text-white">
                <Lock className="h-4 w-4" />{t("nav.lock")}
              </button>
              <button onClick={() => { toggle(); setOpen(false); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-ph-text-secondary hover:text-white">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
              </button>
              <button onClick={() => { setLocale(locale === "en" ? "hi" : "en"); setOpen(false); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-ph-text-secondary hover:text-white">
                {locale === "en" ? t("lang.hi") : t("lang.en")}
              </button>
              {canInstall && (
                <button onClick={() => { install(); setOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-ph-text-secondary hover:text-white">
                  <Download className="h-4 w-4" />{t("install.mobile")}
                </button>
              )}
              <Link to="/submit" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 mt-1 text-[13px] font-bold bg-ph-orange text-white">
                <Send className="h-4 w-4" />{t("nav.submit")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>

    {/* Mobile Bottom Navigation */}
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-ph-border bg-ph-dark md:hidden safe-area-bottom">
      <div className="flex items-center justify-around min-h-[56px] px-1">
        {[
          { to: "/", key: "home", icon: Flame },
          { to: "/sos", key: "sos", icon: AlertTriangle, urgent: true },
          { to: "/metro", key: "metro", icon: Train },
          { to: "/live-feed", key: "liveFeed", icon: Radio },
          { to: "/emergency", key: "emergency", icon: Phone },
        ].map(({ to, key, icon: Icon, urgent }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 ${
              urgent
                ? "text-ph-red"
                : loc.pathname === to
                ? "text-ph-orange"
                : "text-ph-text-muted hover:text-white"
            }`}
          >
            <Icon className={`h-5 w-5 ${urgent ? "animate-pulse" : ""}`} />
            <span className="text-[10px] font-bold leading-tight">{t("nav." + key)}</span>
          </Link>
        ))}
      </div>
    </nav>

    {/* Spacer for bottom nav on mobile */}
    <div className="h-[56px] md:hidden" />
    </>
  );
});
