import { useEffect, useState } from "react";
import { Users, Shield } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import type { Admin } from "../../types";

export default function AdminAdmins() {
  const { t } = useLocale();
  const [items, setItems] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [creating, setCreating] = useState(false);
  const me = useAuthStore((s) => s.admin);

  const fetch = () => {
    setLoading(true);
    api.get("/auth/admins").then(({ data }) => setItems(data)).catch(() => toast.error(t("common.error"))).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/auth/register", form);
      toast.success(t("admin.adminCreated")); setModal(false);
      setForm({ email: "", password: "", name: "" }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.detail || t("common.error")); }
    setCreating(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.admins")}</h1>
        {me?.is_super && <Button size="sm" onClick={() => setModal(true)}><Users className="h-4 w-4" />{t("admin.addAdmin")}</Button>}
      </div>

      {!me?.is_super && <div className="bg-ph-yellow/10 border border-ph-yellow/20 p-4"><p className="text-sm text-ph-yellow font-bold">{t("admin.permissionNotice")}</p></div>}

      {loading ? <p className="text-sm text-ph-text-muted">{t("admin.loading")}</p>
      : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div key={a.id} className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center bg-gray-100 dark:bg-ph-card"><Users className="h-5 w-5 text-ph-orange" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-ph-text-dark dark:text-white">{a.name}</h3>
                  {a.is_super && <span className="ph-badge-orange"><Shield className="mr-0.5 h-3 w-3" />{t("admin.super")}</span>}
                  {a.id === me?.id && <span className="ph-badge-green">{t("admin.you")}</span>}
                </div>
                <p className="text-xs text-ph-text-muted">{a.email}</p>
                <p className="text-xs text-ph-text-muted">{t("admin.joined")} {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      }

      <Modal open={modal} onClose={() => setModal(false)} title={t("admin.addAdmin")}>
        <form onSubmit={create} className="space-y-3">
          <div><label className="ph-label">{t("admin.name")}</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.email")}</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="ph-input" required /></div>
          <div><label className="ph-label">{t("admin.password")}</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="ph-input" required minLength={6} /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setModal(false)}>{t("admin.cancel")}</button><Button type="submit" disabled={creating}>{creating ? t("admin.creating") : t("admin.createAdmin")}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
