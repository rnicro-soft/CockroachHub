import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/Button";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useLocale } from "../../hooks/useLocale";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const { t } = useLocale();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false);
  const nav = useNavigate(); const setAuth = useAuthStore((s) => s.setAuth);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) { toast.error(t("admin.errors.enterEmailAndPassword")); return; }
    if (pw.length < 6) { toast.error(t("admin.errors.passwordMinLength")); return; }
    if (!email.includes("@")) { toast.error(t("admin.errors.validEmail")); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", { email, password: pw });
      setAuth(data.access_token, data.admin);
      toast.success(t("admin.welcome") + data.admin.name);
      if (data.admin.must_reset_pw) {
        nav("/admin/change-password");
      } else {
        nav("/admin");
      }
    } catch (err: any) { toast.error(err.response?.data?.detail || t("admin.errors.loginFailed")); }
    setBusy(false);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ph-light dark:bg-ph-black px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center bg-ph-orange">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.login")}</h1>
          <p className="mt-1 text-sm text-ph-text-muted">{t("admin.loginSubtitle")}</p>
        </div>
        <div className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="ph-label" htmlFor="email">{t("admin.email")}</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t("admin.emailPlaceholder")} className="ph-input" autoComplete="email" autoFocus />
            </div>
            <div>
              <label className="ph-label" htmlFor="pw">{t("admin.password")}</label>
              <div className="relative">
                <input id="pw" type={show ? "text" : "password"} value={pw}
                  onChange={(e) => setPw(e.target.value)} placeholder={t("admin.passwordPlaceholder")}
                  className="ph-input pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ph-text-muted hover:text-ph-text-dark dark:hover:text-white">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={busy} className="w-full">{busy ? t("admin.signingIn") : t("admin.signIn")}</Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-ph-text-muted">{t("admin.helperText")}</p>
      </div>
    </div>
  );
}
