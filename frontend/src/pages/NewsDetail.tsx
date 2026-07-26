import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Loader, Share2, User } from "lucide-react";
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

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/posts/${id}`).then(({ data }) => setPost(data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const shareCurrent = () => {
    const url = `https://cockroachhub.lol/news/${id}`;
    const title = post?.title || "";
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success(t("share.copied"))).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12"><Loader className="h-6 w-6 animate-spin text-ph-text-muted" /></div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl text-center py-12">
        <p className="text-sm font-bold text-ph-text-muted">{t("news.notFound")}</p>
        <Link to="/news" className="mt-4 inline-flex items-center gap-1 ph-btn-outline ph-btn-sm">
          <ArrowLeft className="h-3.5 w-3.5" />{t("news.back")}
        </Link>
      </div>
    );
  }

  const date = new Date(post.created_at);
  const isArticle = post.post_type === "article";

  return (
    <>
      <SEO title={`${post.title} — ${t("news.seoTitle")}`}
        description={post.content.replace(/<[^>]*>/g, "").slice(0, 200)}
        path={`/news/${id}`}
        image={post.image_url || undefined}
        type="article" />
      <div className={`mx-auto ${isArticle ? "max-w-5xl" : "max-w-4xl"}`}>
        <Link to="/news" className="inline-flex items-center gap-1 text-xs font-bold text-ph-orange hover:underline mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />{t("news.back")}
        </Link>
        <article className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 sm:p-6 sm:py-8">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ph-text-muted bg-gray-100 dark:bg-ph-card-hover px-1.5 py-0.5">{t(`news.type.${post.post_type}`)}</span>
            <button onClick={shareCurrent} className="p-1.5 text-ph-text-muted hover:text-ph-orange transition-colors" title={t("share.share")}>
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <h1 className={`font-black text-ph-text-dark dark:text-white leading-tight ${isArticle ? "text-2xl sm:text-3xl" : "text-lg"}`}>{post.title}</h1>
          <div className={`flex items-center gap-3 mt-2 ${isArticle ? "mb-6" : "mb-3"} text-[11px] font-bold text-ph-text-muted flex-wrap`}>
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author_name}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          {post.image_url && (
            <img src={post.image_url} alt="" className={`w-full max-h-96 rounded object-cover border border-ph-border-light dark:border-ph-border ${isArticle ? "mb-6" : "mb-3"}`}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div
            className={`${isArticle ? "prose-base" : "prose prose-sm"} dark:prose-invert max-w-none text-ph-text-dark dark:text-ph-text-secondary leading-relaxed [&_a]:text-ph-orange [&_a]:font-bold [&_blockquote]:border-l-ph-orange [&_blockquote]:pl-4 [&_blockquote]:italic ${isArticle ? "text-[15px] leading-[1.75]" : "text-sm"}`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
          {post.instagram_url && (() => {
            const embedSrc = instagramEmbedUrl(post.instagram_url);
            return embedSrc ? (
              <iframe src={embedSrc} className="mt-4 w-full rounded border border-ph-border-light dark:border-ph-border"
                style={{ maxWidth: "400px", height: "550px", margin: "0 auto", display: "block" }}
                allowFullScreen loading="lazy" />
            ) : (
              <a href={post.instagram_url} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-ph-orange hover:underline">
                {t("news.viewOnInstagram")}
              </a>
            );
          })()}
        </article>
      </div>
    </>
  );
}
