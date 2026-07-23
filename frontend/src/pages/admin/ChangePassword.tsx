import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const { t } = useLocale();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const admin = useAuthStore((s) => s.admin);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !newPw) { toast.error(t("admin.errors.fillAllFields")); return; }
    if (newPw.length < 8) { toast.error(t("admin.errors.passwordMinLength8")); return; }
    if (newPw !== confirm) { toast.error(t("admin.errors.passwordsDontMatch")); return; }
    setBusy(true);
    try {
      await api.post("/auth/change-password", { current_password: current, new_password: newPw });
      toast.success(t("admin.passwordChanged"));
      logout();
      nav("/admin/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("common.error"));
    }
    setBusy(false);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ph-light dark:bg-ph-black px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center bg-ph-orange">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.changePassword")}</h1>
          <p className="mt-1 text-sm text-ph-text-muted">{admin?.name}{t("admin.mustChangePassword")}</p>
        </div>
        <div className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="ph-label" htmlFor="current">{t("admin.currentPassword")}</label>
              <input id="current" type={show ? "text" : "password"} value={current}
                onChange={(e) => setCurrent(e.target.value)} className="ph-input" required autoFocus />
            </div>
            <div>
              <label className="ph-label" htmlFor="newPw">{t("admin.newPassword")}</label>
              <input id="newPw" type={show ? "text" : "password"} value={newPw}
                onChange={(e) => setNewPw(e.target.value)} className="ph-input" required minLength={8} />
            </div>
            <div>
              <label className="ph-label" htmlFor="confirm">{t("admin.confirmPassword")}</label>
              <input id="confirm" type={show ? "text" : "password"} value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className="ph-input" required />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShow(!show)}
                className="text-xs text-ph-text-muted hover:text-ph-text-dark dark:hover:text-white flex items-center gap-1">
                {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {show ? t("admin.hidePasswords") : t("admin.showPasswords")}
              </button>
            </div>
            <Button type="submit" disabled={busy} className="w-full">{busy ? t("admin.changing") : t("admin.changePassword")}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
