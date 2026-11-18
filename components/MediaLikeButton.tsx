import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useMediaLike } from '../hooks/useMediaLike';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface MediaLikeButtonProps {
  mediaId: string;
  tone?: 'overlay' | 'plain';
  eager?: boolean;
  className?: string;
}

const toneClass = (tone: 'overlay' | 'plain', liked: boolean) => {
  if (tone === 'overlay') {
    return liked
      ? 'bg-white text-red-600 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)]'
      : 'bg-black/45 text-white backdrop-blur-md hover:bg-black/60';
  }
  return liked
    ? 'border border-red-200 bg-red-50 text-red-600'
    : 'border border-black/10 bg-white text-gray-600 hover:text-[#1a1a1a]';
};

const LikeControl = ({ mediaId, tone = 'plain', className = '' }: Omit<MediaLikeButtonProps, 'eager'>) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { liked, count, toggle, busy } = useMediaLike(mediaId, user?.uid);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!busy) void toggle();
      }}
      aria-pressed={liked}
      aria-label={liked ? t('mediaLiked') : t('mediaLike')}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95 ${toneClass(tone, liked)} ${className}`}
    >
      <Heart
        size={16}
        className={liked ? 'fill-current' : ''}
        strokeWidth={liked ? 1.5 : 2}
      />
      <span className="tabular-nums">{count}</span>
      <span className="sr-only">{t('mediaLikesLabel')}</span>
    </button>
  );
};

const MediaLikeButton = ({ mediaId, tone = 'plain', eager = false, className }: MediaLikeButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(eager);

  useEffect(() => {
    if (ready || !ref.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ready]);

  if (!ready) {
    return (
      <div ref={ref} className={className}>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setReady(true);
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${toneClass(tone, false)}`}
        >
          <Heart size={16} />
          <span className="tabular-nums">0</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <LikeControl mediaId={mediaId} tone={tone} />
    </div>
  );
};

export default MediaLikeButton;
