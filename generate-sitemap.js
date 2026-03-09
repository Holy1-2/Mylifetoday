import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv'; // Add this

// Load environment variables from .env
dotenv.config();
// Paste your Firebase Config here (same as in your App)
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID
};

const BASE_URL = 'https://kubananimanaburimunsi.vercel.app';

async function generateSitemap() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // 1. Define Static Pages
  const staticPages = ['', '/donate', '/terms', '/privacy'];

  try {
    // 2. Fetch Dynamic Articles from Firebase
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articles = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        // Use your Firestore timestamp field name here (e.g., createdAt or updatedAt)
        lastMod: data.updatedAt?.seconds 
          ? new Date(data.updatedAt.seconds * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      });
    });

    // 3. Construct XML
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

    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log('✅ Sitemap generated successfully in /public');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();