import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, HelpCircle, X } from 'lucide-react';
import { getQuizQuestions, submitQuizAnswer } from '../services/firebaseService';
import type { QuizQuestion } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import QuizQuestionCard, { type QuizSubmitPayload } from './QuizQuestion';

const SEEN_IDS_KEY = 'mlt-quiz-seen-ids';
const SET_SIZE = 4;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

type RunResult = { answerIndex: number; isCorrect: boolean };

const readSeenIds = () => {
  try {
    const raw = window.localStorage.getItem(SEEN_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set<string>(
      Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
    );
  } catch {
    return new Set<string>();
  }
};

const writeSeenIds = (ids: Set<string>) => {
  try {
    window.localStorage.setItem(SEEN_IDS_KEY, JSON.stringify([...ids]));
  } catch {
    // Private browsing can block storage.
  }
};

const pickSet = (list: QuizQuestion[], size = SET_SIZE) => {
  const pool = [...list];
  const picked: QuizQuestion[] = [];
  while (pool.length > 0 && picked.length < size) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
};

const QuizModal = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [position, setPosition] = useState(0);
  const [results, setResults] = useState<Record<string, RunResult>>({});

  const current = queue[position] || null;
  const isLast = position >= queue.length - 1;
  const score = Object.values(results).filter((result) => result.isCorrect).length;

  useEffect(() => {
    const initialPath = window.location.pathname;
    if (/\/(articles|quiz|signin|signup)(\/|$)/.test(initialPath)) return undefined;

    const forceOpen = new URLSearchParams(window.location.search).get('quiz') === '1';
    if (!forceOpen && Math.random() > 0.6) return undefined;

    const delay = forceOpen ? 500 : 5000 + Math.random() * 8000;
    const timer = window.setTimeout(async () => {
      const path = window.location.pathname;
      if (/\/(articles|quiz|signin|signup)(\/|$)/.test(path)) return;
      try {
        const allQuestions = (await getQuizQuestions()) as QuizQuestion[];
        if (!allQuestions.length) return;

        const seenIds = readSeenIds();
        const unseen = allQuestions.filter((question) => !seenIds.has(question.id));
        const pool = forceOpen && !unseen.length ? allQuestions : unseen;
        if (!pool.length) return;

        setQueue(pickSet(pool));
        setPosition(0);
        setFinished(false);
        setResults({});
        setOpen(true);
        writeSeenIds(new Set(allQuestions.map((question) => question.id)));
      } catch {
        // Stay quiet: the popup is optional and must never disturb the page.
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (/\/(articles|quiz|signin|signup)(\/|$)/.test(location.pathname)) {
      setOpen(false);
    }
  }, [location.pathname, open]);

  const close = () => setOpen(false);

  const handleSubmit = async (payload: QuizSubmitPayload) => {
    if (!current) return;
    try {
      await submitQuizAnswer({
        questionId: current.id,
        questionText: current.text,
        userName: payload.userName,
        userId: user?.uid || null,
        answerIndex: payload.answerIndex,
        isCorrect: payload.isCorrect,
      });
    } catch {
      // Quiz results remain available locally when the network is unavailable.
    }
  };

  const handleAnswered = (payload: QuizSubmitPayload) => {
    if (!current) return;
    setResults((previous) => ({
      ...previous,
      [current.id]: { answerIndex: payload.answerIndex, isCorrect: payload.isCorrect },
    }));
    if (isLast) {
      setFinished(true);
      return;
    }
    setPosition((value) => Math.min(value + 1, queue.length - 1));
  };

  if (!open || !current) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-black/70 backdrop-blur-[3px] animate-in fade-in"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('quiz')}
        className="relative flex max-h-[88svh] w-full max-w-[452px] flex-col overflow-hidden rounded-none bg-[#0b0b0c] text-white shadow-[0_45px_120px_-25px_rgba(0,0,0,0.95)] ring-1 ring-white/10 animate-in sm:h-[452px]"
      >
        <div
          aria-hidden="true"
          className="quiz-gradient pointer-events-none absolute inset-x-0 top-0 h-1/2"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-[#0b0b0c]/30 to-[#0b0b0c]"
        />

        <button
          type="button"
          onClick={close}
          aria-label={t('close')}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-none bg-black/30 text-white/70 ring-1 ring-white/15 transition hover:bg-black/50 hover:text-white"
        >
          <X size={17} />
        </button>

        {!started ? (
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-7 py-9 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-none bg-white/10 text-white ring-1 ring-white/25 backdrop-blur">
              <HelpCircle size={30} />
            </span>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
              Bible Quiz
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-white">{t('quiz')}</h2>
            <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-white/60">
              {t('quizReadyBody')}
            </p>
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="mt-7 w-full rounded-none bg-red-600 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_-18px_rgba(239,68,68,0.8)] transition hover:bg-red-500 active:scale-[0.99]"
            >
              {t('quizReady')}
            </button>
            <button
              type="button"
              onClick={close}
              className="mt-2.5 text-xs font-medium text-white/50 transition hover:text-white"
            >
              {t('quizLater')}
            </button>
            <Link
              to={`/${lang}/quiz`}
              onClick={close}
              className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50 transition hover:text-red-400"
            >
              {t('quizOpen')} <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-3.5 pr-14">
              <span aria-hidden="true" className="h-6 w-[3px] bg-red-500" />
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
                {t(finished ? 'quizResultsTitle' : 'quiz')}
              </p>
              <span className="ml-auto mr-1 text-[10px] font-bold tabular-nums tracking-[0.12em] text-white/45">
                {finished ? queue.length : position + 1} / {queue.length}
              </span>
            </div>
            <div aria-hidden="true" className="h-[2px] w-full bg-white/10">
              <div
                className="h-full bg-red-600 transition-[width] duration-300"
                style={{
                  width: `${(finished ? 1 : (position + 1) / queue.length) * 100}%`,
                }}
              />
            </div>

            {finished ? (
              <>
                <div
                  key="results"
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
                >
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                        {t('quizScore')}
                      </p>
                      <p className="mt-1 font-serif text-4xl font-semibold leading-none text-white">
                        {score}
                        <span className="text-lg font-normal text-white/35">
                          {' '}
                          / {queue.length}
                        </span>
                      </p>
                    </div>
                    <span className="border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                      {Math.round((score / queue.length) * 100)}%
                    </span>
                  </div>

                  <ul className="mt-5 space-y-2">
                    {queue.map((question) => {
                      const result = results[question.id];
                      return (
                        <li
                          key={question.id}
                          className="flex items-start gap-2.5 border border-white/10 bg-white/[0.04] px-3 py-2.5"
                        >
                          <span
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center ${
                              result?.isCorrect
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-red-500/15 text-red-300'
                            }`}
                          >
                            {result?.isCorrect ? <Check size={12} /> : <X size={12} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[13px] font-medium leading-snug text-white/85">
                              {question.text}
                            </p>
                            {result && (
                              <div className="mt-1 space-y-0.5">
                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                                  {t('quizYourAnswer')}:{' '}
                                  <span
                                    className={
                                      result.isCorrect ? 'text-emerald-300' : 'text-red-300'
                                    }
                                  >
                                    {LETTERS[result.answerIndex]}
                                  </span>
                                </p>
                                <p className="text-[10px] leading-snug text-emerald-300/90">
                                  {t('quizCorrectAnswer')}:{' '}
                                  {LETTERS[question.correctIndex]}.{' '}
                                  {question.options[question.correctIndex]}
                                </p>
                                {question.reference && (
                                  <span className="mt-1 inline-block border border-red-500/25 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-red-200/90">
                                    {question.reference}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-white/10 bg-black/30 px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={close}
                      className="flex-1 rounded-none border border-white/20 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/60 hover:text-white"
                    >
                      {t('close')}
                    </button>
                    <Link
                      to={`/${lang}/quiz`}
                      onClick={close}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-none bg-red-600 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-500"
                    >
                      {t('quizOpen')} <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div
                key={current.id}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
              >
                <QuizQuestionCard
                  key={current.id}
                  question={current}
                  onSubmit={handleSubmit}
                  onAnswered={handleAnswered}
                  deferResult
                  actionLabel={isLast ? t('quizFinish') : t('quizNextShort')}
                  compact
                  dark
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
