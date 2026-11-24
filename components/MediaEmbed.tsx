import { useMemo } from 'react';

const httpsUrl = (value: string): URL | null => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
};

const youtubeId = (url: string): string | null => {
  const parsed = httpsUrl(url);
  if (!parsed) return null;
  const host = parsed.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] || null;
  if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtube-nocookie.com') {
    if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) return parts[1] || null;
  }
  return null;
};

const vimeoId = (url: string): string | null => {
  const parsed = httpsUrl(url);
  if (!parsed || (parsed.hostname !== 'vimeo.com' && !parsed.hostname.endsWith('.vimeo.com'))) return null;
  const match = parsed.pathname.match(/(?:video\/)?(\d+)/i);
  return match ? match[1] : null;
};

const spotifyEmbed = (url: string): string => {
  const parsed = httpsUrl(url);
  if (!parsed || parsed.hostname !== 'open.spotify.com') return '';
  const path = parsed.pathname.startsWith('/embed/') ? parsed.pathname : `/embed${parsed.pathname}`;
  return `https://open.spotify.com${path}`;
};

const isDirectVideo = (url: string) =>
  !!httpsUrl(url) && /\.(mp4|webm|ogv|mov)(?:[?#].*)?$/i.test(url);
const isDirectAudio = (url: string) =>
  !!httpsUrl(url) && /\.(mp3|m4a|aac|wav|ogg|opus)(?:[?#].*)?$/i.test(url);

interface MediaEmbedProps {
  url: string;
  title?: string;
  poster?: string;
  compact?: boolean;
}

const shell = () => 'w-full overflow-hidden rounded-none bg-black border border-black';

export const MediaEmbed = ({ url, title = 'Media', poster }: MediaEmbedProps) => {
  const clean = String(url || '').trim();
  const parsed = useMemo(() => httpsUrl(clean), [clean]);
  const yt = useMemo(() => youtubeId(clean), [clean]);
  const vimeo = useMemo(() => vimeoId(clean), [clean]);
  const spotify = useMemo(() => spotifyEmbed(clean), [clean]);
  const soundcloud =
    parsed && (parsed.hostname === 'soundcloud.com' || parsed.hostname.endsWith('.soundcloud.com'));

  if (!parsed) return null;

  if (yt) {
    return (
      <div className={shell()}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`}
          title={title}
          className="aspect-video w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (vimeo) {
    return (
      <div className={shell()}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeo}?dnt=1`}
          title={title}
          className="aspect-video w-full"
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (spotify || soundcloud) {
    const src = spotify
      ? spotify
      : `https://w.soundcloud.com/player/?url=${encodeURIComponent(clean)}&color=%23dc2626`;
    return (
      <div className={shell()}>
        <iframe
          src={src}
          title={title}
          className="h-[166px] w-full"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (isDirectVideo(clean)) {
    return (
      <div className={shell()}>
        <video
          src={clean}
          controls
          playsInline
          preload="metadata"
          poster={poster && httpsUrl(poster) ? poster : undefined}
          className="mx-auto max-h-[70vh] w-full bg-black object-contain"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (isDirectAudio(clean)) {
    return (
      <div className={`${shell()} p-4`}>
        <p className="mb-2 truncate text-[10px] font-bold uppercase tracking-widest text-white/60">{title}</p>
        <audio src={clean} controls preload="metadata" className="w-full" />
      </div>
    );
  }

  return (
    <div className={`${shell()} flex items-center justify-center p-6 text-center`}>
      <a
        href={clean}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-white underline underline-offset-4"
      >
        {title}
      </a>
    </div>
  );
};

export default MediaEmbed;
