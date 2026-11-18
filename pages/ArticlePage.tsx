import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  Copy,
  Eye,
  Facebook,
  Heart,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Article, Comment } from '../types';
import {
  addComment,
  getAllPublishedArticles,
  getArticleBySlugOrId,
  getCommentsByArticle,
  incrementArticleViews,
  isPublished,
} from '../services/firebaseService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../contexts/JournalContext';
import { readingMinutes, truncate } from '../utils/text';
import SafeHTMLRenderer from '../components/SafeHTMLRenderer';
import MediaEmbed from '../components/MediaEmbed';
import ArticleCard from '../components/ArticleCard';
import SEOHead from '../components/SEOHead';
import { BRAND } from '../constants';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, categoryName, dateLabel } = useLanguage();
  const { user } = useAuth();
  const journal = useJournal();
  const location = useLocation();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const viewCounted = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    viewCounted.current = false;
    (async () => {
      try {
        const found = await getArticleBySlugOrId(slug || '');
        if (!active) return;
        if (!found || (!isPublished(found) && found.status !== undefined)) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setArticle(found);
        setLoading(false);

        if (!viewCounted.current) {
          const key = `viewed:${found.id}`;
          try {
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, '1');
              void incrementArticleViews(found.id);
            }
          } catch {
            /* ignore storage failures */
          }
          viewCounted.current = true;
        }

        void getCommentsByArticle(found.id).then((list) => {
          if (active) setComments(list as Comment[]);
        });

        const all = await getAllPublishedArticles();
        if (!active) return;
        setRelated(
          all
            .filter((item) => item.id !== found.id && item.category === found.category)
            .slice(0, 4)
        );
      } catch (error) {
        console.error(error);
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (user?.displayName) setAuthorName(user.displayName);
  }, [user]);

  const pick = (field: 'title' | 'situation' | 'verse' | 'teaching' | 'practice' | 'prayer') => {
    if (!article) return '';
    const record = article[field];
    if (!record) return '';
    return record[lang] || record.en || record.rw || '';
  };

  const minutes = useMemo(
    () => readingMinutes(pick('situation'), pick('teaching'), pick('practice')),
    [article, lang]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="h-4 w-32 bg-gray-200 animate-pulse" />
        <div className="mt-6 h-12 w-full bg-gray-200 animate-pulse" />
        <div className="mt-3 h-12 w-3/4 bg-gray-200 animate-pulse" />
        <div className="mt-8 aspect-video w-full bg-gray-200 animate-pulse" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <>
        <SEOHead lang={lang} title={`${t('error')} | ${BRAND.name}`} robots="noindex, follow" />
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter">{t('error')}</h1>
          <p className="mt-3 text-gray-600">{t('searchEmptyHint')}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 bg-[#1a1a1a] px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-red-600"
          >
            {t('retry')}
          </button>
        </div>
      </>
    );
  }

  if (notFound || !article) {
    return (
      <>
        <SEOHead
          lang={lang}
          title={`404 — ${t('pageNotFound')} | ${BRAND.name}`}
          description={t('searchEmptyHint')}
          robots="noindex, follow"
        />
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter">{t('pageNotFound')}</h1>
          <p className="mt-3 text-gray-600">{t('searchEmptyHint')}</p>
          <Link
            to={`/${lang}`}
            className="mt-6 inline-flex items-center gap-2 bg-[#1a1a1a] px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white"
          >
            <ArrowLeft size={14} />
            {t('goHome')}
          </Link>
        </div>
      </>
    );
  }

  const saved = journal.isArticleSaved(article.id);
  const pageUrl = `${BRAND.siteUrl}/${lang}/articles/${article.slug || article.id}`;
  const rawSituation = pick('situation');
  const rawTeaching = pick('teaching');
  const heroImage = article.image || article.featuredImage || '';
  const mediaList = [...(article.videos || []), ...(article.mediaEmbeds || [])].filter(Boolean);
  const gallery = (article.gallery || []).filter(Boolean);
  const audios = (article.audio || []).filter(Boolean);

  const toggleSave = async () => {
    if (!user) {
      navigate(`/${lang}/signin`, { state: { from: location.pathname } });
      return;
    }
    try {
      await journal.toggleArticle(article, lang);
    } catch {
      toast.error(t('error'));
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast.success(t('linkCopied'));
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(t('error'));
    }
  };

  const share = async (network: 'whatsapp' | 'facebook' | 'x') => {
    const title = pick('title');
    if (network === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${pageUrl}`)}`, '_blank');
      return;
    }
    if (network === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank');
      return;
    }
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`,
      '_blank'
    );
  };

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = commentText.trim();
    if (text.length < 2) return;
    setPosting(true);
    try {
      await addComment(article.id, { author: authorName.trim() || 'Guest', text });
      const list = await getCommentsByArticle(article.id);
      setComments(list as Comment[]);
      setCommentText('');
      toast.success(t('postComment'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error'));
    } finally {
      setPosting(false);
    }
  };

  const iconButton =
    'w-9 h-9 grid place-items-center border border-black/20 hover:border-black hover:bg-black hover:text-white transition-colors';

  return (
    <>
      <SEOHead
        lang={lang}
        article={article}
        title={`${pick('title')} | ${BRAND.name}`}
        description={truncate(rawSituation, 200)}
        url={pageUrl}
      />

      <article className="mx-auto max-w-4xl px-4 py-12 md:py-20 animate-in fade-in duration-500">
        <Link
          to={`/${lang}`}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:gap-4 transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t('home')}
        </Link>

        <header className="mt-10 mb-10 md:mb-12">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              {categoryName(article.category)}
            </span>
            <button
              type="button"
              onClick={toggleSave}
              className={`inline-flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                saved
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-black/20 hover:border-black'
              }`}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {saved ? t('saved') : t('save')}
            </button>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-serif leading-[1.05] tracking-tight mb-8">
            {pick('title')}
          </h1>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-y border-black py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-2">
                <User size={14} />
                {article.authorName || article.editor || t('editorialDesk')}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={14} />
                {dateLabel(article.publishDate || article.createdAt || article.date)}
              </span>
              <span className="flex items-center gap-2">
                <Eye size={14} />
                {article.views || 0}
              </span>
              <span>
                {minutes} {t('minRead')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={copyLink} aria-label={t('copyLink')} className={iconButton}>
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
              <button
                type="button"
                onClick={() => share('whatsapp')}
                aria-label={t('shareOnWhatsApp')}
                className={iconButton}
              >
                <MessageCircle size={14} />
              </button>
              <button
                type="button"
                onClick={() => share('facebook')}
                aria-label={t('shareOnFacebook')}
                className={iconButton}
              >
                <Facebook size={14} />
              </button>
              <button
                type="button"
                onClick={() => share('x')}
                aria-label={t('shareOnX')}
                className={iconButton}
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </header>

        <div className="article-body text-lg leading-8 text-gray-800">
          {rawSituation && (
            <section className="pb-10">
              <SafeHTMLRenderer html={rawSituation} />
            </section>
          )}

          {heroImage && (
            <figure className="hero-media my-8 rounded-2xl bg-black p-2 sm:p-3">
              <img
                src={heroImage}
                alt={pick('title')}
                className="block w-full h-auto object-cover"
                loading="eager"
              />
            </figure>
          )}

         

          {rawTeaching && (
            <section className="py-10 border-t border-gray-200">
              <SafeHTMLRenderer html={rawTeaching} />
            </section>
          )}
        </div>

        {(article.healthHacks?.length || article.herbalRemedies?.length) && (
          <section className="mt-4 border border-black/10 p-6">
            <h2 className="text-2xl font-bold font-serif">{t('healthSection')}</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {article.healthHacks?.length ? (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
                    {t('healthHacks')}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {article.healthHacks.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <Heart size={15} className="mt-0.5 shrink-0 text-red-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {article.herbalRemedies?.length ? (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
                    {t('herbalRemedies')}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {article.herbalRemedies.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <Sparkles size={15} className="mt-0.5 shrink-0 text-red-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <p className="mt-5 border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-500">
              {t('healthDisclaimer')}
            </p>
          </section>
        )}

        {gallery.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-5">{t('gallery')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setLightbox(src)}
                  className="aspect-square overflow-hidden bg-black"
                >
                  <img
                    src={src}
                    alt={`${pick('title')} ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {mediaList.length > 0 && (
          <section className="mt-12 space-y-5">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{t('video')}</h2>
            {mediaList.map((item, i) =>
              item.trim().startsWith('<') ? (
                <SafeHTMLRenderer key={i} html={item} />
              ) : (
                <MediaEmbed key={i} url={item} title={`${pick('title')} ${i + 1}`} />
              )
            )}
          </section>
        )}

        {audios.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{t('audio')}</h2>
            {audios.map((src, i) => (
              <MediaEmbed key={i} url={src} title={`${pick('title')} — audio ${i + 1}`} />
            ))}
          </section>
        )}

        <section className="mt-16">
          <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter mb-6">
            <MessageCircle size={22} />
            {t('comments')}
            <span className="text-sm font-normal normal-case tracking-normal text-gray-400">
              ({comments.length})
            </span>
          </h2>

          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">{t('noComments')}</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-5">
                  <div className="flex justify-between items-center mb-2 gap-3">
                    <span className="font-bold">{comment.author || 'Guest'}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                      {dateLabel(comment.createdAt) || comment.date || ''}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed italic whitespace-pre-line">
                    “{comment.text}”
                  </p>
                </div>
              ))
            )}

            <form onSubmit={submitComment} className="bg-gray-50 p-6 sm:p-8">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                {t('addYourThoughts')}
              </h3>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={`${t('namePlaceholder')} (${t('optional')})`}
                className="w-full p-3 mb-3 border border-gray-200 bg-white text-sm outline-none focus:border-black transition-colors"
              />
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                placeholder={t('commentPlaceholder')}
                className="w-full p-3 border border-gray-200 bg-white text-sm outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                disabled={posting || commentText.trim().length < 2}
                className="mt-4 inline-flex items-center gap-2 bg-[#1a1a1a] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black disabled:opacity-50 transition-colors"
              >
                <Send size={13} />
                {posting ? t('saving') : t('postComment')}
              </button>
            </form>
          </div>
        </section>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <button
            type="button"
            onClick={toggleSave}
            className="inline-flex items-center justify-center gap-2 border-2 border-[#1a1a1a] px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {saved ? t('articleSaved') : t('saveToJournal')}
          </button>
        </div>

        {(article.editor || article.authorName) && (
          <div className="mt-16 bg-[#f4f4f4] p-8 flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-20 h-20 rounded-full bg-gray-300 grid place-items-center shrink-0">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-xs mb-2">
                {t('editorialDesk')}: {article.authorName || article.editor}
              </h3>
              <p className="text-sm italic text-gray-500">
                {article.authorBio || article.editorBio || t('footerNote')}
              </p>
            </div>
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-gray-200 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-8">
              {t('similarArticles')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} variant="row" />
              ))}
            </div>
          </div>
        </section>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          <img src={lightbox} alt={pick('title')} className="max-h-[88vh] max-w-full object-contain" />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-5 top-5 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
          >
            {t('close')}
          </button>
        </div>
      )}
    </>
  );
};

export default ArticlePage;
