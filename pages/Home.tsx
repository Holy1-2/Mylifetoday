import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Eye } from 'lucide-react';
import { getAllPublishedArticles, getDailyVerses, getMediaItems } from '../services/firebaseService';
import type { Article, DailyVerse, MediaItem } from '../types';
import { Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { pickLiveVerse } from '../utils/verseOfDay';
import { mediaPreviewImage } from '../utils/media';
import ArticleCard from '../components/ArticleCard';
import CategoryCarousel from '../components/CategoryCarousel';
import NewsletterForm from '../components/NewsletterForm';
import SEOHead from '../components/SEOHead';

const Home = () => {
  const { lang, t, categoryName } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(9);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [list, items, verses] = await Promise.all([
          getAllPublishedArticles(),
          getMediaItems(),
          getDailyVerses(10),
        ]);
        if (!active) return;
        setArticles(list);
        setMedia((items as MediaItem[]).slice(0, 3));
        setDailyVerse(pickLiveVerse(verses));
      } catch (error) {
        console.error(error);
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const featured = useMemo(
    () => articles.find((a) => a.featured) || articles[0],
    [articles]
  );
  const list = useMemo(
    () => articles.filter((a) => a.id !== featured?.id),
    [articles, featured]
  );
  const sidebarArticles = useMemo(() => list.slice(0, 3), [list]);
  const trending = useMemo(
    () =>
      [...articles]
        .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
        .slice(0, 4),
    [articles]
  );

  const categories = useMemo(() => Object.values(Category), []);
  const counts = useMemo(() => {
    const map = {} as Record<string, number>;
    articles.forEach((a) => {
      map[a.category] = (map[a.category] || 0) + 1;
    });
    return map;
  }, [articles]);

  return (
    <>
      <SEOHead
        lang={lang}
        title={t('heroTitle')}
        description={t('heroSubtitle')}
        url={`https://kubananimana.rw/${lang}`}
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="space-y-10">
            <div className="aspect-video bg-gray-200 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="h-4 bg-gray-200 w-3/4" />
                  <div className="h-3 bg-gray-200 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        ) : failed ? (
          <div className="border border-black/10 bg-gray-50 p-10 text-center">
            <p className="text-sm text-gray-600">{t('error')}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="border border-black/10 bg-gray-50 p-10 text-center">
            <p className="text-sm text-gray-600">{t('noResults')}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3 min-w-0">
              {featured && <ArticleCard article={featured} variant="featured" />}

              <h3 className="mt-12 mb-8 text-xs font-black uppercase tracking-[0.4em] text-gray-400">
                {t('latestArticles')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {list.slice(0, itemsToShow).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="row" showCategory={false} />
                ))}
              </div>

              <div className="mt-10 flex flex-col items-center gap-4">
                {list.length > itemsToShow ? (
                  <button
                    type="button"
                    onClick={() => setItemsToShow((n) => n + 6)}
                    className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    <BookOpen size={14} />
                    {t('loadMore')}
                  </button>
                ) : (
                  list.length > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t('allLoaded')}
                    </span>
                  )
                )}
              </div>
            </div>

            <aside className="lg:w-1/3 lg:pl-12 lg:border-l border-black/10">
              <div className="lg:sticky lg:top-24 space-y-12">
                {/* Verse of the day */}
                {dailyVerse && (
                  <Link to={`/${lang}/verse`} className="group block bg-[#1a1a1a] text-white p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-4">
                      {t('verseOfDay')}
                    </p>
                    <blockquote className="font-serif text-2xl leading-snug">
                      “{dailyVerse.text[lang] || dailyVerse.text.rw}”
                    </blockquote>
                    <p className="mt-4 text-sm font-bold text-red-500">
                      {dailyVerse.reference[lang] || dailyVerse.reference.rw}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                      {t('shareAsImage')}
                      <ArrowRight size={12} />
                    </span>
                  </Link>
                )}

                {/* Quick categories */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-3">
                    {t('quickCategories')}
                  </h4>
                  <div className="space-y-1">
                    {categories.slice(0, 6).map((category) => (
                      <Link
                        key={category}
                        to={`/${lang}/search?category=${category}`}
                        className="w-full p-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-sm font-bold">{categoryName(category)}</span>
                        <span className="text-xs text-gray-400 group-hover:text-black">
                          {counts[category] || 0}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Daily bread feed */}
                {sidebarArticles.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-4">
                      {t('dailyBreadFeed')}
                    </h4>
                    <div className="space-y-5">
                      {sidebarArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} variant="row" showCategory={false} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter */}
                <div className="bg-black text-white p-6 shadow-xl">
                  <h4 className="text-xl font-bold mb-2 font-serif">{t('newsletterTitle')}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">
                    {t('newsletterSubtitle')}
                  </p>
                  <NewsletterForm compact />
                </div>
              </div>
            </aside>
          </div>
        )}

        {!loading && (
          <CategoryCarousel counts={counts} />
        )}

        {!loading && media.length > 0 && (
          <section className="mt-16 pt-12 border-t border-black/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-2">
                  {t('media')}
                </h4>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                  {t('mediaHighlights')}
                </h2>
              </div>
              <Link
                to={`/${lang}/media`}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
              >
                {t('exploreMedia')}
                <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {media.map((item) => {
                const preview = mediaPreviewImage(item);
                return (
                <Link
                  key={item.id}
                  to={`/${lang}/media/${item.id}`}
                  className="group flex gap-4 border-b border-black/10 pb-5"
                >
                  <div className="w-24 h-24 shrink-0 overflow-hidden bg-black grid place-items-center text-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : item.type === 'quote' ? (
                      <p className="line-clamp-4 px-2 font-serif text-xs leading-snug text-white/90">
                        “{item.text}”
                      </p>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                        {t(item.type)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-red-600">
                      {t(item.type)}
                    </p>
                    <h3 className="mt-1 font-bold font-serif leading-tight group-hover:underline line-clamp-2">
                      {item.title}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                      {t('exploreMedia')}
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
                );
              })}
            </div>
          </section>
        )}

        {!loading && trending.length > 0 && (
          <section className="mt-16 pt-12 border-t border-black/10">
            <div className="mb-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-2">
                {t('trending')}
              </h4>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                {t('trendingArticles')}
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {trending.map((article) => {
                const title =
                  article.title?.[lang] || article.title?.en || article.title?.rw || 'Untitled';
                const image =
                  article.image || article.featuredImage || article.gallery?.[0] || '';
                return (
                  <Link
                    key={article.id}
                    to={`/${lang}/articles/${article.slug || article.id}`}
                    className="group relative aspect-square overflow-hidden bg-[#1a1a1a]"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : null}
                    <span className="absolute left-3 top-3 bg-red-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                      {categoryName(article.category)}
                    </span>
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 bg-black/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/80">
                      <Eye size={11} />
                      {(Number(article.views) || 0).toLocaleString()}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-4 pt-12 sm:px-5 sm:pb-5 sm:pt-16">
                      <h3 className="font-serif text-base font-bold leading-tight text-white line-clamp-3 group-hover:underline sm:text-xl">
                        {title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Home;
