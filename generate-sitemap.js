import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load variables
dotenv.config();

const getEnv = (key) => {
  const value = process.env[key];
  if (!value) console.warn(`⚠️ Warning: ${key} is not defined.`);
  return value;
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

async function generateSitemap() {
  if (!firebaseConfig.apiKey) {
    console.error("❌ Firebase API Key is missing.");
    process.exit(1);
  }

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const locales = ['rw', 'en', 'fr'];
    const staticPages = ['', '/donate', '/terms', '/privacy'];

    // Fetch articles from Firestore
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articles = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Handle timestamps correctly
      const dateSource = data.updatedAt || data.createdAt || { seconds: Date.now() / 1000 };
      const formattedDate = new Date(dateSource.seconds * 1000).toISOString().split('T')[0];

      // Logic using your 'slug' field
      if (data.slug) {
        articles.push({
          slug: data.slug.trim(), // Remove any accidental spaces
          lastMod: formattedDate
        });
      } else {
        console.warn(`⚠️ Article ID ${doc.id} is missing a 'slug' field. Skipping.`);
      }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.flatMap(path => locales.map(locale => `
    <url>
      <loc>${BASE_URL}/${locale}${path}</loc>
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

    // Save to the public folder
    if (!fs.existsSync('./public')) {
      fs.mkdirSync('./public');
    }

    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log(`✅ Success! Sitemap generated with ${articles.length} articles.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateSitemap();