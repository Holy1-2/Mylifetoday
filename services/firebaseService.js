import { db, auth } from '../config/firebaseConfig';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  deleteDoc,
  increment,
  orderBy,
  getCountFromServer,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';

export const articlesCollection = collection(db, 'articles');
export const categoriesCollection = collection(db, 'categories');
export const subscriptionsCollection = collection(db, 'subscriptions');
export const commentsCollection = collection(db, 'comments');
export const usersCollection = collection(db, 'users');
export const mediaCollection = collection(db, 'media');

const PAGE_SIZE_DEFAULT = 24;

// Bounded scan: avoids composite-index requirements and still returns legacy
// documents that have no `status`/`createdAt` fields.
const ARTICLE_FETCH_LIMIT = 1200;

// Older admin saves inserted "This content is being prepared in X." placeholders
// instead of leaving a locale empty. Treat them as empty so the UI falls back to
// a real language and never prints the placeholder on the public site.
const PLACEHOLDER_RE =
  /^(this content is being prepared in\b.*|article coming soon(\s*\(.*\))?|content coming soon|coming soon)$/i;

const plainForCheck = (text) =>
  String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const isPlaceholderText = (text) =>
  typeof text === 'string' && PLACEHOLDER_RE.test(plainForCheck(text));

const LOCALIZED_ARTICLE_FIELDS = [
  'title',
  'situation',
  'verse',
  'teaching',
  'practice',
  'prayer',
  'closure',
];

const stripPlaceholderLocalized = (record) => {
  if (!record || typeof record !== 'object') return record;
  return Object.fromEntries(
    Object.entries(record).map(([code, text]) => [
      code,
      isPlaceholderText(text) ? '' : text,
    ])
  );
};

export const slugify = (text = '') =>
  String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120);

export const articleSortTime = (article) => {
  const raw =
    article?.createdAt || article?.publishDate || article?.date || article?.updatedAt;
  if (!raw) return 0;
  try {
    if (typeof raw === 'number') {
      const ms = raw < 1e12 ? raw * 1000 : raw;
      return Number.isFinite(ms) ? ms : 0;
    }
    if (typeof raw === 'object' && typeof raw.seconds === 'number') {
      return raw.seconds * 1000;
    }
    if (typeof raw?.toDate === 'function') {
      const d = raw.toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d.getTime() : 0;
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch {
    return 0;
  }
};

export const isPublished = (article) =>
  !article?.status || article.status === 'published';

/** Adds a slug fallback (doc id) so every article always has a usable URL. */
export const normalizeArticle = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    ...data,
    id: docSnap.id,
    slug: data.slug || docSnap.id,
    ...LOCALIZED_ARTICLE_FIELDS.reduce((clean, field) => {
      clean[field] = stripPlaceholderLocalized(data[field]);
      return clean;
    }, {}),
  };
};

export const getArticles = async (
  category = null,
  _lastDoc = null,
  itemsPerPage = null,
  includeNonPublished = false
) => {
  const pageSize =
    typeof itemsPerPage === 'number' && itemsPerPage > 0
      ? itemsPerPage
      : PAGE_SIZE_DEFAULT;

  const snapshot = await getDocs(query(articlesCollection, limit(ARTICLE_FETCH_LIMIT)));
  let all = snapshot.docs
    .map(normalizeArticle)
    .filter((a) => (includeNonPublished ? true : isPublished(a)))
    .sort((a, b) => articleSortTime(b) - articleSortTime(a));

  if (category) all = all.filter((a) => a.category === category);

  return {
    articles: all.slice(0, pageSize),
    all,
    hasMore: all.length > pageSize,
  };
};

/** Every published article — used by the home page, search and related lists. */
export const getAllPublishedArticles = async () => {
  const { all } = await getArticles(null, null, ARTICLE_FETCH_LIMIT, false);
  return all;
};

export const getArticleById = async (id) => {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, 'articles', id));
  return snapshot.exists() ? normalizeArticle(snapshot) : null;
};

export const getArticleBySlug = async (slug) => {
  if (!slug) return null;
  try {
    const q = query(articlesCollection, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return normalizeArticle(snapshot.docs[0]);
  } catch (err) {
    console.warn('Slug query failed:', err?.message);
  }
  // Legacy articles may not have a slug yet — fall back to the document id.
  return getArticleById(slug);
};

/** Accepts a slug or a document id. */
export const getArticleBySlugOrId = getArticleBySlug;

const scoreArticle = (article, term, lang) => {
  const langs = [lang, 'en', 'rw', 'sw', 'fr'];
  const titles = langs.map((l) => article.title?.[l] || '').join(' ');
  const situations = langs.map((l) => article.situation?.[l] || '').join(' ');
  const teachings = langs.map((l) => article.teaching?.[l] || '').join(' ');
  const tags = Array.isArray(article.tags) ? article.tags.join(' ') : '';

  const t = titles.toLowerCase();
  const s = situations.toLowerCase();
  const teach = teachings.toLowerCase();
  const tg = tags.toLowerCase();

  let score = 0;
  if (t.includes(term)) score += 12;
  if (tg.includes(term)) score += 8;
  if (s.includes(term)) score += 4;
  if (teach.includes(term)) score += 2;
  return score;
};

/**
 * Search over the loaded catalogue. Never throws because of a missing index,
 * missing language field or a malformed query.
 */
export const searchArticles = async (searchTerm, lang = 'rw', maxResults = 60) => {
  const term = String(searchTerm || '').trim().toLowerCase();
  if (!term) return [];

  let articles = [];
  try {
    articles = await getAllPublishedArticles();
  } catch (err) {
    console.warn('Search catalogue load failed:', err?.message);
    return [];
  }

  const words = term.split(/\s+/).filter(Boolean);
  return articles
    .map((article) => {
      const base = scoreArticle(article, term, lang);
      const wordsScore = words.reduce(
        (sum, w) => sum + (scoreArticle(article, w, lang) > 0 ? 1 : 0),
        0
      );
      return { article, score: base + wordsScore };
    })
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || articleSortTime(b.article) - articleSortTime(a.article)
    )
    .slice(0, maxResults)
    .map((r) => r.article);
};

export const ensureUniqueSlugAndSave = async (articleId, titleOrCandidate) => {
  if (!articleId) return null;
  const base = slugify(String(titleOrCandidate || articleId)) || articleId;
  let candidate = base;
  let counter = 0;
  while (counter < 50) {
    const q = query(articlesCollection, where('slug', '==', candidate), limit(1));
    const snap = await getDocs(q);
    if (snap.empty || snap.docs[0].id === articleId) {
      try {
        await updateDoc(doc(db, 'articles', articleId), { slug: candidate });
      } catch (err) {
        console.error('Failed to persist slug:', err);
      }
      return candidate;
    }
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return articleId;
};

export const addArticle = async (articleData) => {
  const docRef = await addDoc(articlesCollection, {
    ...articleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    views: 0,
    likes: 0,
    shares: 0,
  });
  const slug = await ensureUniqueSlugAndSave(
    docRef.id,
    articleData.title?.rw || articleData.title?.en || docRef.id
  );
  return { id: docRef.id, slug };
};

export const updateArticle = async (id, updates) => {
  return updateDoc(doc(db, 'articles', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const incrementArticleViews = async (id) => {
  if (!id) return;
  const todayKey = new Date().toISOString().split('T')[0];
  try {
    await updateDoc(doc(db, 'articles', id), {
      views: increment(1),
      [`viewsByDay.${todayKey}`]: increment(1),
      lastViewedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('View increment failed:', err?.message);
  }
};

/* ------------------------------ Comments ------------------------------ */

export const addComment = async (articleId, comment) => {
  const text = String(comment?.text || '').trim();
  const author = String(comment?.author || 'Guest').trim().slice(0, 80);

  if (!articleId) throw new Error('Missing article id');
  if (text.length < 2) throw new Error('Comment is too short');
  if (text.length > 1000) throw new Error('Comment must be at most 1000 characters');
  if (/https?:\/\/|www\./i.test(text)) throw new Error('Links are not allowed in comments');

  return addDoc(commentsCollection, {
    ...comment,
    author: author || 'Guest',
    text,
    articleId,
    status: 'approved',
    createdAt: serverTimestamp(),
  });
};

export const getCommentsByArticle = async (articleId) => {
  try {
    const q = query(
      commentsCollection,
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => !c.status || ['approved', 'visible'].includes(c.status));
  } catch (err) {
    try {
      const snapshot = await getDocs(
        query(commentsCollection, where('articleId', '==', articleId), limit(100))
      );
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => !c.status || ['approved', 'visible'].includes(c.status))
        .sort((a, b) => articleSortTime(b) - articleSortTime(a));
    } catch (fallbackErr) {
      console.warn('Comments load failed:', fallbackErr?.message);
      return [];
    }
  }
};

export const getCategories = async () => {
  try {
    const snapshot = await getDocs(categoriesCollection);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
};

export const getArticlesByCategory = (category, lastDoc = null, itemsPerPage = null) =>
  getArticles(category, lastDoc, itemsPerPage, false);

export const deleteArticle = async (id) => deleteDoc(doc(db, 'articles', id));

/* ---------------------------- Subscriptions --------------------------- */

export const addSubscription = async (email, name = '') => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address');
  }
  if (cleanEmail.length > 254) throw new Error('Email address is too long');

  const existing = await getDocs(
    query(subscriptionsCollection, where('email', '==', cleanEmail), limit(1))
  );
  if (!existing.empty) throw new Error('This email is already subscribed');

  return addDoc(subscriptionsCollection, {
    email: cleanEmail,
    name: String(name || '').trim().slice(0, 120),
    subscribedAt: serverTimestamp(),
    status: 'active',
    type: 'free',
  });
};

export const getSubscriptions = async () => {
  const snapshot = await getDocs(
    query(subscriptionsCollection, orderBy('subscribedAt', 'desc'), limit(1000))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/* ------------------------------- Auth -------------------------------- */

export const loginUser = async (email, password) => {
  const credential = await signInWithEmailAndPassword(
    auth,
    String(email || '').trim(),
    password
  );
  return credential.user;
};

export const registerUser = async (email, password, displayName = '') => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    String(email || '').trim(),
    password
  );
  const user = credential.user;
  const name = String(displayName || '').trim().slice(0, 80);
  if (name) {
    try {
      await updateProfile(user, { displayName: name });
    } catch (err) {
      console.warn('Profile name update failed:', err?.message);
    }
  }
  try {
    await setDoc(
      doc(usersCollection, user.uid),
      {
        email: user.email,
        displayName: name,
        role: 'user',
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('User profile write failed:', err?.message);
  }
  return user;
};

export const logoutUser = () => signOut(auth);

export const resetUserPassword = (email) =>
  sendPasswordResetEmail(auth, String(email || '').trim());

export const observeAuth = (callback) => onAuthStateChanged(auth, callback);

/* -------------------------- Journal (private) ------------------------- */

const journalCollection = (uid) => collection(db, 'users', uid, 'journal');
const savedArticlesCollection = (uid) => collection(db, 'users', uid, 'savedArticles');
const savedVersesCollection = (uid) => collection(db, 'users', uid, 'savedVerses');

const mapDocs = (snapshot) => snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

export const getJournalEntries = async (uid, type = null) => {
  if (!uid) return [];
  try {
    const snap = await getDocs(query(journalCollection(uid), limit(500)));
    const entries = mapDocs(snap).sort(
      (a, b) => articleSortTime(b) - articleSortTime(a)
    );
    return type ? entries.filter((e) => e.type === type) : entries;
  } catch (err) {
    console.warn('Journal load failed:', err?.message);
    return [];
  }
};

export const addJournalEntry = async (uid, entry) => {
  if (!uid) throw new Error('Please sign in first');
  const text = String(entry?.text || '').trim();
  if (text.length < 2) throw new Error('Please write something first');
  if (text.length > 5000) throw new Error('Entry is too long (5000 characters max)');

  const docRef = await addDoc(journalCollection(uid), {
    type: entry.type || 'reflection',
    title: String(entry.title || '').trim().slice(0, 160),
    text,
    reference: String(entry.reference || '').trim().slice(0, 120),
    answered: !!entry.answered,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateJournalEntry = async (uid, entryId, updates) => {
  if (!uid || !entryId) throw new Error('Missing entry');
  const clean = { updatedAt: serverTimestamp() };
  if (updates.title !== undefined) clean.title = String(updates.title).slice(0, 160);
  if (updates.text !== undefined) clean.text = String(updates.text).slice(0, 5000);
  if (updates.reference !== undefined) clean.reference = String(updates.reference).slice(0, 120);
  if (updates.answered !== undefined) clean.answered = !!updates.answered;
  return updateDoc(doc(db, 'users', uid, 'journal', entryId), clean);
};

export const deleteJournalEntry = async (uid, entryId) => {
  if (!uid || !entryId) return;
  return deleteDoc(doc(db, 'users', uid, 'journal', entryId));
};

/* --------------------------- Saved articles -------------------------- */

export const getSavedArticles = async (uid) => {
  if (!uid) return [];
  try {
    const snap = await getDocs(query(savedArticlesCollection(uid), limit(300)));
    return mapDocs(snap).sort((a, b) => articleSortTime(b) - articleSortTime(a));
  } catch (err) {
    console.warn('Saved articles load failed:', err?.message);
    return [];
  }
};

export const saveArticleForUser = async (uid, article, lang = 'rw') => {
  if (!uid) throw new Error('Please sign in first');
  if (!article?.id) throw new Error('Missing article');
  await setDoc(doc(db, 'users', uid, 'savedArticles', article.id), {
    articleId: article.id,
    slug: article.slug || article.id,
    title: article.title?.[lang] || article.title?.en || '',
    situation: article.situation?.[lang] || '',
    image: article.image || '',
    category: article.category || '',
    savedAt: serverTimestamp(),
  });
};

export const removeSavedArticle = async (uid, articleId) => {
  if (!uid || !articleId) return;
  return deleteDoc(doc(db, 'users', uid, 'savedArticles', articleId));
};

/* ---------------------------- Saved verses -------------------------- */

export const getSavedVerses = async (uid) => {
  if (!uid) return [];
  try {
    const snap = await getDocs(query(savedVersesCollection(uid), limit(300)));
    return mapDocs(snap).sort((a, b) => articleSortTime(b) - articleSortTime(a));
  } catch (err) {
    console.warn('Saved verses load failed:', err?.message);
    return [];
  }
};

export const saveVerseForUser = async (uid, verse) => {
  if (!uid) throw new Error('Please sign in first');
  if (!verse?.reference) throw new Error('Missing verse');
  const key = slugify(
    `${verse.reference.en || verse.reference.rw || 'verse'}-${verse.id || ''}`
  );
  await setDoc(doc(db, 'users', uid, 'savedVerses', key || verse.id || 'verse'), {
    verseId: verse.id || '',
    reference: verse.reference,
    text: verse.text,
    savedAt: serverTimestamp(),
  });
};

export const removeSavedVerse = async (uid, verseKey) => {
  if (!uid || !verseKey) return;
  return deleteDoc(doc(db, 'users', uid, 'savedVerses', verseKey));
};

/* ------------------------------- Media ------------------------------- */

export const getMediaItems = async (includeNonPublished = false) => {
  try {
    const snap = await getDocs(query(mediaCollection, limit(500)));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((m) => includeNonPublished || !m.status || m.status === 'published')
      .sort((a, b) => articleSortTime(b) - articleSortTime(a));
  } catch (err) {
    console.warn('Media load failed:', err?.message);
    return [];
  }
};

export const addMediaItem = async (item) =>
  addDoc(mediaCollection, {
    ...item,
    createdAt: serverTimestamp(),
  });

export const deleteMediaItem = async (id) => deleteDoc(doc(db, 'media', id));

export const getMediaItemById = async (id) => {
  if (!id) return null;
  try {
    const snap = await getDoc(doc(db, 'media', id));
    if (!snap.exists()) return null;
    const item = { id: snap.id, ...snap.data() };
    if (item.status && item.status !== 'published') return null;
    return item;
  } catch (err) {
    console.warn('Media item load failed:', err?.message);
    return null;
  }
};

const mediaLikesCollection = collection(db, 'mediaLikes');

export const getMediaLikeCount = async (mediaId) => {
  if (!mediaId) return 0;
  try {
    const snap = await getCountFromServer(
      query(mediaLikesCollection, where('mediaId', '==', mediaId))
    );
    return snap.data().count;
  } catch {
    return 0;
  }
};

export const getMediaLiked = async (mediaId, uid) => {
  if (!mediaId || !uid) return false;
  try {
    const snap = await getDoc(doc(db, 'mediaLikes', `${mediaId}_${uid}`));
    return snap.exists();
  } catch {
    return false;
  }
};

export const setMediaLiked = async (mediaId, uid, liked) => {
  if (!mediaId || !uid) return;
  const likeId = `${mediaId}_${uid}`;
  if (liked) {
    await setDoc(doc(db, 'mediaLikes', likeId), {
      mediaId,
      uid,
      createdAt: serverTimestamp(),
    });
  } else {
    await deleteDoc(doc(db, 'mediaLikes', likeId));
  }
};

/* --------------------------- Verse of the day --------------------------- */

export const dailyVersesCollection = collection(db, 'dailyVerses');

const asLocalized = (value) =>
  typeof value === 'string'
    ? { rw: value, en: value, sw: value, fr: value }
    : value || { rw: '', en: '', sw: '', fr: '' };

const normalizeDailyVerse = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    ...data,
    id: docSnap.id,
    text: asLocalized(data.text),
    reference: asLocalized(data.reference),
  };
};

/** Published daily verses, newest first. Bounded scan avoids index requirements. */
export const getDailyVerses = async (max = 60) => {
  try {
    const snap = await getDocs(query(dailyVersesCollection, limit(max)));
    return snap.docs
      .map(normalizeDailyVerse)
      .filter((v) => !v.status || v.status === 'published')
      .sort(
        (a, b) =>
          String(b.date || '').localeCompare(String(a.date || '')) ||
          articleSortTime(b) - articleSortTime(a)
      );
  } catch (err) {
    console.warn('Daily verses load failed:', err?.message);
    return [];
  }
};

const siteSettingsDoc = doc(db, 'settings', 'site');

export const getSiteSettings = async () => {
  try {
    const snap = await getDoc(siteSettingsDoc);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('Site settings load failed:', err?.message);
    return null;
  }
};
