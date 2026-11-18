import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Quote as QuoteIcon,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMediaItemById } from '../services/firebaseService';
import type { MediaItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import MediaEmbed from '../components/MediaEmbed';
import MediaLikeButton from '../components/MediaLikeButton';
import SEOHead from '../components/SEOHead';
import { BRAND } from '../constants';
import { mediaCategoryLabel, mediaPreviewImage } from '../utils/media';

const MediaDetailPage = () => {
  const { id = '' } = useParams();
  const { lang, t, dateLabel } = useLanguage();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMediaItemById(id).then((result) => {
      if (!active) return;
      setItem((result as MediaItem | null) ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const typeLabel = item
    ? item.type === 'youtube'
      ? t('youtube')
      : t(item.type)
    : '';

  const added = item ? dateLabel(item.createdAt) : '';

  const share = async () => {
    if (!item) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url });
        return;
      } catch {
        // User dismissed the share sheet; fall back to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('mediaLinkCopied'));
    } catch {
      // Clipboard can be unavailable; nothing else to do.
    }
  };

  const player = () => {
    if (!item) return null;
    if (item.type === 'quote') {
      return (
        <div className="relative overflow-hidden bg-[#f7f5f0] px-6 py-12 sm:px-12 sm:py-16">
          <QuoteIcon size={40} className="text-red-500/70" />
          <blockquote className="mt-6 font-serif text-2xl leading-relaxed text-[#1a1a1a] sm:text-3xl sm:leading-[1.5]">
            “{item.text}”
          </blockquote>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            {item.author || BRAND.name}
          </p>
        </div>
      );
    }
    if (item.type === 'image') {
      return (
        <img
          src={item.url}
          alt={item.title}
          className="mx-auto max-h-[78vh] w-full bg-black object-contain"
        />
      );
    }
    if (!item.url) {
      return <div className="aspect-video w-full bg-black" />;
    }
    return (
      <div className="[&>div]:border-0">
        <MediaEmbed url={item.url} title={item.title} poster={item.thumbnail} />
      </div>
    );
  };

  return (
    <>
      <SEOHead
        lang={lang}
        title={item ? `${item.title} | ${BRAND.name}` : `${t('mediaTitle')} | ${BRAND.name}`}
        description={
          item?.type === 'quote' && item.text ? item.text.slice(0, 220) : t('mediaSubtitle')
        }
        url={`${BRAND.siteUrl}/${lang}/media/${id}`}
        image={item ? mediaPreviewImage(item) : ''}
        robots={item ? 'index, follow' : 'noindex, follow'}
      />

      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        <Link
          to={`/${lang}/media`}
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 transition hover:text-[#1a1a1a]"
        >
          <ArrowLeft size={14} />
          {t('backToMedia')}
        </Link>

        {loading ? (
          <div className="mt-6 animate-pulse space-y-5">
            <div className="aspect-video w-full rounded-3xl bg-gray-100" />
            <div className="h-4 w-24 rounded-full bg-gray-100" />
            <div className="h-8 w-3/4 rounded-full bg-gray-100" />
            <div className="h-4 w-1/3 rounded-full bg-gray-100" />
          </div>
        ) : !item ? (
          <div className="mt-8 rounded-3xl border border-dashed border-black/10 bg-[#fafafa] px-6 py-20 text-center">
            <p className="text-[56px] font-black leading-none tracking-tighter text-gray-200">404</p>
            <h1 className="mt-3 font-serif text-2xl font-semibold text-[#1a1a1a]">
              {t('mediaNotFound')}
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">{t('mediaNotFoundHint')}</p>
            <Link
              to={`/${lang}/media`}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black"
            >
              <ArrowLeft size={13} />
              {t('backToMedia')}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 overflow-hidden rounded-3xl border border-black/[0.06] bg-black shadow-[0_30px_70px_-40px_rgba(0,0,0,0.65)]">
              {player()}
            </div>

            <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {mediaCategoryLabel(t, item.category) && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-600">
                      {mediaCategoryLabel(t, item.category)}
                    </span>
                  )}
                  <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    {typeLabel}
                  </span>
                </div>

                <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-[#1a1a1a] sm:text-4xl">
                  {item.title}
                </h1>

                {item.type !== 'quote' && item.text ? (
                  <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-gray-500">
                    {item.text}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  <span>{item.author || BRAND.name}</span>
                  {added && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {added}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <MediaLikeButton mediaId={item.id} eager />
                <button
                  type="button"
                  onClick={share}
                  aria-label={t('mediaShare')}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:text-[#1a1a1a]"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">{t('mediaShare')}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default MediaDetailPage;
