import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load variables
dotenv.config();

const getEnv = (key) => {
  return process.env[key];
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

const BASE_URL = 'https://kubananimanaburimunsi.vercel.app';
const SITEMAP_PATH = path.resolve('./public/sitemap.xml');
const CACHE_PATH = path.resolve('./data/articles-cache.json');

const buildSitemapXml = (articles) => {
  const locales = ['rw', 'en', 'fr'];
  const staticPages = ['', '/donate', '/terms', '/privacy'];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.flatMap(page => locales.map(locale => `
    <url>
      <loc>${BASE_URL}/${locale}${page}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
    </url>`)).join('')}
  ${articles.flatMap(article => locales.map(locale => `
    <url>
      <loc>${BASE_URL}/${locale}/articles/${encodeURI(article.slug)}</loc>
      <lastmod>${article.lastMod}</lastmod>
      <changefreq>monthly</changefreq>
    </url>`)).join('')}
</urlset>`;
};

const writeSitemap = (xml) => {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }
  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`✅ Sitemap generated (${(xml.match(/<url>/g) || []).length} URLs)`);
};

async function generateSitemap() {
  // If Firebase credentials are missing, do not fall over silently;
  // keep the last generated sitemap if it exists, else emit static-only.
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase API Key is missing.");
    if (fs.existsSync(SITEMAP_PATH)) {
      console.log("Keeping existing sitemap.xml (cached).");
      return;
    }
    console.log("No cached sitemap; writing static-only sitemap.");
    writeSitemap(buildSitemapXml([]));
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Fetch articles from Firestore
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articles = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const dateSource = data.updatedAt || data.createdAt || { seconds: Date.now() / 1000 };
      const formattedDate = new Date(dateSource.seconds * 1000).toISOString().split('T')[0];

      if (data.slug) {
        articles.push({ slug: data.slug.trim(), lastMod: formattedDate });
      }
    });

    writeSitemap(buildSitemapXml(articles));

    // Cache a local copy so future builds survive Firebase outages
    try {
      fs.mkdirSync(path.resolve('./data'), { recursive: true });
      fs.writeFileSync(CACHE_PATH, JSON.stringify(articles, null, 2));
    } catch (err) {
      console.warn('⚠️ Could not write articles cache:', err.message);
    }
  } catch (error) {
    console.error('❌ Firebase fetch failed:', error.message);
    if (fs.existsSync(SITEMAP_PATH)) {
      console.log("Falling back to cached sitemap.xml — build continues.");
      return;
    }
    if (fs.existsSync(CACHE_PATH)) {
      try {
        const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        writeSitemap(buildSitemapXml(cached));
        return;
      } catch (e) {
        console.warn('⚠️ Cached articles invalid:', e.message);
      }
    }
    console.log("No cached sitemap; writing static-only sitemap.");
    writeSitemap(buildSitemapXml([]));
  }
}

generateSitemap();