import { useEffect, useState } from "react";
import { Newspaper, Calendar, Loader, Share2, User } from "lucide-react";
import DOMPurify from "dompurify";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";
import api from "../lib/api";
import toast from "react-hot-toast";

function instagramEmbedUrl(url: string): string | null {
  try {
    const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([^\/?#]+)/);
    return match ? `https://www.instagram.com/p/${match[1]}/embed/captioned/` : null;
  } catch {
    return null;
  }
}

interface Post {
  id: number;
  title: string;
  content: string;
  post_type: string;
  image_url: string | null;
  instagram_url: string | null;
  is_published: boolean;
  author_name: string;
  created_at: string;
  updated_at: string;
}

function sharePost(post: Post, t: (s: string) => string) {
  const url = `https://cockroachhub.lol/news/${post.id}`;
  if (navigator.share) {
    navigator.share({ title: post.title, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => toast.success(t("share.copied"))).catch(() => {});
  }
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
          <div className="space-y-4">
            {posts.map((post) => {
              const date = new Date(post.created_at);
              const isArticle = post.post_type === "article";
              return (
                <article key={post.id} className={`bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border px-4 sm:px-6 py-5 sm:py-6 ${isArticle ? "max-w-5xl" : ""}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ph-text-muted bg-gray-100 dark:bg-ph-card-hover px-1.5 py-0.5">{t(`news.type.${post.post_type}`)}</span>
                      {post.instagram_url && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ph-orange bg-ph-orange/10 px-1.5 py-0.5">Instagram</span>
                      )}
                    </div>
                    <button onClick={() => sharePost(post, t)} className="p-1.5 text-ph-text-muted hover:text-ph-orange transition-colors" title={t("share.share")}>
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className={`font-black text-ph-text-dark dark:text-white leading-snug ${isArticle ? "text-xl sm:text-2xl" : "text-base"}`}>{post.title}</h3>
                  <div className="flex items-center gap-3 mt-1 mb-3 text-[11px] font-bold text-ph-text-muted flex-wrap">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author_name}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>

                  {post.image_url && (
                    <img src={post.image_url} alt="" className="w-full max-h-96 rounded object-cover border border-ph-border-light dark:border-ph-border mb-3"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}

                  {post.content && (
                    <div
                      className={`${isArticle ? "prose-base" : "prose prose-sm"} dark:prose-invert max-w-none text-ph-text-dark dark:text-ph-text-secondary leading-relaxed [&_a]:text-ph-orange [&_a]:font-bold [&_blockquote]:border-l-ph-orange [&_blockquote]:pl-4 [&_blockquote]:italic ${isArticle ? "text-[15px] leading-[1.75]" : "text-sm"}`}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                    />
                  )}

                  {post.instagram_url && (() => {
                    const embedSrc = instagramEmbedUrl(post.instagram_url);
                    return embedSrc ? (
                      <iframe src={embedSrc} className="mt-3 w-full rounded border border-ph-border-light dark:border-ph-border"
                        style={{ maxWidth: "400px", height: "500px", margin: "0 auto", display: "block" }}
                        allowFullScreen loading="lazy" />
                    ) : (
                      <a href={post.instagram_url} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-ph-orange hover:underline">
                        {t("news.viewOnInstagram")}
                      </a>
                    );
                  })()}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
