import { useEffect, useState } from "react";
import { Newspaper, Calendar, Loader, Play } from "lucide-react";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";
import api from "../lib/api";

declare global {
  interface Window { instgrm?: { Embeds: { process: () => void } } }
}

interface Post {
  id: number;
  title: string;
  content: string;
  post_type: string;
  image_url: string | null;
  instagram_url: string | null;
  instagram_thumbnail: string | null;
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

  useEffect(() => {
    if (!posts.length) return;
    const hasEmbeds = posts.some((p) => p.content && p.content.includes("instagram-media"));
    if (!hasEmbeds) return;
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const s = document.createElement("script");
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      s.onload = () => window.instgrm?.Embeds.process();
      document.body.appendChild(s);
    }
  }, [posts]);

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
          <div className="space-y-0 divide-y divide-ph-border-light dark:divide-ph-border">
            {posts.map((post) => {
              const date = new Date(post.created_at);
              return (
                <article key={post.id} className="bg-white dark:bg-ph-dark-2 py-5 sm:py-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ph-text-muted bg-gray-100 dark:bg-ph-card-hover px-1.5 py-0.5">{t(`news.type.${post.post_type}`)}</span>
                    {post.instagram_url && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ph-orange bg-ph-orange/10 px-1.5 py-0.5">Instagram</span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-ph-text-dark dark:text-white leading-snug">{post.title}</h3>
                  <div className="flex items-center gap-2 mt-1 mb-3 text-[11px] font-bold text-ph-text-muted">
                    <Calendar className="h-3 w-3" />
                    {date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>

                  {post.image_url && (
                    <img src={post.image_url} alt="" className="w-full max-h-96 rounded object-cover border border-ph-border-light dark:border-ph-border mb-3"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}

                  {post.content && (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-sm text-ph-text-dark dark:text-ph-text-secondary leading-relaxed [&_a]:text-ph-orange [&_a]:font-bold [&_blockquote]:border-l-ph-orange [&_blockquote]:pl-4 [&_blockquote]:italic"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}

                  {post.instagram_url && (
                    <a href={post.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="mt-3 group block max-w-sm rounded overflow-hidden border border-ph-border-light dark:border-ph-border bg-ph-dark">
                      {post.instagram_thumbnail ? (
                        <div className="relative aspect-[9/16] bg-ph-card">
                          <img src={post.instagram_thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="h-7 w-7 text-black ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-3">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">{t("news.viewOnInstagram")}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 group-hover:bg-ph-card-hover transition-colors">
                          <div className="w-12 h-12 rounded-full bg-ph-orange/20 flex items-center justify-center shrink-0">
                            <Play className="h-6 w-6 text-ph-orange ml-0.5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ph-text-dark dark:text-white">{t("news.type.instagram")}</p>
                            <p className="text-xs text-ph-text-muted mt-0.5">{t("news.viewOnInstagram")}</p>
                          </div>
                        </div>
                      )}
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
