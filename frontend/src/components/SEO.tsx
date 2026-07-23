import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";

const BASE_URL = "https://cockroachhub.lol";
const DEFAULT_IMG = `${BASE_URL}/og-image.png`;

interface SEOProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}

export function SEO({ title, description, path = "/", image = DEFAULT_IMG, type = "website" }: SEOProps) {
  const { t } = useLocale();
  const url = `${BASE_URL}${path}`;
  const siteName = t("app.siteName");
  const fullTitle = `${title} — ${siteName}`;
  const desc = description ?? t("app.tagline");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD breadcrumb */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: siteName, item: BASE_URL },
            { "@type": "ListItem", position: 2, name: title, item: url },
          ],
        })}
      </script>
    </Helmet>
  );
}
