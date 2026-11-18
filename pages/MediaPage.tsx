import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
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
import MediaLikeButton from '../components/MediaLikeButton';
import SEOHead from '../components/SEOHead';
import { BRAND } from '../constants';
import {
  isDirectAudioUrl,
  isDirectVideoUrl,
  mediaCategoryLabel,
  mediaCategorySlug,
  mediaPreviewImage,
  youtubeId,
} from '../utils/media';

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
  'group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-[#101012] ' +
  'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgba(0,0,0,0.55)]';

const TYPE_PILL =
  'inline-flex items-center rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500';

const OVERLAY_PILL =
  'inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm';

const canPlay = (item: MediaItem) =>
  item.type === 'youtube' ||
  item.type === 'video' ||
  item.type === 'audio' ||
  isDirectVideoUrl(item.url) ||
  isDirectAudioUrl(item.url);

const ReelPlayer = ({ item }: { item: MediaItem }) => {
  const yt = youtubeId(item.url);
  if (yt) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
        title={item.title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  if (isDirectVideoUrl(item.url)) {
    return (
      <video
        src={item.url}
        poster={item.thumbnail || undefined}
        controls
        autoPlay
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#28211c] via-[#161311] to-black px-6">
      <Headphones size={46} className="text-white/70" />
      <p className="mt-4 max-w-[80%] text-center font-serif text-lg text-white/85">{item.title}</p>
      <audio src={item.url} controls autoPlay className="mt-6 w-full max-w-sm" />
    </div>
  );
};

interface ReelSlideProps {
  item: MediaItem;
  lang: string;
  typeLabel: string;
  categoryLabel: string;
  playing: boolean;
  onPlay: (id: string) => void;
  onStop: (id: string) => void;
  playHint: string;
}

const ReelSlide = ({
  item,
  lang,
  typeLabel,
  categoryLabel,
  playing,
  onPlay,
  onStop,
  playHint,
}: ReelSlideProps) => {
  const ref = useRef<HTMLElement>(null);
  const preview = mediaPreviewImage(item);
  const playable = canPlay(item);

  useEffect(() => {
    if (!playing || !ref.current) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const node = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.intersectionRatio < 0.55) onStop(item.id);
      },
      { threshold: [0, 0.55] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [playing, item.id, onStop]);

  return (
    <section
      ref={ref}
      className="relative h-full w-full snap-start overflow-hidden bg-[#0b0b0c]"
    >
      {playing ? (
        <ReelPlayer item={item} />
      ) : (
        <>
          {preview ? (
            <img
              src={preview}
              alt={item.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2b2320] via-[#171412] to-black" />
          )}

          {item.type === 'quote' && (
            <div className="absolute inset-0 flex flex-col justify-center px-7 pb-32">
              <QuoteIcon size={32} className="text-red-400/80" />
              <blockquote className="mt-5 font-serif text-2xl leading-relaxed text-white">
                “{item.text}”
              </blockquote>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                {item.author || BRAND.name}
              </p>
            </div>
          )}

          {playable && (
            <button
              type="button"
              onClick={() => onPlay(item.id)}
              aria-label={playHint}
              className="absolute inset-0 z-10 grid place-items-center"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black shadow-[0_20px_45px_-15px_rgba(0,0,0,0.8)] transition active:scale-95">
                <Play className="ml-0.5 h-6 w-6" />
              </span>
            </button>
          )}

          {!playable && (
            <Link
              to={`/${lang}/media/${item.id}`}
              aria-label={item.title}
              className="absolute inset-0 z-10"
            />
          )}
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/35" />

      <Link
        to={`/${lang}/media/${item.id}`}
        aria-label={item.title}
        className="absolute right-4 top-4 z-30 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65"
      >
        <ArrowUpRight size={16} />
      </Link>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 pb-8 pr-20 text-white">
        <div className="flex flex-wrap items-center gap-2">
          {categoryLabel && <span className={OVERLAY_PILL}>{categoryLabel}</span>}
          <span className={OVERLAY_PILL}>{typeLabel}</span>
        </div>
        <h2 className="mt-2.5 line-clamp-3 font-serif text-2xl font-semibold leading-tight">
          {item.title}
        </h2>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
          {item.author || BRAND.name}
        </p>
      </div>

      <MediaLikeButton
        mediaId={item.id}
        tone="overlay"
        className="absolute bottom-7 right-4 z-30"
      />
    </section>
  );
};

const MediaPage = () => {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [reelIndex, setReelIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const reelTargetRef = useRef<number | null>(null);

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
    setPlayingId(null);
    setReelIndex(0);
    reelRef.current?.scrollTo({ top: 0 });
  }, [filter, category, query]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    items.forEach((item) => {
      const slug = mediaCategorySlug(item.category);
      if (slug) seen.add(slug);
    });
    return Array.from(seen);
  }, [items]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (category && mediaCategorySlug(item.category) !== category) return false;
      if (!needle) return true;
      return [item.title, item.text, item.author, item.url, item.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [items, filter, category, query]);

  const stopPlaying = useCallback((id: string) => {
    setPlayingId((current) => (current === id ? null : current));
  }, []);

  const handleReelScroll = () => {
    const node = reelRef.current;
    if (!node) return;
    const height = node.clientHeight || 1;
    if (reelTargetRef.current !== null) {
      if (Math.abs(node.scrollTop - reelTargetRef.current) > 2) return;
      reelTargetRef.current = null;
    }
    const next = Math.round(node.scrollTop / height);
    setReelIndex((current) => (current === next ? current : next));
  };

  const goToReel = (direction: -1 | 1) => {
    const node = reelRef.current;
    if (!node) return;
    const height = node.clientHeight || 1;
    const current = Math.round(node.scrollTop / height);
    const next = Math.min(Math.max(current + direction, 0), visible.length - 1);
    const target = next * height;
    const start = node.scrollTop;
    reelTargetRef.current = target;
    node.scrollTo({ top: target, behavior: 'smooth' });
    setReelIndex(next);
    // Smooth scrolling can be suppressed (reduced motion, background tab);
    // snap directly if the container never started moving.
    window.setTimeout(() => {
      if (Math.abs(node.scrollTop - start) < 2) node.scrollTop = target;
    }, 350);
    window.setTimeout(() => {
      if (reelTargetRef.current === target) reelTargetRef.current = null;
    }, 800);
  };

  const typeLabel = (type: string) => (type === 'all' ? t('all') : t(type));
  const hasFilters = filter !== 'all' || category !== '' || query.trim().length > 0;
  const resetFilters = () => {
    setFilter('all');
    setCategory('');
    setQuery('');
  };

  const cardTypeLabel = (item: MediaItem) => (item.type === 'youtube' ? t('youtube') : t(item.type));

  return (
    <>
      <SEOHead
        lang={lang}
        title={`${t('mediaTitle')} | ${BRAND.name}`}
        description={t('mediaSubtitle')}
        url={`${BRAND.siteUrl}/${lang}/media`}
      />

      <section className="bg-gradient-to-b from-[#f7f7f8] via-[#fbfbfc] to-white">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 md:pb-10 md:pt-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="max-w-2xl">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-red-600">
                {t('media')}
              </p>
              <h1 className="font-serif text-3xl font-semibold leading-[1.05] tracking-tight text-[#1a1a1a] sm:text-4xl md:text-5xl lg:text-[3.4rem]">
                {t('mediaTitle')}
              </h1>
              <p className="mt-3 hidden max-w-xl text-base leading-relaxed text-gray-500 sm:block md:mt-4">
                {t('mediaSubtitle')}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-[26rem] lg:items-end">
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

              {categories.length > 0 && (
                <div className="no-scrollbar -mx-4 w-full overflow-x-auto px-4 lg:mx-0 lg:px-0">
                  <div className="flex items-center gap-2">
                    {[{ slug: '', label: t('all') }, ...categories.map((slug) => ({
                      slug,
                      label: mediaCategoryLabel(t, slug),
                    }))].map(({ slug, label }) => {
                      const active = category === slug;
                      return (
                        <button
                          key={slug || 'all'}
                          type="button"
                          onClick={() => setCategory(slug)}
                          aria-pressed={active}
                          className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                            active
                              ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                              : 'border-black/[0.08] bg-white text-gray-500 hover:border-black/25 hover:text-[#1a1a1a]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!loading && (
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-400">
              {visible.length} {t('mediaItemsLabel')}
            </p>
          )}
        </div>
      </section>

      {loading ? (
        <div className="mx-auto max-w-7xl px-4 pb-20">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-7 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 pb-20">
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
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black"
                >
                  <X size={13} />
                  {t('clearSearch')}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="px-3 pb-6 sm:hidden">
            <div className="relative">
              <div
                ref={reelRef}
                onScroll={handleReelScroll}
                data-reel-scroller
                className="no-scrollbar h-[calc(100dvh-9rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain rounded-3xl bg-black shadow-[0_24px_60px_-35px_rgba(0,0,0,0.8)]"
              >
                {visible.map((item) => (
                  <ReelSlide
                    key={item.id}
                    item={item}
                    lang={lang}
                    typeLabel={cardTypeLabel(item)}
                    categoryLabel={mediaCategoryLabel(t, item.category)}
                    playing={playingId === item.id}
                    onPlay={setPlayingId}
                    onStop={stopPlaying}
                    playHint={t('mediaReelHint')}
                  />
                ))}
              </div>

              <div className="pointer-events-none absolute right-2.5 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToReel(-1)}
                  disabled={reelIndex <= 0}
                  aria-label={t('mediaReelPrev')}
                  title={t('mediaReelPrev')}
                  className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black text-white shadow-[0_16px_35px_-16px_rgba(0,0,0,0.9)] transition hover:bg-neutral-800 active:scale-95 disabled:pointer-events-none disabled:opacity-25"
                >
                  <ChevronUp size={20} />
                </button>
                <span className="pointer-events-none rounded-full bg-black px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-white/85">
                  {Math.min(reelIndex + 1, visible.length)}/{visible.length}
                </span>
                <button
                  type="button"
                  onClick={() => goToReel(1)}
                  disabled={reelIndex >= visible.length - 1}
                  aria-label={t('mediaReelNext')}
                  title={t('mediaReelNext')}
                  className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black text-white shadow-[0_16px_35px_-16px_rgba(0,0,0,0.9)] transition hover:bg-neutral-800 active:scale-95 disabled:pointer-events-none disabled:opacity-25"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              {t('mediaReelHint')}
            </p>
          </div>

          <div className="mx-auto hidden max-w-7xl px-4 pb-20 sm:block">
            <div className="grid grid-cols-2 gap-5 md:gap-7 lg:grid-cols-3">
              {visible.map((item) => {
                const preview = mediaPreviewImage(item);
                const href = `/${lang}/media/${item.id}`;
                const catLabel = mediaCategoryLabel(t, item.category);

                if (item.type === 'quote') {
                  return (
                    <article key={item.id} className={CARD_BASE}>
                      <Link to={href} className="absolute inset-0 z-10" aria-label={item.title} />
                      <div className="flex h-full flex-col justify-between bg-[#f7f5f0] p-6">
                        <QuoteIcon size={24} className="text-red-500/75" />
                        <p className="mt-5 line-clamp-[8] font-serif text-lg leading-relaxed text-[#1a1a1a] md:text-xl">
                          “{item.text}”
                        </p>
                        <div className="mt-6 flex items-end justify-between gap-3">
                          <p className="text-sm font-semibold text-[#1a1a1a]">
                            {item.author || BRAND.name}
                          </p>
                          <span className={TYPE_PILL}>{t('quote')}</span>
                        </div>
                      </div>
                      <MediaLikeButton
                        mediaId={item.id}
                        tone="plain"
                        className="absolute right-3 top-3 z-30"
                      />
                    </article>
                  );
                }

                return (
                  <article key={item.id} className={CARD_BASE}>
                    <Link to={href} className="absolute inset-0 z-10" aria-label={item.title} />

                    {preview ? (
                      <img
                        src={preview}
                        alt={item.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2b2320] via-[#171412] to-black">
                        {item.type === 'audio' ? (
                          <Headphones size={44} className="text-white/35" />
                        ) : (
                          <Play size={44} className="text-white/35" />
                        )}
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/25" />

                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-4">
                      {catLabel ? <span className={OVERLAY_PILL}>{catLabel}</span> : <span />}
                      {canPlay(item) && (
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                          <Play className="ml-0.5 h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 pb-5 pr-20 text-white">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">
                        {cardTypeLabel(item)}
                      </p>
                      <h2 className="mt-1 line-clamp-2 font-serif text-base font-semibold leading-snug md:text-lg">
                        {item.title}
                      </h2>
                      <p className="mt-1.5 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                        {item.author || BRAND.name}
                      </p>
                    </div>

                    <MediaLikeButton
                      mediaId={item.id}
                      tone="overlay"
                      className="absolute bottom-3.5 right-3.5 z-30"
                    />
                  </article>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MediaPage;
