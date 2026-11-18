import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ScrollButtons = () => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const update = () => {
      const top = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(top > 320);
      setAtBottom(max > 0 && max - top < 80);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!visible) return null;

  const onReels = /^\/(rw|en|sw|fr)\/media\/?$/.test(pathname);

  const buttonClass =
    'grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/95 text-[#1a1a1a] shadow-[0_12px_30px_-14px_rgba(0,0,0,0.5)] backdrop-blur transition hover:bg-[#1a1a1a] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30';

  return (
    <div
      className={`fixed bottom-5 left-4 z-40 flex-col gap-2 sm:bottom-8 sm:left-auto sm:right-6 sm:flex ${
        onReels ? 'hidden sm:flex' : 'flex'
      }`}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('scrollToTop')}
        title={t('scrollToTop')}
        className={buttonClass}
      >
        <ArrowUp size={18} />
      </button>
      <button
        type="button"
        onClick={() =>
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
        }
        aria-label={t('scrollToBottom')}
        title={t('scrollToBottom')}
        disabled={atBottom}
        className={buttonClass}
      >
        <ArrowDown size={18} />
      </button>
    </div>
  );
};

export default ScrollButtons;
