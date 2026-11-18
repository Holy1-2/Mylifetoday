import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import {
  addJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  getSavedArticles,
  getSavedVerses,
  removeSavedArticle,
  removeSavedVerse,
  saveArticleForUser,
  saveVerseForUser,
  updateJournalEntry,
} from '../services/firebaseService';
import type {
  Article,
  JournalEntry,
  Language,
  SavedArticleSnapshot,
  SavedVerse,
  Verse,
} from '../types';
import { slugify } from '../services/firebaseService';

interface JournalContextValue {
  ready: boolean;
  entries: JournalEntry[];
  savedArticles: SavedArticleSnapshot[];
  savedVerses: SavedVerse[];
  isArticleSaved: (articleId: string) => boolean;
  isVerseSaved: (verse: Verse) => boolean;
  toggleArticle: (article: Article, lang: Language) => Promise<void>;
  toggleVerse: (verse: Verse) => Promise<void>;
  removeArticle: (articleId: string) => Promise<void>;
  removeVerse: (verseKey: string) => Promise<void>;
  createEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  editEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const JournalContext = createContext<JournalContextValue | null>(null);

const verseKeyOf = (verse: Verse) =>
  slugify(`${verse.reference.en || verse.reference.rw || 'verse'}-${verse.id}`);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedArticleSnapshot[]>([]);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setSavedArticles([]);
      setSavedVerses([]);
      setReady(true);
      return;
    }
    setReady(false);
    const [nextEntries, nextArticles, nextVerses] = await Promise.all([
      getJournalEntries(user.uid),
      getSavedArticles(user.uid),
      getSavedVerses(user.uid),
    ]);
    setEntries(nextEntries);
    setSavedArticles(nextArticles);
    setSavedVerses(nextVerses);
    setReady(true);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const isArticleSaved = useCallback(
    (articleId: string) => savedArticles.some((a) => a.id === articleId),
    [savedArticles]
  );

  const isVerseSaved = useCallback(
    (verse: Verse) => savedVerses.some((v) => v.id === verseKeyOf(verse)),
    [savedVerses]
  );

  const toggleArticle = useCallback(
    async (article: Article, lang: Language) => {
      if (!user) throw new Error('AUTH_REQUIRED');
      if (isArticleSaved(article.id)) {
        await removeSavedArticle(user.uid, article.id);
        setSavedArticles((prev) => prev.filter((a) => a.id !== article.id));
        toast.success('Removed from saved articles');
        return;
      }
      await saveArticleForUser(user.uid, article, lang);
      setSavedArticles((prev) => [
        {
          id: article.id,
          articleId: article.id,
          slug: article.slug || article.id,
          title: article.title?.[lang] || article.title?.en || '',
          situation: article.situation?.[lang] || '',
          image: article.image || '',
          category: article.category || '',
        },
        ...prev,
      ]);
      toast.success('Saved to your journal');
    },
    [user, isArticleSaved]
  );

  const toggleVerse = useCallback(
    async (verse: Verse) => {
      if (!user) throw new Error('AUTH_REQUIRED');
      const key = verseKeyOf(verse);
      if (isVerseSaved(verse)) {
        await removeSavedVerse(user.uid, key);
        setSavedVerses((prev) => prev.filter((v) => v.id !== key));
        toast.success('Verse removed');
        return;
      }
      await saveVerseForUser(user.uid, verse);
      setSavedVerses((prev) => [
        {
          id: key,
          verseId: verse.id,
          reference: verse.reference,
          text: verse.text,
        },
        ...prev,
      ]);
      toast.success('Verse saved to your journal');
    },
    [user, isVerseSaved]
  );

  const removeArticle = useCallback(
    async (articleId: string) => {
      if (!user) return;
      await removeSavedArticle(user.uid, articleId);
      setSavedArticles((prev) => prev.filter((a) => a.id !== articleId));
    },
    [user]
  );

  const removeVerse = useCallback(
    async (verseKey: string) => {
      if (!user) return;
      await removeSavedVerse(user.uid, verseKey);
      setSavedVerses((prev) => prev.filter((v) => v.id !== verseKey));
    },
    [user]
  );

  const createEntry = useCallback(
    async (entry: Omit<JournalEntry, 'id'>) => {
      if (!user) throw new Error('AUTH_REQUIRED');
      const id = await addJournalEntry(user.uid, entry);
      setEntries((prev) => [{ ...entry, id }, ...prev]);
    },
    [user]
  );

  const editEntry = useCallback(
    async (id: string, updates: Partial<JournalEntry>) => {
      if (!user) return;
      await updateJournalEntry(user.uid, id, updates);
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    },
    [user]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteJournalEntry(user.uid, id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [user]
  );

  const value = useMemo(
    () => ({
      ready,
      entries,
      savedArticles,
      savedVerses,
      isArticleSaved,
      isVerseSaved,
      toggleArticle,
      toggleVerse,
      removeArticle,
      removeVerse,
      createEntry,
      editEntry,
      removeEntry,
      refresh: load,
    }),
    [
      ready,
      entries,
      savedArticles,
      savedVerses,
      isArticleSaved,
      isVerseSaved,
      toggleArticle,
      toggleVerse,
      removeArticle,
      removeVerse,
      createEntry,
      editEntry,
      removeEntry,
      load,
    ]
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};

export const useJournal = () => {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used inside JournalProvider');
  return ctx;
};
