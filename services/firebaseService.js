import { db, auth } from '../config/firebaseConfig';
import { collection, query, where, limit, getDocs, doc, updateDoc, startAfter } from 'firebase/firestore';
import { addDoc, serverTimestamp, getDoc, deleteDoc, increment, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Articles Collection
export const articlesCollection = collection(db, 'articles');
export const categoriesCollection = collection(db, 'categories');
export const subscriptionsCollection = collection(db, 'subscriptions');
export const commentsCollection = collection(db, 'comments');
export const usersCollection = collection(db, 'users');

const PAGE_SIZE_DEFAULT = 20;

// Cap for the in-memory published scan. This works without configuring
// composite Firestore indexes and also returns documents that lack the
// `createdAt` field (which a plain ORDER BY query would silently drop).
const ARTICLE_FETCH_LIMIT = 1000;

// Human/firestore-safe sort key used when we sort published articles in memory.
const articleSortTime = (article) => {
  const raw = article?.createdAt || article?.publishDate || article?.date || article?.updatedAt;
  if (!raw) return 0;
  try {
    if (typeof raw === 'number') {
      const ms = raw < 1e12 ? raw * 1000 : raw;
      return Number.isFinite(ms) ? ms : 0;
    }
    if (typeof raw === 'object' && typeof raw.seconds === 'number') {
      return raw.seconds * 1000;
    }
    if (typeof raw.toDate === 'function') {
      const d = raw.toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d.getTime() : 0;
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch {
    return 0;
  }
};

const isIndexError = (err) =>
  !!err && (err.code === 'failed-precondition' || /requires an index/i.test(err?.message || ''));

/**
 * Fetch articles, newest first. By default only published articles are returned.
 *
 * To avoid Firestore composite-index requirements (and documents missing
 * `createdAt` being silently excluded from ORDER BY results), we fetch with a
 * simple single-field predicate (automatic index) and sort in memory.
 *
 * @param {string|null} category
 * @param {object|null} lastDoc
 * @param {number|null} itemsPerPage
 * @param {boolean} includeNonPublished
 * @returns {Promise<{articles: Array<import('../types').Article>, lastDoc: object|null, hasMore: boolean}>}
 */
export const getArticles = async (category = null, lastDoc = null, itemsPerPage = null, includeNonPublished = false) => {
  const pageSize = (typeof itemsPerPage === 'number' && itemsPerPage > 0) ? itemsPerPage : PAGE_SIZE_DEFAULT;
  const constraints = [];

  if (!includeNonPublished) {
    constraints.push(where('status', '==', 'published'));
  }

  if (category) {
    constraints.push(where('category', '==', category));
  }

  constraints.push(limit(ARTICLE_FETCH_LIMIT));

  let snapshot;
  try {
    snapshot = await getDocs(query(articlesCollection, ...constraints));
  } catch (err) {
    if (isIndexError(err) && category) {
      // Combined equality filters (status + category) need their own composite
      // index; fall back to fetching published articles and filtering by category.
      const q = query(articlesCollection, where('status', '==', 'published'), limit(ARTICLE_FETCH_LIMIT));
      snapshot = await getDocs(q);
    } else {
      throw err;
    }
  }

  const all = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(a => a && a.id)
    .sort((a, b) => articleSortTime(b) - articleSortTime(a));

  const paged = category ? all.filter(a => a.category === category) : all;
  const results = paged.slice(0, pageSize);

  return {
    articles: results,
    lastDoc: null,
    hasMore: paged.length > pageSize,
  };
};

export const getArticleById = async (id) => {
  const docRef = doc(db, 'articles', id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};
export const getArticleBySlug = async (slug) => {
  if (!slug) return null;
  const q = query(articlesCollection, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

// Server-filtered search that avoids pulling the entire collection.
// Firestore cannot do full-text search, so we do a bounded range query on the
// requested language's title. For production-scale full-text search,
// connect an external index (Algolia / Meilisearch / Typesense).
export const searchArticles = async (searchTerm, lang = 'en', maxResults = 30) => {
  const term = String(searchTerm || '').trim();
  if (!term) return [];

  const termLower = term.toLowerCase();
  const results = [];
  const fields = [`title.${lang}`, `situation.${lang}`];
  for (const field of fields) {
    if (results.length >= maxResults) break;
    try {
      const q = query(
        articlesCollection,
        where('status', '==', 'published'),
        where(field, '>=', termLower),
        where(field, '<=', termLower + '\uf8ff'),
        orderBy(field),
        limit(maxResults - results.length)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(docSnap => {
        const doc = { id: docSnap.id, ...docSnap.data() };
        if (!results.some(r => r.id === doc.id)) results.push(doc);
      });
    } catch (e) {
      // Composite index may be required on title{lang}/status — fall back to a bounded page scan
      console.warn('Field search failed, falling back to title scan:', e.message);
    }
  }

  // Fallback: bounded scan of recent published articles. Uses only the
  // automatic single-field index on `status`, so it works before composite
  // indexes are created in the console.
  if (results.length === 0) {
    try {
      const q = query(
        articlesCollection,
        where('status', '==', 'published'),
        limit(500)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(docSnap => {
        const article = { id: docSnap.id, ...docSnap.data() };
        const searchableText = [
          article.title?.[lang] || '', article.title?.en || '',
          article.situation?.[lang] || '', article.situation?.en || '',
          article.tags ? article.tags.join(' ') : ''
        ].join(' ').toLowerCase();
        if (searchableText.includes(termLower) && results.length < maxResults) {
          results.push(article);
        }
      });
    } catch (e) {
      console.warn('Search fallback scan failed:', e.message);
    }
  }

  return results;
};

const slugify = (text = '') => {
  return text
    .toString()
    .normalize('NFKD') // remove diacritics
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alnum with hyphen
    .replace(/^-+|-+$/g, '') // trim hyphens
    .substring(0, 120);
};
export const ensureUniqueSlugAndSave = async (articleId, titleOrCandidate) => {
  if (!articleId) return null;
  const base = slugify(String(titleOrCandidate || articleId));
  let candidate = base || articleId;
  let counter = 0;
  // loop until unique or safety limit
  while (counter < 50) {
    const q = query(articlesCollection, where('slug', '==', candidate), limit(1));
    const snap = await getDocs(q);
    // if no document OR the found doc is the same articleId we can use candidate
    if (snap.empty || (snap.docs[0].id === articleId)) {
      try {
        const docRef = doc(db, 'articles', articleId);
        await updateDoc(docRef, { slug: candidate });
      } catch (err) {
        console.error('Failed to persist slug:', err);
      }
      return candidate;
    }
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  try {
    const docRef = doc(db, 'articles', articleId);
    await updateDoc(docRef, { slug: articleId });
  } catch (err) { /* ignore */ }
  return articleId;
};

export const addArticle = async (articleData) => {
  const docRef = await addDoc(articlesCollection, {
    ...articleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    views: 0,
    likes: 0,
    shares: 0
  });
  // Generate and set slug after adding
  const slug = await ensureUniqueSlugAndSave(docRef.id, articleData.title?.rw || articleData.title?.en || docRef.id);
  return docRef;
};

export const updateArticle = async (id, updates) => {
  const docRef = doc(db, 'articles', id);
  return await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Increment views (atomic) and track per-day breakdown for accurate "today's views"
export const incrementArticleViews = async (id) => {
  const docRef = doc(db, 'articles', id);
  const todayKey = new Date().toISOString().split('T')[0];
  return await updateDoc(docRef, {
    views: increment(1),
    [`viewsByDay.${todayKey}`]: increment(1),
    lastViewedAt: serverTimestamp()
  });
};

// Comments
export const addComment = async (articleId, comment) => {
  const text = String(comment?.text || '').trim();
  const author = String(comment?.author || 'Guest').trim().slice(0, 80);

  if (!articleId) throw new Error('Missing article id');
  if (text.length < 2) throw new Error('Comment is too short');
  if (text.length > 1000) throw new Error('Comment must be at most 1000 characters');
  if (/https?:\/\/|www\./i.test(text)) throw new Error('Links are not allowed in comments');

  return await addDoc(commentsCollection, {
    ...comment,
    author: author || 'Guest',
    text,
    articleId,
    status: 'pending',
    createdAt: serverTimestamp()
  });
};

export const getCommentsByArticle = async (articleId) => {
  const q = query(
    commentsCollection,
    where('articleId', '==', articleId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  // Legacy comments have no status -> still visible. Only exclude blocked/moderated ones.
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(c => !c.status || c.status === 'approved' || c.status === 'visible');
};

export const getCategories = async () => {
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getArticlesByCategory = async (category, lastDoc = null, itemsPerPage = null) => {
  return getArticles(category, lastDoc, itemsPerPage, false);
};

export const deleteArticle = async (id) => {
  const docRef = doc(db, 'articles', id);
  return await deleteDoc(docRef);
};

// Subscription Operations
export const addSubscription = async (email, name = '') => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address');
  }
  if (cleanEmail.length > 254) {
    throw new Error('Email address is too long');
  }

  // Reject duplicates so the same email only appears once.
  const existingQuery = query(subscriptionsCollection, where('email', '==', cleanEmail), limit(1));
  const existing = await getDocs(existingQuery);
  if (!existing.empty) {
    throw new Error('This email is already subscribed');
  }

  return await addDoc(subscriptionsCollection, {
    email: cleanEmail,
    name: String(name || '').trim().slice(0, 120),
    subscribedAt: serverTimestamp(),
    status: 'active',
    type: 'free'
  });
};

// Authentication
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getSubscriptions = async () => {
  const snapshot = await getDocs(limit(query(subscriptionsCollection, orderBy('subscribedAt', 'desc')), 1000));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};