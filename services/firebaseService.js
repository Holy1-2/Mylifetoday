import { db } from '../config/firebaseConfig';
import { collection, query, where, limit, getDocs, doc, updateDoc } from 'firebase/firestore';
import { addDoc, serverTimestamp, getDoc, deleteDoc, increment, orderBy } from 'firebase/firestore';

// Articles Collection
export const articlesCollection = collection(db, 'articles');
export const categoriesCollection = collection(db, 'categories');
export const subscriptionsCollection = collection(db, 'subscriptions');
export const commentsCollection = collection(db, 'comments');
export const usersCollection = collection(db, 'users');

// Article Operations
// ...existing code...
export const getArticles = async (category = null, lastDoc = null, itemsPerPage = null) => {
  // build query constraints conditionally so we only use `limit` when requested
  const constraints = [];

  if (category) {
    constraints.push(where('category', '==', category));
  }

  // Always order by createdAt for deterministic ordering
  constraints.push(orderBy('createdAt', 'desc'));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  if (typeof itemsPerPage === 'number' && itemsPerPage > 0) {
    constraints.push(limit(itemsPerPage));
  }

  const q = query(articlesCollection, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

export const searchArticles = async (searchTerm) => {
  const articles = await getArticles();
  return articles.filter(article => {
    const searchableText = `${article.title.en || ''} ${article.title.fr || ''} ${article.title.rw || ''} ${article.title.sw || ''} ${article.situation.en || ''} ${article.situation.fr || ''} ${article.situation.rw || ''} ${article.situation.sw || ''} ${article.teaching.en || ''} ${article.teaching.fr || ''} ${article.teaching.rw || ''} ${article.teaching.sw || ''}`.toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });
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
      // persist slug to the article
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

// Increment views (atomic)
export const incrementArticleViews = async (id) => {
  const docRef = doc(db, 'articles', id);
  return await updateDoc(docRef, {
    views: increment(1)
  });
};

// Comments
export const addComment = async (articleId, comment) => {
  return await addDoc(commentsCollection, {
    ...comment,
    articleId,
    createdAt: serverTimestamp()
  });
};

export const getCommentsByArticle = async (articleId) => {
  const q = query(commentsCollection, where('articleId', '==', articleId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteArticle = async (id) => {
  const docRef = doc(db, 'articles', id);
  return await deleteDoc(docRef);
};

// Subscription Operations
export const addSubscription = async (email, name = '') => {
  return await addDoc(subscriptionsCollection, {
    email,
    name,
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
  const snapshot = await getDocs(subscriptionsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};