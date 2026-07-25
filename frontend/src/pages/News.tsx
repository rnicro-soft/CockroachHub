import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Calendar, ChevronRight, Loader } from "lucide-react";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";
import api from "../lib/api";

interface Post {
  id: number;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function News() {
  const { t, locale } = useLocale();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/posts").then(({ data }) => setPosts(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO title={t("news.seoTitle")} description={t("news.seoDesc")} path="/news" />
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="ph-section">
          <div>
            <h2>{t("news.title")}</h2>
            <div className="ph-section-accent" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader className="h-6 w-6 animate-spin text-ph-text-muted" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="mx-auto h-12 w-12 text-ph-text-muted" />
            <p className="mt-3 text-sm font-bold text-ph-text-muted">{t("news.noPosts")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const date = new Date(post.created_at);
              const preview = post.content.replace(/<[^>]*>/g, "").slice(0, 150);
              return (
                <Link
                  key={post.id}
                  to={`/news/${post.id}`}
                  className="block bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 sm:p-5 hover:border-ph-orange/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-ph-text-dark dark:text-white leading-snug">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-ph-text-muted">
                        <Calendar className="h-3 w-3" />
                        {date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      {preview && <p className="mt-2 text-xs text-ph-text-secondary line-clamp-2">{preview}…</p>}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ph-text-muted mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
