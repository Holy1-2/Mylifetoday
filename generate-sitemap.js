import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key) => process.env[key];

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

const BASE_URL = 'https://kubananimanaburimunsi.vercel.app';
const LOCALES = ['rw', 'en', 'sw', 'fr'];
const DEFAULT_LOCALE = 'rw';
const SITE_NAME = "Kubanan'Imana";

const SITEMAP_PATHS = [
  path.resolve('./public/sitemap.xml'),
  path.resolve('./dist/sitemap.xml'),
];
const CACHE_PATH = path.resolve('./data/articles-cache.json');
const DIST_DIR = path.resolve('./dist');

const STATIC_ROUTES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/media', priority: '0.7', changefreq: 'weekly' },
  { path: '/verse', priority: '0.8', changefreq: 'daily' },
  { path: '/donate', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

// App routes that only need to be reachable; no article content to prerender.
const SHELL_ROUTES = ['/search', '/journal', '/account', '/signin', '/signup'];

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const escapeXml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const stripHtml = (value) =>
  String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

// Legacy placeholder copy must never reach the prerendered HTML or meta tags.
// Saves stored it as HTML ("<p>This&nbsp;content&nbsp;is&nbsp;being…</p>").
const PLACEHOLDER_RE =
  /^(this content is being prepared in\b.*|article coming soon(\s*\(.*\))?|content coming soon|coming soon)$/i;

const plainForCheck = (text) =>
  String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const isPlaceholder = (text) =>
  typeof text === 'string' && PLACEHOLDER_RE.test(plainForCheck(text));

const cleanLocalized = (record) => {
  if (!record || typeof record !== 'object') return {};
  return Object.fromEntries(
    Object.entries(record).map(([code, text]) => [code, isPlaceholder(text) ? '' : text])
  );
};

const truncate = (value, max = 200) => {
  const text = stripHtml(value);
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
};

const toDate = (value) => {
  if (!value) return null;
  try {
    if (typeof value === 'object' && typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
    if (typeof value === 'object' && typeof value.toDate === 'function') {
      return value.toDate();
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const isoDay = (date) => (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

const isPublished = (data) => !data.status || data.status === 'published';

const pick = (record, lang) => {
  if (!record || typeof record !== 'object') return '';
  return record[lang] || record.en || record.rw || '';
};

const buildSitemapXml = (articles) => {
  const today = isoDay(new Date());

  const staticUrls = STATIC_ROUTES.flatMap((route) =>
    LOCALES.map((locale) => {
      const alternates = LOCALES.map(
        (alt) =>
          `    <xhtml:link rel="alternate" hreflang="${alt}" href="${BASE_URL}/${alt}${route.path}" />`
      ).join('\n');
      return `  <url>
    <loc>${BASE_URL}/${locale}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/${DEFAULT_LOCALE}${route.path}" />
  </url>`;
    })
  );

  const articleUrls = articles.flatMap((article) =>
    LOCALES.map((locale) => {
      const alternates = LOCALES.map(
        (alt) =>
          `    <xhtml:link rel="alternate" hreflang="${alt}" href="${BASE_URL}/${alt}/articles/${encodeURI(article.slug)}" />`
      ).join('\n');
      return `  <url>
    <loc>${BASE_URL}/${locale}/articles/${encodeURI(article.slug)}</loc>
    <lastmod>${article.lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/${DEFAULT_LOCALE}/articles/${encodeURI(article.slug)}" />
  </url>`;
    })
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticUrls, ...articleUrls].join('\n')}
</urlset>`;
};

const writeSitemap = (xml) => {
  if (!fs.existsSync('./public')) fs.mkdirSync('./public', { recursive: true });
  for (const target of SITEMAP_PATHS) {
    if (target.includes(`${path.sep}dist${path.sep}`) && !fs.existsSync(DIST_DIR)) continue;
    fs.writeFileSync(target, xml);
  }
  console.log(`✅ Sitemap generated (${(xml.match(/<url>/g) || []).length} URLs)`);
};

/* ------------------------------ prerender ------------------------------ */

const buildHead = ({ title, description, url, alternates, image, type, article }) => {
  const links = alternates
    .map((alt) => `<link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`)
    .join('\n    ');

  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        description,
        image: image ? [image] : [],
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        inLanguage: article.lang,
        author: { '@type': 'Person', name: article.author || 'Editorial Desk' },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
        inLanguage: 'rw',
      };

  return `    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    ${links}
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(
      alternates.find((a) => a.lang === DEFAULT_LOCALE)?.href || url
    )}" />
    <meta property="og:type" content="${type || 'website'}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
};

const SSR_STYLES = `<style>
  #root .ssr-page{max-width:720px;margin:0 auto;padding:48px 20px;font-family:Raleway,system-ui,sans-serif;color:#1c1917;line-height:1.75}
  #root .ssr-page h1{font-family:Raleway,system-ui,sans-serif;font-size:34px;line-height:1.2;margin:12px 0 16px}
  #root .ssr-page h2{font-family:Raleway,system-ui,sans-serif;font-size:22px;margin:28px 0 10px}
  #root .ssr-page p{margin:0 0 14px}
  #root .ssr-page .ssr-kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#b45309;font-weight:600}
  #root .ssr-page img{max-width:100%;border-radius:16px}
  #root .ssr-page blockquote{margin:20px 0;padding:16px 20px;background:#1c1917;color:#fafaf9;border-radius:16px;font-family:Raleway,system-ui,sans-serif}
  #root .ssr-page a{color:#b45309}
  #root .ssr-page .ssr-nav{padding:16px 20px;border-bottom:1px solid #e7e5e4;font-size:14px}
</style>`;

const articleHtml = (article, lang) => {
  const labels = {
    rw: { teaching: 'Inyigisho', read: 'Soma iyi ngingo' },
    en: { teaching: 'Teaching', read: 'Read this article' },
    sw: { teaching: 'Mafundisho', read: 'Soma makala hii' },
    fr: { teaching: 'Enseignement', read: 'Lire cet article' },
  }[lang] || { teaching: 'Teaching', read: 'Read this article' };

  const title = pick(article.title, lang);
  const situation = stripHtml(pick(article.situation, lang));
  const teaching = pick(article.teaching, lang); // sanitised client-side at runtime; strip tags here
  const verse = stripHtml(pick(article.verse, lang));

  return `<div class="ssr-page">
  <div class="ssr-nav"><strong>${escapeHtml(SITE_NAME)}</strong></div>
  <article>
    <p class="ssr-kicker">${escapeHtml(article.category || '')}</p>
    <h1>${escapeHtml(title)}</h1>
    ${situation ? `<p><strong>${escapeHtml(situation)}</strong></p>` : ''}
    ${article.image ? `<p><img src="${escapeHtml(article.image)}" alt="${escapeHtml(title)}" /></p>` : ''}
    ${verse ? `<blockquote>${escapeHtml(verse)}</blockquote>` : ''}
    <h2>${escapeHtml(labels.teaching)}</h2>
    <p>${escapeHtml(stripHtml(teaching))}</p>
    <p><a href="${BASE_URL}/${lang}/articles/${encodeURI(article.slug)}">${escapeHtml(labels.read)}</a></p>
  </article>
</div>`;
};

const staticHtml = (lang, title, description) => `<div class="ssr-page">
  <div class="ssr-nav"><strong>${escapeHtml(SITE_NAME)}</strong></div>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p><a href="${BASE_URL}/${lang}">${escapeHtml(SITE_NAME)}</a></p>
</div>`;

const injectPage = (template, head, body, lang = DEFAULT_LOCALE) =>
  template
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<link\s+rel="alternate"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
    .replace('</head>', `${SSR_STYLES}\n${head}\n  </head>`)
    .replace(/<div id="root">\s*<\/div>/, `<div id="root">${body}</div>`);

const writePage = (relativePath, html) => {
  const target = path.join(DIST_DIR, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
};

const absoluteImage = (image) => {
  if (!image) return '';
  return /^https?:\/\//i.test(image)
    ? image
    : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

const prerender = (template, articles) => {
  let pages = 0;
  const today = new Date().toISOString();

  const renderStatic = (route, title, description) => {
    for (const lang of LOCALES) {
      const url = `${BASE_URL}/${lang}${route}`;
      const alternates = LOCALES.map((alt) => ({ lang: alt, href: `${BASE_URL}/${alt}${route}` }));
      const head = buildHead({
        title: `${title} | ${SITE_NAME}`,
        description,
        url,
        alternates,
        image: `${BASE_URL}/og.png`,
      });
      writePage(
        path.join(lang, route ? `${route.slice(1)}.html` : 'index.html'),
        injectPage(template, head, staticHtml(lang, title, description), lang)
      );
      pages += 1;
    }
  };

  renderStatic(
    '',
    SITE_NAME,
    "Inyigisho n'ubuyobozi bushingiye ku Ijambo ry'Imana ku buzima bwa buri munsi: umubano, amafaranga, akazi, amahoro y'umutima n'iterambere mu by'umwuka."
  );
  renderStatic('/media', 'Media library', "Videos, audio, images and quote cards from Kubanan'Imana.");
  renderStatic('/verse', 'Verse of the Day', 'A Bible verse chosen for today, shareable as a branded image.');
  renderStatic('/donate', 'Support our mission', "Support the digital ministry behind Kubanan'Imana.");
  renderStatic('/privacy', 'Privacy Policy', 'How we collect, use and protect your data.');
  renderStatic('/terms', 'Terms of Service', 'Terms that govern the use of this platform.');

  for (const route of SHELL_ROUTES) {
    for (const lang of LOCALES) {
      const head = buildHead({
        title: `${SITE_NAME}`,
        description: "Kubanan'Imana — Muri Kristo Honyine",
        url: `${BASE_URL}/${lang}${route}`,
        alternates: LOCALES.map((alt) => ({ lang: alt, href: `${BASE_URL}/${alt}${route}` })),
      });
      writePage(path.join(lang, `${route.slice(1)}.html`), injectPage(template, head, '', lang));
      pages += 1;
    }
  }

  for (const article of articles) {
    for (const lang of LOCALES) {
      const title = pick(article.title, lang) || pick(article.title, DEFAULT_LOCALE) || 'Article';
      const description =
        truncate(pick(article.situation, lang) || pick(article.situation, DEFAULT_LOCALE)) ||
        `${title} — ${SITE_NAME}`;
      const url = `${BASE_URL}/${lang}/articles/${encodeURI(article.slug)}`;
      const alternates = LOCALES.map((alt) => ({
        lang: alt,
        href: `${BASE_URL}/${alt}/articles/${encodeURI(article.slug)}`,
      }));
      const head = buildHead({
        title: `${title} | ${SITE_NAME}`,
        description,
        url,
        alternates,
        image: absoluteImage(article.image) || `${BASE_URL}/og.png`,
        type: 'article',
        article: {
          lang,
          datePublished: article.createdAt,
          dateModified: article.updatedAt,
          author: article.authorName || article.editor,
        },
      });
      const safeSlug = String(article.slug).replace(/[\\/:*?"<>|#%]/g, '-');
      writePage(
        path.join(lang, 'articles', `${safeSlug}.html`),
        injectPage(template, head, articleHtml(article, lang), lang)
      );
      pages += 1;
    }
  }

  // Root has no language prefix; send visitors and crawlers to the default locale.
  writePage(
    'index.html',
    `<!DOCTYPE html>
<html lang="${DEFAULT_LOCALE}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(SITE_NAME)}</title>
  <link rel="canonical" href="${BASE_URL}/${DEFAULT_LOCALE}" />
  <meta http-equiv="refresh" content="0; url=/${DEFAULT_LOCALE}" />
  <script>window.location.replace('/${DEFAULT_LOCALE}');</script>
</head>
<body>
  <p><a href="/${DEFAULT_LOCALE}">${escapeHtml(SITE_NAME)}</a></p>
</body>
</html>`
  );

  console.log(`✅ Prerendered ${pages} static HTML pages`);
};

const normalizeArticle = (id, data) => {
  const created =
    toDate(data.publishDate) || toDate(data.createdAt) || toDate(data.date) || toDate(data.updatedAt) || new Date();
  const updated = toDate(data.updatedAt) || created;
  return {
    id,
    slug: (data.slug && String(data.slug).trim()) || id,
    lastMod: isoDay(updated),
    createdAt: isoDay(created),
    updatedAt: isoDay(updated),
    category: data.category || '',
    image: data.image || data.featuredImage || '',
    authorName: data.authorName || data.editor || '',
    title: cleanLocalized(data.title),
    situation: cleanLocalized(data.situation),
    verse: cleanLocalized(data.verse),
    teaching: cleanLocalized(data.teaching),
    practice: cleanLocalized(data.practice),
    prayer: cleanLocalized(data.prayer),
  };
};

async function generate() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  const template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf-8') : null;

  if (!firebaseConfig.apiKey) {
    console.warn('⚠️ Firebase API Key is missing.');
    if (fs.existsSync(CACHE_PATH)) {
      try {
        const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        const articles = cached.map((entry, index) => normalizeArticle(entry.id || entry.slug || `cached-${index}`, entry));
        writeSitemap(buildSitemapXml(articles));
        if (template) prerender(template, articles);
        return;
      } catch (error) {
        console.warn('⚠️ Cached articles invalid:', error.message);
      }
    }
    writeSitemap(buildSitemapXml([]));
    if (template) prerender(template, []);
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'articles'));

    const articles = [];
    const cache = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!isPublished(data)) return;
      const article = normalizeArticle(docSnap.id, data);
      articles.push(article);
      cache.push({
        id: article.id,
        slug: article.slug,
        lastMod: article.lastMod,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        category: article.category,
        image: article.image,
        authorName: article.authorName,
        title: article.title,
        situation: article.situation,
        verse: article.verse,
        teaching: article.teaching,
        practice: article.practice,
        prayer: article.prayer,
      });
    });

    articles.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

    console.log(`📚 Found ${articles.length} published articles (${snapshot.size} total).`);
    writeSitemap(buildSitemapXml(articles));

    try {
      fs.mkdirSync(path.resolve('./data'), { recursive: true });
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    } catch (error) {
      console.warn('⚠️ Could not write articles cache:', error.message);
    }

    if (template) prerender(template, articles);
    else console.warn('⚠️ dist/index.html not found — run vite build before this script to prerender.');
  } catch (error) {
    console.error('❌ Firebase fetch failed:', error.message);
    if (fs.existsSync(CACHE_PATH)) {
      try {
        const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        const articles = cached.map((entry, index) => normalizeArticle(entry.id || entry.slug || `cached-${index}`, entry));
        writeSitemap(buildSitemapXml(articles));
        if (template) prerender(template, articles);
        console.log('✅ Falling back to cached article data.');
        return;
      } catch (cacheError) {
        console.warn('⚠️ Cached articles invalid:', cacheError.message);
      }
    }
    writeSitemap(buildSitemapXml([]));
    if (template) prerender(template, []);
  }
}

generate();
