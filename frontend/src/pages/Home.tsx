import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Radio, Scale, ShieldCheck, Send, Eye, WifiOff, Shield, Calendar, Download, MapPin } from "lucide-react";
import { SEO } from "../components/SEO";
import { Card } from "../components/ui/Card";
import { ThumbSkeleton } from "../components/ui/Skeleton";
import { getCacheAge } from "../lib/offlineCache";
import { useLocale } from "../hooks/useLocale";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();

  const categories = [
    {
      to: "/emergency", title: t("home.categories.emergency.title"), tag: t("home.categories.emergency.tag"), views: "12.4k", duration: "24/7",
      desc: t("home.categories.emergency.desc"), icon: Phone,
    },
    {
      to: "/live-feed", title: t("home.categories.liveFeed.title"), tag: t("home.categories.liveFeed.tag"), views: "8.7k", duration: "LIVE",
      desc: t("home.categories.liveFeed.desc"), icon: Radio,
    },
    {
      to: "/legal-rights", title: t("home.categories.rights.title"), tag: t("home.categories.rights.tag"), views: "6.2k", duration: "5 min",
      desc: t("home.categories.rights.desc"), icon: Scale,
    },
    {
      to: "/fact-check", title: t("home.categories.factCheck.title"), tag: t("home.categories.factCheck.tag"), views: "4.1k", duration: "2 min",
      desc: t("home.categories.factCheck.desc"), icon: ShieldCheck,
    },
    {
      to: "/submit", title: t("home.categories.submit.title"), tag: t("home.categories.submit.tag"), views: "2.3k", duration: "1 min",
      desc: t("home.categories.submit.desc"), icon: Send,
    },
  ];

  const trending = [
    { label: t("home.trendingAlerts.tearGas"), sev: "red", time: "32m ago" },
    { label: t("home.trendingAlerts.legalAid"), sev: "yellow", time: "2h ago" },
    { label: t("home.trendingAlerts.medicalTent"), sev: "green", time: "4h ago" },
  ];

  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-5">
          {Array.from({ length: 5 }).map((_, i) => <ThumbSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
      <>
      <SEO title={t("home.seoTitle")} description={t("home.seoDesc")} path="/" />
<div className="space-y-6">

        {/* Data freshness — live */}
        <div className="flex items-center gap-2 text-[11px] text-ph-text-muted mb-2">
          <Calendar className="h-3 w-3" />
          {t("home.dataLastUpdated")} {getCacheAge("alerts") || t("home.today")} · {t("home.sources")}
        </div>

        {/* CJP Hero — Offline-First */}
        <div className="border border-cjp-maroon/30 bg-cjp-maroon/5 p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-full bg-cjp-maroon shrink-0">
              <span className="text-2xl font-black text-white">{t("home.cjp")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-white">
                {t("home.heroTitle")} <span className="text-ph-orange">{t("home.heroHighlight")}</span>
              </h1>
              <p className="text-sm text-ph-text-secondary mt-1 leading-relaxed">
                <strong className="text-ph-orange">{t("home.tagline")}</strong> {t("home.heroDesc")}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="ph-chip bg-ph-orange/15 text-ph-orange text-[10px]">
                  <WifiOff className="h-3 w-3 mr-0.5" /> {t("home.chipOffline")}
                </span>
                <span className="ph-chip bg-ph-green/15 text-ph-green text-[10px]">
                  <Shield className="h-3 w-3 mr-0.5" /> {t("home.chipZeroData")}
                </span>
                <span className="ph-chip bg-ph-card-hover text-ph-text-secondary text-[10px]">
                  <Send className="h-3 w-3 mr-0.5" /> {t("home.chipAnonymous")}
                </span>
              </div>
              <p className="text-xs text-ph-text-muted mt-2">
                <strong>{t("home.saveToHome")}</strong> {t("home.shareWithFriends")}
              </p>
            </div>
          </div>
        </div>

          <div className="ph-section">
          <div>
            <h2>{t("home.trending")}</h2>
            <div className="ph-section-accent" />
          </div>
          <Link to="/live-feed" className="ph-view-all">{t("home.viewAll")}</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-5">
          {categories.map(({ to, title, tag, views, duration, desc, icon: Icon }) => (
            <Link key={to} to={to} className="ph-card-thumb group">
              <div className="thumb-wrap">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-ph-dark group-hover:bg-ph-orange/5 transition-colors">
                  <Icon className="h-10 w-10 text-gray-300 dark:text-ph-text-muted group-hover:text-ph-orange transition-colors" />
                </div>
                <span className="thumb-label">{tag}</span>
                <span className="thumb-duration">{duration}</span>
              </div>
              <span className="thumb-title group-hover:text-ph-orange transition-colors">{title}</span>
              <span className="thumb-meta">
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{views}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="ph-section">
          <div>
            <h2>{t("home.liveUpdates")}</h2>
            <div className="ph-section-accent" />
          </div>
        </div>

        <div className="grid gap-2">
          {trending.map((a, i) => (
            <Link key={i} to="/live-feed"
              className={`flex items-center gap-3 px-4 py-3 bg-white dark:bg-ph-dark-2 border-l-[3px] hover:bg-gray-50 dark:hover:bg-ph-card-hover transition-colors ${
                a.sev === "red" ? "border-l-ph-red" : a.sev === "yellow" ? "border-l-ph-yellow" : "border-l-ph-green"
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${a.sev === "red" ? "bg-ph-red" : a.sev === "yellow" ? "bg-ph-yellow" : "bg-ph-green"}`} />
              <p className="flex-1 text-[14px] font-bold text-ph-text-dark dark:text-white">{a.label}</p>
              <span className="text-[11px] text-ph-text-muted shrink-0">{a.time}</span>
            </Link>
          ))}
        </div>

        {/* Before You Leave */}
        <div className="bg-cjp-maroon/5 border border-cjp-maroon/30 p-4">
          <h3 className="text-sm font-bold text-ph-text-dark dark:text-white mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-ph-orange" /> {t("home.beforeYouLeave")}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {(t("home.beforeYouLeaveItems") as unknown as { icon: string; label: string; desc: string }[]).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-ph-text-secondary">
                {item.icon === "Download" ? <Download className="h-4 w-4 text-ph-orange shrink-0 mt-0.5" /> :
                 item.icon === "MapPin" ? <MapPin className="h-4 w-4 text-ph-orange shrink-0 mt-0.5" /> :
                 item.icon === "Phone" ? <Phone className="h-4 w-4 text-ph-orange shrink-0 mt-0.5" /> :
                 <Shield className="h-4 w-4 text-ph-orange shrink-0 mt-0.5" />}
                <div>
                  <p className="font-bold text-ph-text-dark dark:text-white">{item.label}</p>
                  <p className="text-xs text-ph-text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Changelog */}
        <div>
          <div className="ph-section">
            <div>
              <h2>{t("home.changelog")}</h2>
              <div className="ph-section-accent" />
            </div>
          </div>
          <div className="space-y-2">
            {(t("home.changelogItems") as unknown as { date: string; text: string }[]).map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border">
                <span className="text-[11px] font-bold text-ph-orange shrink-0 w-24">{item.date}</span>
                <p className="text-sm text-ph-text-secondary">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ph-orange-muted border border-ph-orange/20 px-5 py-4">
          <p className="text-sm text-ph-text-dark dark:text-ph-text-secondary text-center">
            {t("home.emergencyPrefix")}{" "}
            <a href="tel:108" className="font-bold text-ph-orange hover:underline">108</a>{" "}
            {t("home.ambulance")}{" "}
            <a href="tel:100" className="font-bold text-ph-orange hover:underline">100</a>{" "}
            {t("home.police")}{" "}
            <Link to="/emergency" className="font-bold text-ph-orange hover:underline">{t("home.emergencyLink")}</Link>.
          </p>
        </div>
      </div>
      </>
);
}
