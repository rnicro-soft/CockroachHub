import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { useLocale } from "../../hooks/useLocale";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface Post {
  id: number;
  title: string;
  content: string;
  is_published: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export default function AdminPosts() {
  const { t } = useLocale();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 20;

  const [editOpen, setEditOpen] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [form, setForm] = useState({ title: "", content: "", is_published: false });
  const [saving, setSaving] = useState(false);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/posts", { params: { page: p, per_page: perPage } });
      setPosts(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch { toast.error(t("common.error")); }
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  const openCreate = () => {
    setEditPost(null);
    setForm({ title: "", content: "", is_published: false });
    setEditOpen(true);
  };

  const openEdit = (p: Post) => {
    setEditPost(p);
    setForm({ title: p.title, content: p.content, is_published: p.is_published });
    setEditOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error(t("admin.errors.fillAllFields")); return; }
    setSaving(true);
    try {
      if (editPost) {
        await api.put(`/admin/posts/${editPost.id}`, form);
        toast.success(t("common.updated"));
      } else {
        await api.post("/admin/posts", form);
        toast.success(t("admin.actions.create"));
      }
      setEditOpen(false);
      load(page);
    } catch { toast.error(t("common.error")); }
    setSaving(false);
  };

  const togglePublish = async (p: Post) => {
    try {
      await api.patch(`/admin/posts/${p.id}/publish`);
      toast.success(p.is_published ? t("admin.activated") : t("admin.activated"));
      load(page);
    } catch { toast.error(t("common.error")); }
  };

  const deletePost = async (p: Post) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/admin/posts/${p.id}`);
      toast.success(t("common.deleted"));
      load(page);
    } catch { toast.error(t("common.error")); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between border-b border-ph-border-light dark:border-ph-border pb-4">
        <div>
          <h1 className="text-xl font-black text-ph-text-dark dark:text-white">{t("admin.posts")}</h1>
          <p className="text-sm text-ph-text-muted mt-0.5">{total} {t("admin.total")}</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" />{t("admin.add")}</Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-sm text-ph-text-muted font-bold">{t("admin.noData.posts")}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ph-border-light dark:border-ph-border text-left text-[11px] font-bold text-ph-text-muted uppercase tracking-wider">
                <th className="pb-2 pr-3">{t("admin.title")}</th>
                <th className="pb-2 pr-3">{t("admin.status")}</th>
                <th className="pb-2 pr-3">{t("admin.created")}</th>
                <th className="pb-2 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-ph-border-light/50 dark:border-ph-border/50">
                  <td className="py-2.5 pr-3 text-ph-text-dark dark:text-white font-bold max-w-[300px] truncate">{p.title}</td>
                  <td className="py-2.5 pr-3">{p.is_published
                    ? <span className="text-xs font-bold text-ph-green">{t("admin.active")}</span>
                    : <span className="text-xs font-bold text-ph-text-muted">{t("admin.draft")}</span>
                  }</td>
                  <td className="py-2.5 pr-3 text-xs text-ph-text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => togglePublish(p)} className="p-1.5 text-ph-text-muted hover:text-ph-orange" title={p.is_published ? t("admin.activate") : t("admin.activate")}>
                        {p.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => openEdit(p)} className="p-1.5 text-ph-text-muted hover:text-white" title={t("admin.edit")}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deletePost(p)} className="p-1.5 text-ph-text-muted hover:text-ph-red" title={t("admin.delete")}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => load(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-none ${p === page ? "bg-ph-orange text-white" : "bg-gray-100 dark:bg-ph-card-hover text-ph-text-muted hover:text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editPost ? t("admin.edit") : t("admin.create")}>
        <form onSubmit={save} className="space-y-3">
          <div>
            <label className="ph-label">{t("admin.title")}</label>
            <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="ph-input" required maxLength={500} />
          </div>
          <div>
            <label className="ph-label">{t("admin.content")}</label>
            <p className="text-[11px] text-ph-text-muted mb-1">{t("admin.postsContentHint")}</p>
            <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="ph-input resize-y font-mono text-xs" rows={10} required />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({...form, is_published: e.target.checked})} className="rounded border-gray-300 dark:border-ph-border" />
            <span className="text-xs font-bold text-ph-text-dark dark:text-white">{t("admin.publish")}</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="ph-btn-ghost ph-btn-sm" onClick={() => setEditOpen(false)}>{t("admin.cancel")}</button>
            <Button type="submit" disabled={saving}>{saving ? t("admin.creating") : (editPost ? t("admin.actions.update") : t("admin.actions.create"))}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
