import type { MediaItem } from '../types';

export const youtubeId = (url?: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] || '';
    if (host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v') || '';
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) return parts[1] || '';
    }
    return '';
  } catch {
    const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{6,})/);
    return match ? match[1] : '';
  }
};

export const youtubeThumb = (url?: string): string => {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
};

export const isDirectVideoUrl = (url?: string) =>
  !!url && /\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(url);

export const isDirectAudioUrl = (url?: string) =>
  !!url && /\.(mp3|m4a|aac|wav|ogg|opus)(\?.*)?$/i.test(url);

type PreviewSource = Pick<MediaItem, 'type' | 'url' | 'thumbnail'>;

export const mediaPreviewImage = (item: PreviewSource): string => {
  if (item.thumbnail) return item.thumbnail;
  const fromVideo = youtubeThumb(item.url);
  if (fromVideo) return fromVideo;
  if (item.type === 'image' || isDirectVideoUrl(item.url)) return item.url || '';
  return '';
};

export const mediaCategorySlug = (value?: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const mediaCategoryLabel = (t: (key: string) => string, value?: string): string => {
  const slug = mediaCategorySlug(value);
  if (!slug) return '';
  const key = `mediaCat_${slug}`;
  const label = t(key);
  if (label !== key) return label;
  return slug
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};
