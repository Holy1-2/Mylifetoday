import { useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, X, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export interface QuizSubmitPayload {
  answerIndex: number;
  isCorrect: boolean;
  userName: string;
}

interface QuizQuestionCardProps {
  question: QuizQuestion;
  onSubmit: (payload: QuizSubmitPayload) => Promise<void> | void;
  compact?: boolean;
  dark?: boolean;
  userName?: string;
  onUserNameChange?: (value: string) => void;
  onChecked?: (isCorrect: boolean, answerIndex: number) => void;
  initialAnswerIndex?: number | null;
  deferResult?: boolean;
  actionLabel?: string;
  onAnswered?: (payload: QuizSubmitPayload) => void;
}

const QuizQuestionCard = ({
  question,
  onSubmit,
  compact = false,
  dark = false,
  userName,
  onUserNameChange,
  onChecked,
  initialAnswerIndex = null,
  deferResult = false,
  actionLabel,
  onAnswered,
}: QuizQuestionCardProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const controlled = typeof onUserNameChange === 'function';
  const [localName, setLocalName] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem('mlt-quiz-name') || '';
    } catch {
      return '';
    }
  });
  const [selected, setSelected] = useState<number | null>(initialAnswerIndex);
  const [checked, setChecked] = useState(initialAnswerIndex !== null);
  const [nameError, setNameError] = useState('');
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSelected(initialAnswerIndex);
    setChecked(initialAnswerIndex !== null);
    setNameError('');
  }, [question.id, initialAnswerIndex]);

  const isCorrect = selected !== null && selected === question.correctIndex;
  const radius = dark ? 'rounded-none' : 'rounded-xl';

  const handleCheck = () => {
    if (selected === null) return;
    const typedName = controlled ? userName || '' : localName;
    const cleanName = (user?.displayName || typedName).trim();
    if (!cleanName) {
      setNameError(t('quizNameRequired'));
      nameRef.current?.focus();
      return;
    }
    setNameError('');
    if (!controlled && !user?.displayName) {
      try {
        window.localStorage.setItem('mlt-quiz-name', cleanName);
      } catch {
        // Storage can be unavailable in private browsing.
      }
    }

    const payload = { answerIndex: selected, isCorrect, userName: cleanName.slice(0, 80) };
    try {
      void Promise.resolve(onSubmit(payload)).catch(() => {
        // The result is revealed even when the network write fails.
      });
    } catch {
      // Ignore a synchronous submit error and reveal the result anyway.
    }
    if (deferResult) {
      onAnswered?.(payload);
      return;
    }
    setChecked(true);
    onChecked?.(isCorrect, selected);
  };

  const optionClass = (index: number) => {
    const base = `flex w-full items-start gap-3 border px-3.5 py-3 text-left transition-colors ${radius}`;
    if (checked) {
      if (index === question.correctIndex) {
        return `${base} ${
          dark
            ? 'border-emerald-500/60 bg-emerald-500/15 text-white'
            : 'border-emerald-500 bg-emerald-50/80'
        }`;
      }
      if (index === selected) {
        return `${base} ${
          dark ? 'border-red-500/70 bg-red-500/15 text-white' : 'border-red-400 bg-red-50/80'
        }`;
      }
      return `${base} ${dark ? 'border-white/10 opacity-40' : 'border-black/[0.07] opacity-50'}`;
    }
    if (index === selected) {
      return dark
        ? `${base} border-red-500 bg-red-600 text-white shadow-[0_10px_24px_-14px_rgba(239,68,68,0.8)]`
        : `${base} border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)]`;
    }
    return dark
      ? `${base} border-white/15 bg-white/[0.04] hover:border-white/40 hover:bg-white/[0.08]`
      : `${base} border-black/10 hover:border-black/35 hover:bg-black/[0.02]`;
  };

  const badgeClass = (index: number) => {
    if (checked && index === question.correctIndex) {
      return 'bg-emerald-600 text-white';
    }
    if (checked && index === selected) {
      return 'bg-red-500 text-white';
    }
    if (!checked && index === selected) {
      return dark ? 'bg-white text-[#0b0b0c]' : 'bg-white text-[#1a1a1a]';
    }
    return dark ? 'bg-white/10 text-white/60' : 'bg-[#f1f1f3] text-gray-500';
  };

  return (
    <div>
      <h3
        className={`font-semibold leading-snug ${dark ? 'text-white' : 'text-[#1a1a1a]'} ${
          compact ? 'text-[17px]' : 'text-xl sm:text-2xl'
        }`}
      >
        {question.text}
      </h3>

      <div className={`mt-4 grid gap-2 ${compact ? '' : 'sm:grid-cols-2'}`}>
        {question.options.map((option, index) => (
          <button
            key={`${question.id}-${index}`}
            type="button"
            disabled={checked}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            className={optionClass(index)}
          >
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center text-[10px] font-bold transition-colors ${
                dark ? 'rounded-none' : 'rounded-full'
              } ${badgeClass(index)}`}
            >
              {LETTERS[index]}
            </span>
            <span
              className={`flex-1 pt-0.5 text-sm leading-snug ${
                checked && index === question.correctIndex
                  ? dark
                    ? 'font-semibold text-emerald-200'
                    : 'font-semibold text-emerald-900'
                  : checked && index === selected
                    ? dark
                      ? 'text-red-200'
                      : 'text-red-900'
                    : ''
              }`}
            >
              {option}
            </span>
            {checked && index === question.correctIndex && (
              <Check size={16} className="mt-1 shrink-0 text-emerald-500" />
            )}
            {checked && index === selected && index !== question.correctIndex && (
              <X size={16} className="mt-1 shrink-0 text-red-400" />
            )}
          </button>
        ))}
      </div>

      {!user && !controlled && !checked && (
        <div className="mt-4">
          <label
            htmlFor={`quiz-name-${question.id}`}
            className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
              dark ? 'text-white/40' : 'text-gray-400'
            }`}
          >
            {t('quizNameLabel')}
          </label>
          <input
            id={`quiz-name-${question.id}`}
            ref={nameRef}
            type="text"
            value={localName}
            maxLength={80}
            onChange={(event) => {
              setLocalName(event.target.value);
              if (nameError) setNameError('');
            }}
            placeholder={t('quizNamePlaceholder')}
            className={`mt-1.5 w-full border px-3.5 py-2.5 text-sm outline-none transition ${radius} ${
              dark
                ? 'border-white/15 bg-white/[0.06] text-white placeholder:text-white/30 focus:border-red-500'
                : 'border-black/10 bg-white text-[#1a1a1a] placeholder:text-gray-400 focus:border-black'
            }`}
          />
        </div>
      )}

      {nameError && (
        <p
          className={`mt-2 text-xs font-medium ${dark ? 'text-red-300' : 'text-red-600'}`}
          role="alert"
        >
          {nameError}
        </p>
      )}

      {!checked && (
        <button
          type="button"
          onClick={handleCheck}
          disabled={selected === null}
          className={`mt-5 flex w-full items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-[0.16em] transition ${radius} ${
            selected === null
              ? dark
                ? 'cursor-not-allowed bg-white/[0.06] text-white/30'
                : 'cursor-not-allowed bg-black/[0.06] text-gray-400'
              : dark
                ? 'bg-red-600 text-white hover:bg-red-500 active:scale-[0.99]'
                : 'bg-[#1a1a1a] text-white hover:bg-black active:scale-[0.99]'
          }`}
        >
          {actionLabel || t('quizCheck')}
        </button>
      )}

      {checked && (
        <div
          className={`mt-4 border p-4 ${radius} ${
            isCorrect
              ? dark
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : dark
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {t(isCorrect ? 'quizCorrect' : 'quizWrong')}
          </div>
          {!isCorrect && selected !== null && (
            <p
              className={`mt-2 text-xs leading-relaxed ${
                dark ? 'text-red-200/90' : 'text-red-800/90'
              }`}
            >
              {t('quizCorrectAnswer')}:{' '}
              <span className="font-semibold">
                {LETTERS[question.correctIndex]}. {question.options[question.correctIndex]}
              </span>
            </p>
          )}
          {(question.reference || question.explanation) && (
            <div className="mt-2.5 border-t border-current/10 pt-2.5">
              {question.reference && (
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
                  {question.reference}
                </p>
              )}
              {question.explanation && (
                <p className="mt-1 text-xs leading-relaxed opacity-90">{question.explanation}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizQuestionCard;
