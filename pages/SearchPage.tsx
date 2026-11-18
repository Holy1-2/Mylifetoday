import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { getAllPublishedArticles } from '../services/firebaseService';
import type { Article } from '../types';
import { Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { stripHtml } from '../utils/text';
import ArticleCard from '../components/ArticleCard';
import SEOHead from '../components/SEOHead';
import { BRAND } from '../constants';

const CATEGORY_VALUES = Object.values(Category);

const scoreArticle = (article: Article, term: string, lang: string) => {
  const titles = [lang, 'en', 'rw', 'sw', 'fr']
    .map((l) => article.title?.[l as keyof typeof article.title] || '')
    .join(' ')
    .toLowerCase();
  const situations = [lang, 'en', 'rw']
    .map((l) => stripHtml(article.situation?.[l as keyof typeof article.situation]))
    .join(' ')
    .toLowerCase();
  const tags = (article.tags || []).join(' ').toLowerCase();
  const teaching = stripHtml(article.teaching?.[lang as keyof typeof article.teaching]).toLowerCase();

  let score = 0;
  if (titles.includes(term)) score += 12;
  if (tags.includes(term)) score += 8;
  if (situations.includes(term)) score += 4;
  if (teaching.includes(term)) score += 2;
  return score;
};

const SearchPage = () => {
  const { lang, t, categoryName } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [catalogue, setCatalogue] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const queryParam = params.get('q') || '';
  const categoryParam = params.get('category') || '';
  const [term, setTerm] = useState(queryParam);

  useEffect(() => {
    setTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await getAllPublishedArticles();
        if (active) setCatalogue(list);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (term === queryParam) return;
      const next = new URLSearchParams(params);
      if (term.trim()) next.set('q', term.trim());
      else next.delete('q');
      setParams(next, { replace: true });
    }, 220);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const results = useMemo(() => {
    const clean = term.trim().toLowerCase();
    const words = clean.split(/\s+/).filter(Boolean);

    let list = catalogue;
    if (categoryParam) list = list.filter((a) => a.category === categoryParam);

    if (clean) {
      list = list
        .map((article) => {
          const base = scoreArticle(article, clean, lang);
          const wordHits = words.reduce(
            (sum, word) => sum + (scoreArticle(article, word, lang) > 0 ? 1 : 0),
            0
          );
          return { article, score: base + wordHits };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.article);
    }

    return list;
  }, [catalogue, term, categoryParam, lang]);

  const setCategory = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('category', value);
    else next.delete('category');
    setParams(next, { replace: true });
  };

  const chip = (active: boolean) =>
    `shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${
      active
        ? 'bg-black border-black text-white'
        : 'bg-white border-black/10 hover:border-black'
    }`;

  return (
    <>
      <SEOHead
        lang={lang}
        title={`${t('searchTitle')} | ${BRAND.name}`}
        description={t('searchSubtitle')}
        url={`${BRAND.siteUrl}/${lang}/search`}
      />

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">
          {t('searchTitle')}
        </h1>
        <p className="text-gray-600 max-w-xl">{t('searchSubtitle')}</p>

        <div className="relative mt-8 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            autoFocus
            className="w-full p-4 pl-12 pr-12 border-2 border-black rounded-none focus:outline-none focus:border-red-600 bg-white"
          />
          {term && (
            <button
              type="button"
              onClick={() => {
                setTerm('');
                const next = new URLSearchParams(params);
                next.delete('q');
                setParams(next, { replace: true });
              }}
              aria-label={t('clearSearch')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" onClick={() => setCategory('')} className={chip(!categoryParam)}>
            {t('all')}
          </button>
          {CATEGORY_VALUES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategory(category)}
              className={chip(categoryParam === category)}
            >
              {categoryName(category)}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="border-t border-black/10 pt-6 flex items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {term.trim() ? (
              <>
                {t('resultsFor')} <span className="text-black">“{term.trim()}”</span>
              </>
            ) : (
              t('latestArticles')
            )}
            {!loading && (
              <span className="ml-2 text-gray-400">
                {results.length} {t('resultCount')}
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-5 border-b border-black/10 pb-5">
                <div className="h-24 w-24 shrink-0 bg-gray-200 animate-pulse sm:h-28 sm:w-28" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-10 border border-black/10 bg-gray-50 px-6 py-16 text-center">
            <p className="text-xl font-black uppercase tracking-tighter">{t('noResults')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('searchEmptyHint')}</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} variant="row" />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;
