import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Loader } from "lucide-react";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";
import api from "../lib/api";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

interface Post {
  id: number;
  title: string;
  content: string;
  post_type: string;
  image_url: string | null;
  is_published: boolean;
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

  useEffect(() => {
    if (!post?.content) return;
    const html = post.content;
    const hasEmbed = html.includes("instagram.com") && html.includes("instagram-media");
    if (!hasEmbed) return;
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const s = document.createElement("script");
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      s.onload = () => window.instgrm?.Embeds.process();
      document.body.appendChild(s);
    }
  }, [post?.content]);

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

  return (
    <>
      <SEO title={`${post.title} — ${t("news.seoTitle")}`} description={post.content.replace(/<[^>]*>/g, "").slice(0, 200)} path={`/news/${id}`} />
      <div className="mx-auto max-w-4xl">
        <Link to="/news" className="inline-flex items-center gap-1 text-xs font-bold text-ph-orange hover:underline mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />{t("news.back")}
        </Link>
        <article className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ph-text-muted bg-gray-100 dark:bg-ph-card-hover px-1.5 py-0.5">{t(`news.type.${post.post_type}`)}</span>
          </div>
          <h1 className="text-lg font-black text-ph-text-dark dark:text-white">{post.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-ph-text-muted">
            <Calendar className="h-3 w-3" />
            {date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
          {post.image_url && (
            <img src={post.image_url} alt="" className="mt-4 w-full max-h-96 rounded object-cover border border-ph-border-light dark:border-ph-border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div
            className="mt-4 prose prose-sm dark:prose-invert max-w-none text-sm text-ph-text-dark dark:text-ph-text-secondary leading-relaxed [&_a]:text-ph-orange [&_a]:font-bold [&_blockquote]:border-l-ph-orange [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </>
  );
}
