import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load variables
dotenv.config();

// Helper to get env variables safely in Node
const getEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    console.warn(`⚠️ Warning: ${key} is not defined in environment variables.`);
  }
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
  // Guard clause: Don't initialize Firebase if config is broken
  if (!firebaseConfig.apiKey) {
    console.error("❌ Critical Error: Firebase API Key is missing. Skipping sitemap generation.");
    process.exit(1); 
  }

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const staticPages = ['', '/donate', '/terms', '/privacy'];
    
    // Fetch articles
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articles = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const dateSource = data.updatedAt || data.createdAt || { seconds: Date.now() / 1000 };
      
      articles.push({
        id: doc.id,
        lastMod: new Date(dateSource.seconds * 1000).toISOString().split('T')[0]
      });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(path => `
    <url>
      <loc>${BASE_URL}${path}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
    </url>`).join('')}
  ${articles.map(article => `
    <url>
      <loc>${BASE_URL}/article/${article.id}</loc>
      <lastmod>${article.lastMod}</lastmod>
      <changefreq>monthly</changefreq>
    </url>`).join('')}
</urlset>`;

    // Ensure public folder exists (Vite projects usually have it, but just in case)
    if (!fs.existsSync('./public')) {
      fs.mkdirSync('./public');
    }

    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log('✅ Sitemap generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();