import { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import QuizQuestionCard, { type QuizSubmitPayload } from '../components/QuizQuestion';
import { getQuizAnswers, getQuizQuestions, submitQuizAnswer } from '../services/firebaseService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import type { QuizAnswer, QuizQuestion } from '../types';

const NAME_KEY = 'mlt-quiz-name';

const QuizPage = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(NAME_KEY) || '';
  });
  const [results, setResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [questionList, answerList] = await Promise.all([
          getQuizQuestions(),
          getQuizAnswers(),
        ]);
        if (!active) return;
        setQuestions(questionList as QuizQuestion[]);
        setAnswers(answerList as QuizAnswer[]);
      } catch {
        // Leave the list empty; the page shows its empty state.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const updateName = (value: string) => {
    setName(value);
    try {
      window.localStorage.setItem(NAME_KEY, value);
    } catch {
      // Storage can be unavailable in private browsing.
    }
  };

  const handleSubmit = async (question: QuizQuestion, payload: QuizSubmitPayload) => {
    const optimistic: QuizAnswer = {
      id: `local-${Date.now()}`,
      questionId: question.id,
      userName: payload.userName,
      userId: user?.uid || null,
      answerIndex: payload.answerIndex,
      isCorrect: payload.isCorrect,
      createdAt: Date.now(),
    };
    setAnswers((previous) => [optimistic, ...previous]);
    try {
      await submitQuizAnswer({
        questionId: question.id,
        questionText: question.text,
        userName: payload.userName,
        userId: user?.uid || null,
        answerIndex: payload.answerIndex,
        isCorrect: payload.isCorrect,
      });
    } catch {
      // Keep the local answer when the network write fails.
    }
  };

  const answeredCount = Object.keys(results).length;
  const score = Object.values(results).filter(Boolean).length;
  const allDone = !loading && questions.length > 0 && answeredCount === questions.length;

  return (
    <>
      <SEOHead
        lang={lang}
        title={`${t('quiz')} — Bible Quiz`}
        description={t('quizPageSubtitle')}
        keywords="Bible quiz, Tyaza ubwenge, Bibiliya, quiz biblique"
      />

      <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
        <section className="relative overflow-hidden bg-[#0b0b0c] px-6 py-10 text-white ring-1 ring-black/10 sm:px-10 sm:py-12">
          <div aria-hidden="true" className="quiz-gradient pointer-events-none absolute inset-x-0 top-0 h-2/3" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b0c]/35 to-[#0b0b0c]"
          />

          <p className="relative flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
            <span aria-hidden="true" className="h-4 w-[3px] bg-red-500" /> Bible Quiz
          </p>
          <h1 className="relative mt-4 font-serif text-4xl font-semibold leading-none text-white sm:text-5xl">
            {t('quiz')}
          </h1>
          <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            {t('quizPageSubtitle')}
          </p>

          {!loading && questions.length > 0 && (
            <div className="relative mt-8">
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                    {t('quizScore')}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {score}
                    <span className="text-sm font-normal text-white/35">/{questions.length}</span>
                  </p>
                </div>
                <div className="border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                    {t('quizAnswerCount')}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {answeredCount}
                    <span className="text-sm font-normal text-white/35">/{questions.length}</span>
                  </p>
                </div>
                <div className="border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                    Bible Quiz
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {String(questions.length).padStart(2, '0')}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-[3px] w-full bg-white/10">
                <div
                  className="h-full bg-red-600 transition-[width] duration-500"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {!user?.displayName && (
          <section className="mt-4 border border-black/[0.08] bg-white p-5 sm:p-6">
            <label
              htmlFor="quiz-name"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
            >
              {t('quizNameLabel')}
            </label>
            <input
              id="quiz-name"
              type="text"
              value={name}
              maxLength={80}
              onChange={(event) => updateName(event.target.value)}
              placeholder={t('quizNamePlaceholder')}
              className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-gray-400 focus:border-black"
            />
          </section>
        )}

        {allDone && (
          <div className="mt-4 flex items-center gap-3 border border-black/[0.08] border-l-2 border-l-red-600 bg-white px-5 py-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center bg-red-600 text-white">
              <HelpCircle size={16} />
            </span>
            <p className="text-sm font-medium text-[#1a1a1a]">{t('quizAllDone')}</p>
          </div>
        )}

        {loading ? (
          <div className="mt-6 space-y-4">
            {[0, 1].map((key) => (
              <div key={key} className="animate-pulse border border-black/[0.08] p-6">
                <div className="h-4 w-28 bg-black/[0.06]" />
                <div className="mt-5 h-6 w-4/5 bg-black/[0.08]" />
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((option) => (
                    <div key={option} className="h-14 bg-black/[0.05]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center border border-black/[0.08] bg-white px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center bg-[#f4f4f5] text-gray-400">
              <HelpCircle size={24} />
            </span>
            <p className="mt-4 text-sm font-semibold text-[#1a1a1a]">{t('quizEmptyTitle')}</p>
            <p className="mt-1 max-w-xs text-xs text-gray-400">{t('quizEmptyBody')}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {questions.map((question, index) => {
              const answered = results[question.id] !== undefined;
              return (
                <section
                  key={question.id}
                  className="border border-black/[0.08] bg-white p-5 sm:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      <span className="grid h-6 w-6 place-items-center bg-red-600 text-[10px] font-bold text-white">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {t('quiz')}
                    </span>
                    {answered && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                          results[question.id] ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {t(results[question.id] ? 'quizCorrectShort' : 'quizWrongShort')}
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <QuizQuestionCard
                      question={question}
                      answers={answers}
                      userName={user?.displayName || name}
                      onUserNameChange={updateName}
                      onSubmit={(payload) => handleSubmit(question, payload)}
                      onChecked={(isCorrect) =>
                        setResults((previous) => ({ ...previous, [question.id]: isCorrect }))
                      }
                    />
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default QuizPage;
