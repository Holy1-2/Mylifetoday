import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, HelpCircle, X } from 'lucide-react';
import { getQuizAnswers, getQuizQuestions, submitQuizAnswer } from '../services/firebaseService';
import type { QuizAnswer, QuizQuestion } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import QuizQuestionCard, { type QuizSubmitPayload } from './QuizQuestion';

const SEEN_KEY = 'mlt-quiz-modal-seen';
const SEEN_WINDOW_MS = 12 * 60 * 60 * 1000;
const SET_SIZE = 4;

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
  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const current = queue[position] || null;
  const isLast = position >= queue.length - 1;

  useEffect(() => {
    const initialPath = window.location.pathname;
    if (initialPath.includes('/articles/') || initialPath.includes('/quiz')) return undefined;

    const forceOpen = new URLSearchParams(window.location.search).get('quiz') === '1';
    if (!forceOpen) {
      let seen = 0;
      try {
        seen = Number(window.localStorage.getItem(SEEN_KEY) || 0);
      } catch {
        seen = 0;
      }
      if (seen && Date.now() - seen < SEEN_WINDOW_MS) return undefined;
      if (Math.random() > 0.6) return undefined;
    }

    const delay = forceOpen ? 500 : 5000 + Math.random() * 8000;
    const timer = window.setTimeout(async () => {
      const path = window.location.pathname;
      if (path.includes('/articles/') || path.includes('/quiz')) return;
      try {
        const [questionList, answerList] = await Promise.all([
          getQuizQuestions(),
          getQuizAnswers(),
        ]);
        if (!questionList.length) return;
        try {
          window.localStorage.setItem(SEEN_KEY, String(Date.now()));
        } catch {
          // Private browsing can block storage.
        }
        setQueue(pickSet(questionList as QuizQuestion[]));
        setAnswers(answerList as QuizAnswer[]);
        setPosition(0);
        setScore(0);
        setOpen(true);
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
    if (location.pathname.includes('/articles/') || location.pathname.includes('/quiz')) {
      setOpen(false);
    }
  }, [location.pathname, open]);

  const close = () => setOpen(false);

  const handleSubmit = async (payload: QuizSubmitPayload) => {
    if (!current) return;
    const optimistic: QuizAnswer = {
      id: `local-${Date.now()}`,
      questionId: current.id,
      userName: payload.userName,
      userId: user?.uid || null,
      answerIndex: payload.answerIndex,
      isCorrect: payload.isCorrect,
      createdAt: Date.now(),
    };
    setAnswers((previous) => [optimistic, ...previous]);
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
      // The local entry above keeps the experience intact offline.
    }
  };

  const nextQuestion = () => {
    if (isLast) return;
    setChecked(false);
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
        {/* Faint red glow on the top half, fading into black. */}
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
                {t('quiz')}
              </p>
              <span className="ml-auto mr-1 text-[10px] font-bold tabular-nums tracking-[0.12em] text-white/45">
                {position + 1} / {queue.length}
              </span>
            </div>
            <div aria-hidden="true" className="h-[2px] w-full bg-white/10">
              <div
                className="h-full bg-red-600 transition-[width] duration-300"
                style={{ width: `${((position + 1) / queue.length) * 100}%` }}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <QuizQuestionCard
                key={current.id}
                question={current}
                answers={answers}
                onSubmit={handleSubmit}
                compact
                dark
                onChecked={(isCorrect) => {
                  setChecked(true);
                  if (isCorrect) setScore((value) => value + 1);
                }}
              />
            </div>

            {checked && (
              <div className="border-t border-white/10 bg-black/30 px-5 py-3">
                {isLast && (
                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em]">
                    <span className="text-white/45">{t('quizScore')}</span>
                    <span className="text-white">
                      {score} / {queue.length}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 rounded-none border border-white/20 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/60 hover:text-white"
                  >
                    {t('close')}
                  </button>
                  {isLast ? (
                    <Link
                      to={`/${lang}/quiz`}
                      onClick={close}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-none bg-red-600 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-500"
                    >
                      {t('quizContinuePage')} <ArrowRight size={11} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-none bg-red-600 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-500"
                    >
                      {t('quizNext')} <ArrowRight size={11} />
                    </button>
                  )}
                </div>
                <Link
                  to={`/${lang}/quiz`}
                  onClick={close}
                  className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50 transition hover:text-red-400"
                >
                  {t('quizOpen')} <ArrowRight size={11} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
