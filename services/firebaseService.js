import { db } from '../config/firebaseConfig';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment
} from 'firebase/firestore';

// Articles Collection
export const articlesCollection = collection(db, 'articles');
export const categoriesCollection = collection(db, 'categories');
export const subscriptionsCollection = collection(db, 'subscriptions');
export const commentsCollection = collection(db, 'comments');
export const usersCollection = collection(db, 'users');

// Article Operations
export const getArticles = async (category = null, lastDoc = null, itemsPerPage = 10) => {
  let q = query(articlesCollection, orderBy('createdAt', 'desc'), limit(itemsPerPage));

  if (category) {
    q = query(articlesCollection, where('category', '==', category), orderBy('createdAt', 'desc'), limit(itemsPerPage));
  }

  if (lastDoc) {
    q = query(articlesCollection, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(itemsPerPage));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getArticleById = async (id) => {
  const docRef = doc(db, 'articles', id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const searchArticles = async (searchTerm) => {
  const articles = await getArticles();
  return articles.filter(article => {
    const searchableText = `${article.title.en || ''} ${article.title.fr || ''} ${article.title.rw || ''} ${article.title.sw || ''} ${article.situation.en || ''} ${article.situation.fr || ''} ${article.situation.rw || ''} ${article.situation.sw || ''} ${article.teaching.en || ''} ${article.teaching.fr || ''} ${article.teaching.rw || ''} ${article.teaching.sw || ''}`.toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });
};

export const addArticle = async (articleData) => {
  return await addDoc(articlesCollection, {
    ...articleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    views: 0,
    likes: 0,
    shares: 0
  });
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