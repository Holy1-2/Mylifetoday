import React from "react";
import { Helmet } from "react-helmet-async";

const SEOHead = ({ title = "", description = "", keywords = "", article = null, lang = "rw", url }) => {
  const siteName = "Kubana n'Imana Buri Munsi";
  const siteUrl = "https://kubananimanaburimunsi.vercel.app";

  const defaultTitle = "Kubana n'Imana Buri Munsi";
  const defaultDesc =
    "Inyigisho n'ubuyobozi bushingiye ku Ijambo ry'Imana ku buzima bwa buri munsi: umubano, amafaranga, akazi, amahoro y'umutima, n'iterambere mu by'umwuka.";
  const defaultKeywords =
    "Ubukristo, Bibiliya, isengesho, kwizera, ubuzima bwa buri munsi, amahoro y'umutima, inama z'Imana";

  const pageTitle =
    typeof article?.title?.[lang] === "string" && article.title[lang]
      ? `${article.title[lang]} | ${siteName}`
      : title || defaultTitle;

  const pageDesc =
    typeof article?.situation?.[lang] === "string" && article.situation[lang]
      ? article.situation[lang].replace(/<[^>]+>/g, "").slice(0, 300)
      : description || defaultDesc;

  const pageKeywords = article?.metaDescription?.keywords || keywords || defaultKeywords;
  const articleImage =
    (typeof article?.featuredImage === "string" && article.featuredImage) ||
    (typeof article?.image === "string" && article.image) ||
    "";
  const pageImage = articleImage
    ? /^https?:\/\//.test(articleImage)
      ? articleImage
      : `${siteUrl}${articleImage.startsWith("/") ? "" : "/"}${articleImage}`
    : `${siteUrl}/og.png`;

  const slug = typeof article?.slug === "string" && article.slug ? article.slug : "";
  const pageUrl = url || (slug ? `${siteUrl}/${lang}/articles/${slug}` : siteUrl);

  const ogLocaleMap = {
    rw: "rw_RW",
    en: "en_US",
    fr: "fr_FR",
    sw: "sw_KE",
  };
  const ogLocale = ogLocaleMap[lang] || "en_US";

  const isoDate =
    (article?.publishDate && new Date(article.publishDate).toISOString()) ||
    (article?.createdAt?.seconds && new Date(article.createdAt.seconds * 1000).toISOString()) ||
    (typeof article?.date === "string" ? new Date(article.date).toISOString() : undefined);

  const metadata = article?.metaDescription || {};

  return (
    <Helmet>
      <html lang={lang} />
      <title>{pageTitle}</title>

      {/* Basic SEO */}
      <meta name="description" content={pageDesc} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content={metadata.author || "Topray"} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={ogLocale} />
      {article && (
        <meta property="article:published_time" content={isoDate} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />

      {/* Hreflang for multilingual SEO - uses slugs, not document IDs */}
      {article && slug && (
        <>
          <link rel="alternate" hreflang="rw" href={`${siteUrl}/rw/articles/${slug}`} />
          <link rel="alternate" hreflang="en" href={`${siteUrl}/en/articles/${slug}`} />
          <link rel="alternate" hreflang="fr" href={`${siteUrl}/fr/articles/${slug}`} />
          <link rel="alternate" hreflang="sw" href={`${siteUrl}/sw/articles/${slug}`} />
          <link rel="alternate" hreflang="x-default" href={`${siteUrl}/rw/articles/${slug}`} />
        </>
      )}

      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": article ? "NewsArticle" : "WebSite",
          "name": siteName,
          "headline": pageTitle,
          "description": pageDesc,
          "image": pageImage,
          "url": pageUrl,
          "author": {
            "@type": "Person",
            "name": metadata.author || "Topray",
          },
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/logo.png`,
            },
          },
          "datePublished": isoDate,
          "dateModified": isoDate,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl,
          },
          "inLanguage": lang,
          "keywords": typeof pageKeywords === "string" ? pageKeywords.split(",") : [],
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;