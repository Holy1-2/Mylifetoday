import { useEffect } from "react";
import { isHttpsUrl, mediaPreviewImage, youtubeId } from "../utils/media";

const SITE_NAME = "Kubanan'Imana";
const SITE_URL = "https://kubananimana.rw";
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

const localized = (record, lang) =>
  record && typeof record === "object" ? String(record[lang] || "").trim() : "";

const articleLocales = (article) => {
  const available = LOCALES.filter((locale) => localized(article?.title, locale));
  return available.length ? available : ["rw"];
};

const toIso = (value) => {
  if (!value) return undefined;
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : typeof value?.seconds === "number"
        ? new Date(value.seconds * 1000)
        : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const upsertMeta = (attribute, key, content) => {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector(selector);
  if (content === undefined || content === null || content === "") {
    if (existing) existing.remove();
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
  const managed = [...document.head.querySelectorAll('script[type="application/ld+json"][data-seo-jsonld="true"]')];
  let script = managed[0];
  if (!script) {
    script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-seo", "true");
    script.setAttribute("data-seo-jsonld", "true");
    document.head.appendChild(script);
  }
  for (const duplicate of managed.slice(1)) duplicate.remove();
  script.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
};

const mediaSchema = ({ media, title, description, url, image, lang }) => {
  if (!media) return null;
  const type = media.type === "podcast" ? "audio" : media.type;
  const schemaType =
    type === "youtube" || type === "video"
      ? "VideoObject"
      : type === "audio"
        ? "AudioObject"
        : type === "image"
          ? "ImageObject"
          : "Article";
  const preview = mediaPreviewImage(media);
  const contentUrl = isHttpsUrl(media.url) ? media.url : "";
  const videoId = youtubeId(media.url);
  const common = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: title,
    name: title,
    description,
    url,
    inLanguage: lang,
    image: image ? [image] : [],
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  if (schemaType === "ImageObject") {
    return {
      ...common,
      contentUrl: isHttpsUrl(media.url) ? media.url : image,
      caption: title,
    };
  }

  if (schemaType === "AudioObject" || schemaType === "VideoObject") {
    return {
      ...common,
      ...(preview ? { thumbnailUrl: preview } : {}),
      ...(contentUrl ? { contentUrl } : {}),
      ...(videoId ? { embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` } : {}),
      ...(toIso(media.createdAt) ? { uploadDate: toIso(media.createdAt) } : {}),
      ...(media.author ? { author: { "@type": "Person", name: media.author } } : {}),
    };
  }

  return {
    ...common,
    ...(toIso(media.createdAt) ? { datePublished: toIso(media.createdAt) } : {}),
    ...(media.author ? { author: { "@type": "Person", name: media.author } } : {}),
  };
};

const SEOHead = ({
  title = "",
  description = "",
  keywords = "",
  article = null,
  media = null,
  lang = "rw",
  url = "",
  image = "",
  robots = "index, follow",
  hreflangs = null,
}) => {
  const defaultTitle = "Kubanan'Imana — Muri Kristo Honyine";
  const defaultDesc =
    "Inyigisho n'ubuyobozi bushingiye ku Ijambo ry'Imana ku buzima bwa buri munsi: umubano, amafaranga, akazi, amahoro y'umutima, n'iterambere mu by'umwuka.";
  const defaultKeywords =
    "Ubukristu, Bibiliya, isengesho, kwizera, ubuzima bwa buri munsi, amahoro y'umutima, inama z'Imana";

  const availableLocales = article ? articleLocales(article) : LOCALES;
  const sourceLocale = availableLocales.includes("rw") ? "rw" : availableLocales[0];
  const translated = !article || availableLocales.includes(lang);
  const contentLocale = article && !translated ? sourceLocale : lang;
  const articleTitle = localized(article?.title, contentLocale) || localized(article?.title, "en") || localized(article?.title, "rw");
  const articleDescription = localized(article?.situation, contentLocale) || localized(article?.situation, "en") || localized(article?.situation, "rw");

  const pageTitle = articleTitle ? `${articleTitle} | ${SITE_NAME}` : title || defaultTitle;
  const pageDesc = article
    ? plainText(articleDescription).slice(0, 300) || description || defaultDesc
    : description || defaultDesc;
  const metadata = article?.metaDescription || {};
  const keywordValue = metadata.keywords || keywords || defaultKeywords;
  const pageKeywords = Array.isArray(keywordValue) ? keywordValue.join(", ") : String(keywordValue);
  const author = metadata.author || article?.authorName || article?.editor || SITE_NAME;

  const articleImage = article?.featuredImage || article?.image || "";
  const rawImage = image || articleImage || (media ? mediaPreviewImage(media) : "");
  const pageImage =
    rawImage && (isHttpsUrl(rawImage) || String(rawImage).startsWith("/"))
      ? rawImage
      : `${SITE_URL}/og.png`;

  const browserPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const requestedUrl = url || browserPath;
  const pathSuffix = new URL(requestedUrl, SITE_URL).pathname.replace(/^\/(rw|en|sw|fr)(?=\/|$)/, "") || "/";
  const pageUrl = article
    ? !translated
      ? `${SITE_URL}/${sourceLocale}${pathSuffix}`
      : url || `${SITE_URL}/${contentLocale}${pathSuffix}`
    : url || `${SITE_URL}/${lang}${pathSuffix}`;
  const effectiveRobots = !translated ? "noindex, follow" : robots;
  const ogLocale = OG_LOCALES[lang] || "en_US";

  const isoPublished =
    toIso(article?.publishDate) ||
    toIso(article?.createdAt) ||
    toIso(article?.date);
  const isoModified = toIso(article?.updatedAt) || isoPublished;

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = pageTitle;
    document.documentElement.lang = lang;

    upsertMeta("name", "description", pageDesc);
    upsertMeta("name", "keywords", pageKeywords);
    upsertMeta("name", "robots", effectiveRobots);
    upsertMeta("name", "author", author);

    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", pageDesc);
    upsertMeta("property", "og:image", pageImage);
    upsertMeta("property", "og:url", pageUrl);
    upsertMeta("property", "og:type", article || media ? "article" : "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", ogLocale);

    upsertMeta("property", "article:published_time", article ? isoPublished : "");
    upsertMeta("property", "article:modified_time", article ? isoModified : "");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", pageDesc);
    upsertMeta("name", "twitter:image", pageImage);

    upsertLink("canonical", pageUrl);
    const alternates = hreflangs === null ? availableLocales : hreflangs;
    const desired = new Set();
    for (const code of alternates) {
      desired.add(code);
      upsertLink("alternate", `${SITE_URL}/${code}${pathSuffix}`, code);
    }
    const defaultCode = hreflangs === null ? sourceLocale : "rw";
    if (alternates.length) {
      desired.add("x-default");
      upsertLink("alternate", `${SITE_URL}/${defaultCode}${pathSuffix}`, "x-default");
    }
    for (const link of document.head.querySelectorAll('link[rel="alternate"][hreflang]')) {
      if (!desired.has(link.getAttribute("hreflang"))) link.remove();
    }

    const publisher = {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    };
    const schema = article
      ? {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: pageTitle,
          description: pageDesc,
          image: [pageImage],
          url: pageUrl,
          author: { "@type": "Person", name: author },
          publisher,
          datePublished: isoPublished,
          dateModified: isoModified,
          mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
          inLanguage: contentLocale,
          keywords: pageKeywords.split(",").map((word) => word.trim()).filter(Boolean),
        }
      : media
        ? mediaSchema({ media, title: pageTitle, description: pageDesc, url: pageUrl, image: pageImage, lang })
        : url
          ? {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              description: pageDesc,
              url: pageUrl,
              inLanguage: lang,
              publisher,
            }
          : null;

    if (schema) upsertJsonLd(schema);
  });

  return null;
};

export default SEOHead;
