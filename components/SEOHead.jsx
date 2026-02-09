// SEOHead.jsx (mu Kinyarwanda)
import React from "react";
import { Helmet } from "react-helmet";

const SEOHead = ({ title, description, keywords, article, lang = "rw", url }) => {
  const siteName = "Kubana n’Imana Buri Munsi";
  const siteUrl = "https://theprovidence.com";

  const defaultTitle = "Kubana n’Imana Buri Munsi – Ubwenge bwa Bibiliya & Ubuzima bwa buri munsi";
  const defaultDesc =
    "Inyigisho n’ubuyobozi bushingiye ku Ijambo ry’Imana ku buzima bwa buri munsi: umubano, amafaranga, akazi, amahoro y’umutima, n’iterambere mu by’umwuka.";
  const defaultKeywords =
    "Ubukristo, Bibiliya, isengesho, kwizera, ubuzima bwa buri munsi, amahoro y’umutima, inama z’Imana";

  const pageTitle =
    article?.title?.[lang]
      ? `${article.title[lang]} | ${siteName}`
      : title || defaultTitle;

  const pageDesc = article?.situation?.[lang] || description || defaultDesc;

  const pageKeywords = keywords || defaultKeywords;
  const pageImage = article?.image || `${siteUrl}/og-image.jpg`;
  const pageUrl = url || siteUrl;

  // Open Graph locale (hindura uko bikwiye)
  const ogLocale = lang === "rw" ? "rw_RW" : "en_US";

  return (
    <Helmet>
      <html lang={lang} />
      <title>{pageTitle}</title>

      {/* SEO y'ibanze */}
      <meta name="description" content={pageDesc} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Topray" />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph (Facebook/WhatsApp etc.) */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />

      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": article ? "Article" : "WebSite",
          "name": siteName,
          "headline": pageTitle,
          "description": pageDesc,
          "image": pageImage,
          "url": pageUrl,
          "author": {
            "@type": "Person",
            "name": "Topray",
          },
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/logo.png`,
            },
          },
          "datePublished": article?.date,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl,
          },
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
