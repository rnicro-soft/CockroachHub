import { useEffect, useRef, useState, lazy, Suspense, useCallback } from "react";
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, RefreshCw, Loader } from "lucide-react";
import { useAuthStore } from "./store/authStore";
import { Navbar } from "./components/layout/Navbar";
import { AdminSidebar } from "./components/layout/AdminSidebar";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { OfflineBanner } from "./components/ui/OfflineBanner";
import { BackendBanner } from "./components/ui/BackendBanner";
import { PanicProvider } from "./components/layout/PanicButton";
import { StealthProvider, useStealth } from "./components/layout/StealthGate";
import { usePwaUpdate } from "./hooks/usePwaUpdate";
import { useAutoErase } from "./hooks/useAutoErase";
import { LocaleProvider, useLocale } from "./hooks/useLocale";
import { AnnouncementBanner } from "./components/ui/AnnouncementBanner";
import { useConsoleEasterEgg, useTabTitleEasterEgg, useKonamiCode } from "./hooks/useEasterEggs";
import { CockroachRain } from "./components/ui/CockroachRain";
import toast from "react-hot-toast";
import type { Admin } from "./types";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Emergency = lazy(() => import("./pages/Emergency"));
const LiveFeed = lazy(() => import("./pages/LiveFeed"));
const LegalRights = lazy(() => import("./pages/LegalRights"));
const FactCheck = lazy(() => import("./pages/FactCheck"));
const SubmitReport = lazy(() => import("./pages/SubmitReport"));
const FirstAid = lazy(() => import("./pages/FirstAid"));
const SOS = lazy(() => import("./pages/SOS"));
const Torch = lazy(() => import("./pages/Torch"));
const Checklist = lazy(() => import("./pages/Checklist"));
const SafeZones = lazy(() => import("./pages/SafeZones"));
const BailInfo = lazy(() => import("./pages/BailInfo"));
const Preparation = lazy(() => import("./pages/Preparation"));
const MentalHealth = lazy(() => import("./pages/MentalHealth"));
const Aid = lazy(() => import("./pages/Aid"));
const Resources = lazy(() => import("./pages/Resources"));
const Manifesto = lazy(() => import("./pages/Manifesto"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Evidence = lazy(() => import("./pages/Evidence"));
const Metro = lazy(() => import("./pages/Metro"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const ChangePassword = lazy(() => import("./pages/admin/ChangePassword"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminSubmissions = lazy(() => import("./pages/admin/Submissions"));
const AdminAlerts = lazy(() => import("./pages/admin/Alerts"));
const AdminFactChecks = lazy(() => import("./pages/admin/FactChecks"));
const AdminContacts = lazy(() => import("./pages/admin/Contacts"));
const AdminRights = lazy(() => import("./pages/admin/Rights"));
const AdminAdmins = lazy(() => import("./pages/admin/Admins"));
const AdminAnnouncements = lazy(() => import("./pages/admin/Announcements"));
const AdminAuditLog = lazy(() => import("./pages/admin/AuditLog"));
const AdminDetainees = lazy(() => import("./pages/admin/Detainees"));
const AdminIPBlacklist = lazy(() => import("./pages/admin/IPBlacklist"));
const AdminLoginAttempts = lazy(() => import("./pages/admin/LoginAttempts"));
const AdminMetroDisruptions = lazy(() => import("./pages/admin/MetroDisruptions"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh] bg-ph-light dark:bg-ph-black">
    <Loader className="h-6 w-6 animate-spin text-ph-text-muted" />
  </div>
);

function PwaUpdateToast() {
  const { needRefresh, applyUpdate } = usePwaUpdate();
  const { t } = useLocale();
  useEffect(() => {
    if (needRefresh) {
      toast(
        (toastObj) => (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{t("offline.newVersion")}</span>
            <button onClick={() => { applyUpdate(); toast.dismiss(toastObj.id); }} className="ph-btn-primary ph-btn-sm">
              <RefreshCw className="h-3.5 w-3.5" />{t("offline.update")}
            </button>
          </div>
        ),
        { duration: Infinity }
      );
    }
  }, [needRefresh, applyUpdate, t]);
  return null;
}

function ProtectedContent() {
  const { unlocked } = useStealth();
  const { eraseMinutes } = useStealth();
  const { t } = useLocale();
  useAutoErase(unlocked, eraseMinutes, t);
  return unlocked ? <Outlet /> : null;
}

function EasterEggs() {
  const { trigger, CockroachRainUI } = CockroachRain();
  const { t } = useLocale();
  const [logoClickCount, setLogoClickCount] = useState(0);

  useConsoleEasterEgg();
  useTabTitleEasterEgg();
  useKonamiCode(useCallback(() => trigger(), [trigger]));

  const handleLogoClick = useCallback(() => {
    setLogoClickCount((c) => {
      const next = c + 1;
      if (next >= 5) {
        trigger();
        toast("🪳 " + t("easterEgg.mainBhiCockroach"), { icon: "🪳", duration: 3000 });
        return 0;
      }
      if (next === 3) {
        toast("🪳 " + t("errors.keepClicking"), { duration: 1500 });
      }
      return next;
    });
  }, [trigger, t]);

  return { handleLogoClick, CockroachRainUI };
}

function PublicLayout() {
  const { handleLogoClick, CockroachRainUI } = EasterEggs();
  const { t } = useLocale();

  return (
    <StealthProvider>
      <PanicProvider>
        {CockroachRainUI}
        <PwaUpdateToast />
        <div className="flex min-h-dvh flex-col bg-ph-light dark:bg-ph-black">
          <Navbar onLogoClick={handleLogoClick} />
          <AnnouncementBanner />
          <BackendBanner />
          <OfflineBanner />
          <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-5">
            <Suspense fallback={<PageLoader />}>
              <ProtectedContent />
            </Suspense>
          </main>
          <footer className="border-t border-ph-border-light dark:border-ph-border bg-ph-dark">
            <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-ph-text-secondary">
              <p className="font-bold">{t("app.nameFull")}</p>
              <p className="mt-1">{t("footer.tagline")}</p>
              <p className="mt-1">{t("footer.social")}</p>
            </div>
          </footer>
        </div>
      </PanicProvider>
    </StealthProvider>
  );
}

function ProtectedRoute() {
  const { token, hydrate } = useAuthStore();
  const loc = useLocation();
  const hydrating = useRef(true);
  if (hydrating.current) { hydrate(); hydrating.current = false; }
  if (token === null) return <Navigate to="/admin/login" state={{ from: loc }} replace />;
  return <Outlet />;
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const admin = useAuthStore((s) => s.admin);
  const nav = useNavigate();
  const { t } = useLocale();
  useEffect(() => {
    if (admin?.must_reset_pw) nav("/admin/change-password", { replace: true });
  }, [admin, nav]);

  return (
    <div className="flex min-h-dvh bg-ph-light dark:bg-ph-black">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64 h-dvh"><AdminSidebar onClose={() => setSidebarOpen(false)} /></div>
        </div>
      )}
      <div className="hidden w-64 shrink-0 md:block"><AdminSidebar /></div>
      <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">
        <button onClick={() => setSidebarOpen(true)}
          className="mb-4 flex items-center gap-2 text-sm font-bold text-ph-text-muted hover:text-ph-orange md:hidden" aria-label={t("footer.menu")}>
          <Menu className="h-4 w-4" />{t("footer.menu")}
        </button>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <ErrorBoundary>
      <LocaleProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/live-feed" element={<LiveFeed />} />
            <Route path="/legal-rights" element={<LegalRights />} />
            <Route path="/fact-check" element={<FactCheck />} />
            <Route path="/submit" element={<SubmitReport />} />
            <Route path="/first-aid" element={<FirstAid />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/torch" element={<Torch />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/safe-zones" element={<SafeZones />} />
            <Route path="/bail-info" element={<BailInfo />} />
            <Route path="/preparation" element={<Preparation />} />
            <Route path="/mental-health" element={<MentalHealth />} />
            <Route path="/aid" element={<Aid />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/manifesto" element={<Manifesto />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/metro" element={<Metro />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/change-password" element={<ChangePassword />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/submissions" element={<AdminSubmissions />} />
              <Route path="/admin/alerts" element={<AdminAlerts />} />
              <Route path="/admin/fact-checks" element={<AdminFactChecks />} />
              <Route path="/admin/contacts" element={<AdminContacts />} />
              <Route path="/admin/rights" element={<AdminRights />} />
              <Route path="/admin/admins" element={<AdminAdmins />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/audit-log" element={<AdminAuditLog />} />
              <Route path="/admin/detainees" element={<AdminDetainees />} />
              <Route path="/admin/ip-blacklist" element={<AdminIPBlacklist />} />
              <Route path="/admin/login-attempts" element={<AdminLoginAttempts />} />
              <Route path="/admin/metro" element={<AdminMetroDisruptions />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
