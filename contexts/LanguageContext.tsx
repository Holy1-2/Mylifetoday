import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LANGUAGES, LOCALES, TRANSLATIONS } from '../constants';
import type { Category, Language } from '../types';

export const DEFAULT_LANG: Language = 'rw';

export const isLanguage = (value: string): value is Language =>
  LANGUAGES.some((l) => l.code === value);

export const parseLangFromPath = (pathname: string): Language => {
  const first = pathname.split('/').filter(Boolean)[0];
  return first && isLanguage(first) ? first : DEFAULT_LANG;
};

interface LanguageContextValue {
  lang: Language;
  locale: string;
  setLang: (next: Language) => void;
  t: (key: string) => string;
  categoryName: (category: Category | string) => string;
  dateLabel: (value: unknown) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const asDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value < 1e12 ? value * 1000 : value);
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = (value as { seconds: number }).seconds;
    return new Date(seconds * 1000);
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    try {
      const d = (value as { toDate: () => Date }).toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d : null;
    } catch {
      return null;
    }
  }
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = parseLangFromPath(location.pathname);

  const setLang = useCallback(
    (next: Language) => {
      const parts = location.pathname.split('/').filter(Boolean);
      if (parts.length === 0) {
        navigate(`/${next}${location.search}${location.hash}`);
        return;
      }
      if (isLanguage(parts[0])) {
        parts[0] = next;
      } else {
        parts.unshift(next);
      }
      navigate(`/${parts.join('/')}${location.search}${location.hash}`);
    },
    [location.pathname, location.search, location.hash, navigate]
  );

  const t = useCallback(
    (key: string) => {
      const entry = TRANSLATIONS.ui[key];
      if (!entry) return key;
      return entry[lang] || entry.en || key;
    },
    [lang]
  );

  const categoryName = useCallback(
    (category: Category | string) => {
      const entry = TRANSLATIONS.categories[category as Category];
      if (!entry) return String(category || '');
      return entry[lang] || entry.en || String(category);
    },
    [lang]
  );

  const dateLabel = useCallback(
    (value: unknown) => {
      const date = asDate(value);
      if (!date) return '';
      try {
        return new Intl.DateTimeFormat(LOCALES[lang], {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date);
      } catch {
        return date.toLocaleDateString();
      }
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, locale: LOCALES[lang], setLang, t, categoryName, dateLabel }),
    [lang, setLang, t, categoryName, dateLabel]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};
