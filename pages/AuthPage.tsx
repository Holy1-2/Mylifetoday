import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../constants';
import SEOHead from '../components/SEOHead';

interface AuthPageProps {
  mode: 'signin' | 'signup';
}

const errorCopy = (code: string): string => {
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'invalidCredentials';
  if (code.includes('email-already-in-use')) return 'emailInUse';
  if (code.includes('weak-password')) return 'weakPassword';
  if (code.includes('too-many-requests')) return 'tooManyRequests';
  if (code.includes('invalid-email')) return 'emailInvalid';
  return 'authGenericError';
};

const AuthPage = ({ mode }: AuthPageProps) => {
  const { lang, t } = useLanguage();
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      toast.error(t('emailInvalid'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('passwordMin'));
      return;
    }
    if (isSignup && password !== confirm) {
      toast.error(t('passwordMismatch'));
      return;
    }

    setBusy(true);
    try {
      if (isSignup) await signUp(clean, password, name);
      else await signIn(clean, password);
      navigate(from || `/${lang}/journal`, { replace: true });
    } catch (error) {
      const code = (error as { code?: string })?.code || '';
      toast.error(t(errorCopy(code)));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      toast.error(t('emailInvalid'));
      return;
    }
    try {
      await resetPassword(clean);
      toast.success(t('resetSent'));
    } catch (error) {
      const code = (error as { code?: string })?.code || '';
      toast.error(t(errorCopy(code)));
    }
  };

  const field =
    'w-full border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-black transition-colors';

  return (
    <>
      <SEOHead
        lang={lang}
        title={`${isSignup ? t('signUpTitle') : t('signInTitle')} | ${BRAND.name}`}
        url={`${BRAND.siteUrl}/${lang}/${isSignup ? 'signup' : 'signin'}`}
        robots="noindex, follow"
      />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden bg-[#1a1a1a] p-10 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
            {BRAND.name}
          </p>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-tighter leading-none">
            {t('journalTitle')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">{t('journalSubtitle')}</p>
          <ul className="mt-8 space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-red-500" />
              {t('savedVerses')}
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-red-500" />
              {t('reflections')}
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-red-500" />
              {t('prayers')} · {t('answered')}
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-red-500" />
              {t('notes')} · {t('savedArticles')}
            </li>
          </ul>
          <p className="mt-8 border border-white/10 p-3 text-xs text-gray-500">
            {t('journalSignInText')}
          </p>
        </div>
      </div>

      <div className="border border-black/10 bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          {isSignup ? t('signUpTitle') : t('signInTitle')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isSignup ? t('signUpSubtitle') : t('signInSubtitle')}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {isSignup && (
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`${t('displayNameLabel')} (${t('optional')})`}
                className={field}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailLabel')}
              autoComplete="email"
              className={field}
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordLabel')}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className={`${field} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={t('passwordLabel')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {isSignup && (
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t('confirmPasswordLabel')}
              autoComplete="new-password"
              className={`${field} pl-4`}
            />
          )}

          {!isSignup && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={forgot}
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 transition hover:text-black"
              >
                {t('resetPassword')}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 bg-[#1a1a1a] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-black disabled:opacity-60"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {isSignup ? t('signUp') : t('signIn')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          {isSignup ? t('alreadyHaveAccount') : t('noAccount')}{' '}
          <Link
            to={`/${lang}/${isSignup ? 'signin' : 'signup'}`}
            className="font-bold text-black underline underline-offset-4"
          >
            {isSignup ? t('signIn') : t('signUp')}
          </Link>
        </p>

        <p className="mt-6 border-t border-gray-200 pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {t('privateBadge')} · {BRAND.name}
        </p>
      </div>
      </div>
    </>
  );
};

export default AuthPage;
