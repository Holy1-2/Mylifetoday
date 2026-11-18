import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Copy, Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../contexts/JournalContext';
import { getDailyVerses } from '../services/firebaseService';
import type { DailyVerse } from '../types';
import { pickLiveVerse, pickPastVerses } from '../utils/verseOfDay';
import { downloadBlob, renderVerseImage, shareVerseImage } from '../utils/verseImage';
import { BRAND } from '../constants';
import SEOHead from '../components/SEOHead';

const VersePage = () => {
  const { lang, t, dateLabel } = useLanguage();
  const { user } = useAuth();
  const journal = useJournal();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [earlier, setEarlier] = useState<DailyVerse[]>([]);

  useEffect(() => {
    let active = true;
    getDailyVerses(60)
      .then((list) => {
        if (!active) return;
        setVerse(pickLiveVerse(list));
        setEarlier(pickPastVerses(list).slice(0, 12));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const reference = verse ? verse.reference[lang] || verse.reference.rw : '';
  const text = verse ? verse.text[lang] || verse.text.rw : '';
  const saved = verse ? journal.isVerseSaved(verse) : false;

  const ensureAuth = () => {
    if (user) return true;
    navigate(`/${lang}/signin`, { state: { from: location.pathname } });
    return false;
  };

  const toggleSave = async () => {
    if (!verse || !ensureAuth()) return;
    try {
      await journal.toggleVerse(verse);
    } catch {
      toast.error(t('error'));
    }
  };

  const copyVerse = async () => {
    if (!verse) return;
    try {
      await navigator.clipboard.writeText(`“${text}” — ${reference}\n${BRAND.name}`);
      toast.success(t('copied'));
    } catch {
      toast.error(t('error'));
    }
  };

  const copyPastVerse = async (item: DailyVerse) => {
    const pastReference = item.reference[lang] || item.reference.rw;
    const pastText = item.text[lang] || item.text.rw;
    try {
      await navigator.clipboard.writeText(`“${pastText}” — ${pastReference}\n${BRAND.name}`);
      toast.success(t('copied'));
    } catch {
      toast.error(t('error'));
    }
  };

  const makeImage = async () => {
    setBusy(true);
    try {
      return await renderVerseImage({
        reference,
        text,
        brand: BRAND.name,
        siteUrl: 'kubananimanaburimunsi.rw',
      });
    } catch (error) {
      console.error(error);
      toast.error(t('error'));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const shareImage = async () => {
    const blob = await makeImage();
    if (!blob) return;
    const result = await shareVerseImage(blob, {
      title: `${reference} — ${BRAND.name}`,
      text: `“${text}” — ${reference}`,
      filename: `ijambo-${new Date().toISOString().slice(0, 10)}.png`,
    });
    if (result === 'downloaded') toast.success(t('downloadImage'));
  };

  const download = async () => {
    const blob = await makeImage();
    if (!blob) return;
    downloadBlob(blob, `ijambo-${new Date().toISOString().slice(0, 10)}.png`);
    toast.success(t('downloadImage'));
  };

  const action =
    'inline-flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-60';

  return (
    <>
      <SEOHead
        lang={lang}
        title={verse ? `${t('verseTitle')} — ${reference} | ${BRAND.name}` : `${t('verseTitle')} | ${BRAND.name}`}
        description={verse ? `${text} (${reference})` : t('verseSubtitle')}
        url={`${BRAND.siteUrl}/${lang}/verse`}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
            {t('verseOfDay')}
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-black uppercase tracking-tighter">
            {t('verseTitle')}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">{t('verseSubtitle')}</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {dateLabel(new Date())}
          </p>
        </div>

        {loading ? (
          <div className="mx-auto mt-10 max-w-2xl border border-black/10 p-6 sm:p-12">
            <div className="h-3 w-28 animate-pulse bg-gray-200" />
            <div className="mt-10 space-y-3">
              <div className="h-6 w-full animate-pulse bg-gray-200" />
              <div className="h-6 w-5/6 animate-pulse bg-gray-200" />
              <div className="h-6 w-2/3 animate-pulse bg-gray-200" />
            </div>
            <div className="mt-10 h-3 w-20 animate-pulse bg-gray-200" />
          </div>
        ) : verse ? (
          <>
            <div className="relative mx-auto mt-10 max-w-2xl overflow-hidden bg-[#1a1a1a] px-6 py-12 text-white sm:px-12 sm:py-16">
              <p className="font-serif text-sm text-white/50">{BRAND.name}</p>
              <p className="mt-8 font-serif text-3xl leading-[1.3] sm:text-4xl">“{text}”</p>
              <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-red-500">
                {reference}
              </p>
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <span>kubananimanaburimunsi.vercel.app</span>
                <span>{t('verseOfDay')}</span>
              </div>
            </div>

            <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={shareImage}
                disabled={busy}
                className={`${action} bg-[#1a1a1a] text-white hover:bg-black`}
              >
                <Share2 size={14} />
                {busy ? t('creatingImage') : t('shareAsImage')}
              </button>
              <button
                type="button"
                onClick={download}
                disabled={busy}
                className={`${action} border border-black/20 hover:border-black`}
              >
                <Download size={14} />
                {t('downloadImage')}
              </button>
              <button type="button" onClick={copyVerse} className={`${action} border border-black/20 hover:border-black`}>
                <Copy size={14} />
                {t('copyVerse')}
              </button>
              <button
                type="button"
                onClick={toggleSave}
                className={`${action} border ${
                  saved ? 'border-red-600 bg-red-600 text-white' : 'border-black/20 hover:border-black'
                }`}
              >
                {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                {saved ? t('saved') : t('saveVerse')}
              </button>
            </div>
          </>
        ) : (
          <div className="mx-auto mt-10 max-w-2xl border border-black/10 bg-gray-50 px-6 py-16 text-center">
            <p className="text-xl font-black uppercase tracking-tighter">{t('verseEmptyTitle')}</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
              {t('verseEmptyHint')}
            </p>
          </div>
        )}

        {earlier.length > 0 && (
          <section className="mx-auto mt-14 max-w-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{t('previousVerses')}</h2>
            <div className="mt-4 divide-y divide-gray-200 border border-black/10">
              {earlier.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-700">
                      “{item.text[lang] || item.text.rw}”
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-xs font-bold text-red-600">
                        {item.reference[lang] || item.reference.rw}
                      </p>
                      {item.date && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {dateLabel(item.date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyPastVerse(item)}
                    aria-label={t('copyVerse')}
                    className="inline-flex shrink-0 items-center gap-1.5 self-start border border-black/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors hover:border-black hover:text-black"
                  >
                    <Copy size={13} />
                    {t('copyVerse')}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default VersePage;
