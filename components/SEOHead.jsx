import { useEffect } from "react";

const SITE_NAME = "Kubanan'Imana";
const SITE_URL = "https://kubananimanaburimunsi.vercel.app";
const LOCALES = ["rw", "en", "sw", "fr"];
const OG_LOCALES = { rw: "rw_RW", en: "en_US", fr: "fr_FR", sw: "sw_KE" };

const plainText = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const toIso = (value) => {
  if (!value) return undefined;
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : typeof value?.seconds === "number"
        ? new Date(value.seconds * 1000)
        : new Date(value);
  return isNaN(date.getTime()) ? undefined : date.toISOString();
};

const upsertMeta = (attribute, key, content) => {
  const existing = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (content === undefined || content === null || content === "") {
    if (existing?.getAttribute("data-seo") === "true") existing.remove();
    return;
  }
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }
  const meta = document.createElement("meta");
  meta.setAttribute(attribute, key);
  meta.setAttribute("content", content);
  meta.setAttribute("data-seo", "true");
  document.head.appendChild(meta);
};

const upsertLink = (rel, href, hreflang = "") => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let link = document.head.querySelector(selector);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    if (hreflang) link.setAttribute("hreflang", hreflang);
    link.setAttribute("data-seo", "true");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const upsertJsonLd = (data) => {
  let script = document.head.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-seo", "true");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

const SEOHead = ({ title = "", description = "", keywords = "", article = null, lang = "rw", url = "", image = "", robots = "index, follow" }) => {
  const defaultTitle = "Kubanan'Imana — Muri Kristo Honyine";
  const defaultDesc =
    "Inyigisho n'ubuyobozi bushingiye ku Ijambo ry'Imana ku buzima bwa buri munsi: umubano, amafaranga, akazi, amahoro y'umutima, n'iterambere mu by'umwuka.";
  const defaultKeywords =
    "Ubukristo, Bibiliya, isengesho, kwizera, ubuzima bwa buri munsi, amahoro y'umutima, inama z'Imana";

  const pageTitle =
    typeof article?.title?.[lang] === "string" && article.title[lang]
      ? `${article.title[lang]} | ${SITE_NAME}`
      : title || defaultTitle;

  const pageDesc =
    typeof article?.situation?.[lang] === "string" && article.situation[lang]
      ? plainText(article.situation[lang]).slice(0, 300)
      : description || defaultDesc;

  const pageKeywords = article?.metaDescription?.keywords || keywords || defaultKeywords;
  const articleImage =
    (typeof article?.featuredImage === "string" && article.featuredImage) ||
    (typeof article?.image === "string" && article.image) ||
    "";
  const rawImage = image || articleImage;
  const pageImage = rawImage
    ? /^https?:\/\//.test(rawImage)
      ? rawImage
      : `${SITE_URL}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
    : `${SITE_URL}/og.png`;

  const browserPath = typeof window !== "undefined" ? window.location.pathname : "";
  // Same article/media/verse path in every language (never per-document ids).
  const pathSuffix = browserPath.replace(/^\/(rw|en|sw|fr)(?=\/|$)/, "");
  const pageUrl = url || `${SITE_URL}/${lang}${pathSuffix}`;

  const ogLocale = OG_LOCALES[lang] || "en_US";

  const isoDate =
    toIso(article?.publishDate) ||
    toIso(article?.createdAt) ||
    (typeof article?.date === "string" ? toIso(article.date) : undefined);

  const metadata = article?.metaDescription || {};
  const author = metadata.author || SITE_NAME;

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = pageTitle;
    document.documentElement.lang = lang;

    upsertMeta("name", "description", pageDesc);
    upsertMeta("name", "keywords", pageKeywords);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "author", author);

    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", pageDesc);
    upsertMeta("property", "og:image", pageImage);
    upsertMeta("property", "og:url", pageUrl);
    upsertMeta("property", "og:type", article ? "article" : "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", ogLocale);

    document.head.querySelector('meta[property="article:published_time"]')?.remove();
    if (article && isoDate) {
      upsertMeta("property", "article:published_time", isoDate);
    }

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", pageDesc);
    upsertMeta("name", "twitter:image", pageImage);

    upsertLink("canonical", pageUrl);
    for (const code of LOCALES) {
      upsertLink("alternate", `${SITE_URL}/${code}${pathSuffix}`, code);
    }
    upsertLink("alternate", `${SITE_URL}/rw${pathSuffix}`, "x-default");

    upsertJsonLd({
      "@context": "https://schema.org",
      "@type": article ? "NewsArticle" : "WebSite",
      name: SITE_NAME,
      headline: pageTitle,
      description: pageDesc,
      image: pageImage,
      url: pageUrl,
      author: { "@type": "Person", name: author },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      datePublished: isoDate,
      dateModified: isoDate,
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      inLanguage: lang,
      keywords: typeof pageKeywords === "string" ? pageKeywords.split(",") : [],
    });
  });

  return null;
};

export default SEOHead;
