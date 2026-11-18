import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Headphones,
  Image as ImageIcon,
  LayoutGrid,
  Play,
  Quote as QuoteIcon,
  Search,
  Video,
  X,
  Youtube,
} from 'lucide-react';
import { getMediaItems } from '../services/firebaseService';
import type { MediaItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import MediaEmbed from '../components/MediaEmbed';
import SEOHead from '../components/SEOHead';
import { BRAND } from '../constants';

const TYPES = [
  { value: 'all', icon: LayoutGrid },
  { value: 'youtube', icon: Youtube },
  { value: 'video', icon: Video },
  { value: 'audio', icon: Headphones },
  { value: 'image', icon: ImageIcon },
  { value: 'quote', icon: QuoteIcon },
] as const;

type FilterType = (typeof TYPES)[number]['value'];

const CARD_BASE =
  'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white ' +
  'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-20px_rgba(0,0,0,0.35)]';

const TYPE_PILL =
  'inline-flex items-center rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500';

const youtubeThumb = (url?: string) => {
  if (!url) return '';
  const match =
    url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/) || [];
  const id = match[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
};

const MediaPage = () => {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await getMediaItems();
        if (active) setItems(list as MediaItem[]);
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
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (!needle) return true;
      return [item.title, item.text, item.author, item.url]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [items, filter, query]);

  const typeLabel = (type: string) => (type === 'all' ? t('all') : t(type));
  const hasFilters = filter !== 'all' || query.trim().length > 0;

  const cardTitle = 'line-clamp-2 font-serif text-lg font-semibold leading-snug text-[#1a1a1a]';
  const cardBody = 'flex flex-1 flex-col gap-3 p-5';

  return (
    <>
      <SEOHead
        lang={lang}
        title={`${t('mediaTitle')} | ${BRAND.name}`}
        description={t('mediaSubtitle')}
        url={`${BRAND.siteUrl}/${lang}/media`}
      />

      <section className="bg-gradient-to-b from-[#f7f7f8] via-[#fbfbfc] to-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 md:pt-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-red-600">
                {t('media')}
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-[#1a1a1a] md:text-5xl lg:text-[3.4rem]">
                {t('mediaTitle')}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-500">
                {t('mediaSubtitle')}
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-[26rem] lg:items-end">
              <div className="relative w-full">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('mediaSearch')}
                  aria-label={t('mediaSearch')}
                  className="h-12 w-full rounded-full border border-black/[0.06] bg-white pl-11 pr-11 text-sm text-[#1a1a1a] shadow-[0_10px_30px_-24px_rgba(0,0,0,0.8)] outline-none transition focus:border-black/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      searchRef.current?.focus();
                    }}
                    aria-label={t('clearSearch')}
                    className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-black/[0.05] text-gray-500 transition hover:bg-black/[0.09] hover:text-black"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="no-scrollbar -mx-4 w-full overflow-x-auto px-4 lg:mx-0 lg:px-0">
                <div className="inline-flex min-w-full items-center gap-1 rounded-full bg-[#f1f1f3] p-1 sm:min-w-0">
                  {TYPES.map(({ value, icon: Icon }) => {
                    const active = filter === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        aria-pressed={active}
                        className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all sm:px-4 ${
                          active
                            ? 'bg-white text-[#1a1a1a] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.35)]'
                            : 'text-gray-500 hover:text-[#1a1a1a]'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="hidden md:inline">{typeLabel(value)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {!loading && (
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-400">
              {visible.length} {t('mediaItemsLabel')}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-7 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-2xl border border-black/[0.05] bg-white p-4">
                <div className="aspect-video animate-pulse rounded-xl bg-gray-100" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/10 bg-[#fafafa] px-6 py-20 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-gray-300 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]">
              <LayoutGrid size={22} />
            </div>
            <p className="mt-6 font-serif text-2xl font-semibold text-[#1a1a1a]">
              {hasFilters && items.length > 0 ? t('mediaNoResults') : t('mediaEmpty')}
            </p>
            {hasFilters && (
              <>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                  {t('mediaNoResultsHint')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all');
                    setQuery('');
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black"
                >
                  <X size={13} />
                  {t('clearSearch')}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-7 lg:grid-cols-3">
            {visible.map((item) => {
              if (item.type === 'quote') {
                return (
                  <article
                    key={item.id}
                    className={`${CARD_BASE} aspect-[4/5] justify-between bg-[#f8f7f4] p-6 md:p-7`}
                  >
                    <QuoteIcon size={26} className="text-red-500/80" />
                    <p className="mt-6 flex-1 overflow-hidden font-serif text-xl leading-relaxed text-[#1a1a1a] md:text-[1.45rem]">
                      “{item.text}”
                    </p>
                    <div className="mt-6 flex items-end justify-between gap-3">
                      <p className="text-sm font-semibold text-[#1a1a1a]">
                        {item.author || BRAND.name}
                      </p>
                      <span className={TYPE_PILL}>{t('quote')}</span>
                    </div>
                  </article>
                );
              }

              if (item.type === 'image') {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightbox(item)}
                    className={`${CARD_BASE} text-left`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#f4f4f5]">
                      <img
                        src={item.url}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className={cardBody}>
                      <h2 className={cardTitle}>{item.title}</h2>
                      <p className="mt-auto text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                        {t('image')}
                      </p>
                    </div>
                  </button>
                );
              }

              if (item.type === 'audio') {
                return (
                  <article key={item.id} className={CARD_BASE}>
                    <div className="flex items-center gap-4 p-5">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f4f4f6] text-[#1a1a1a]">
                        <Headphones size={22} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {t('audio')}
                        </p>
                        <h2 className={`mt-1 ${cardTitle}`}>{item.title}</h2>
                      </div>
                    </div>
                    <div className="mt-auto px-5 pb-5">
                      {item.url ? (
                        <audio src={item.url} controls preload="metadata" className="w-full" />
                      ) : (
                        <span className={TYPE_PILL}>{t('audio')}</span>
                      )}
                    </div>
                  </article>
                );
              }

              if (item.type === 'youtube') {
                const thumb = item.thumbnail || youtubeThumb(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightbox(item)}
                    className={`${CARD_BASE} text-left`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-[#111]">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : null}
                      <span className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/40 via-transparent to-transparent">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-black shadow-lg transition duration-300 group-hover:scale-105">
                          <Play className="ml-0.5 h-5 w-5" />
                        </span>
                      </span>
                    </div>
                    <div className={cardBody}>
                      <h2 className={cardTitle}>{item.title}</h2>
                      <p className="mt-auto text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                        {t('youtube')}
                      </p>
                    </div>
                  </button>
                );
              }

              return (
                <article key={item.id} className={CARD_BASE}>
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    {item.url && (
                      <MediaEmbed url={item.url} title={item.title} poster={item.thumbnail} />
                    )}
                  </div>
                  <div className={cardBody}>
                    <h2 className={cardTitle}>{item.title}</h2>
                    <p className="mt-auto text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                      {t('video')}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md"
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-[#0f0f10]">
              {lightbox.type === 'image' ? (
                <img
                  src={lightbox.url}
                  alt={lightbox.title}
                  className="mx-auto max-h-[72vh] w-auto max-w-full object-contain"
                />
              ) : (
                <MediaEmbed url={lightbox.url || ''} title={lightbox.title} />
              )}
            </div>
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <p className="truncate font-serif text-lg font-semibold text-[#1a1a1a]">
                  {lightbox.title}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  {typeLabel(lightbox.type)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black"
              >
                <X size={13} />
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaPage;
