import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Heart, LogOut, NotebookPen, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../contexts/JournalContext';
import UserAvatar from '../components/UserAvatar';
import SEOHead from '../components/SEOHead';
import { BRAND } from '../constants';

const AccountPage = () => {
  const { lang, t } = useLanguage();
  const { user, loading, signOut } = useAuth();
  const journal = useJournal();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-gray-500">
        {t('loading')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter">{t('signIn')}</h1>
        <p className="mt-2 text-sm text-gray-600">{t('signInSubtitle')}</p>
        <Link
          to={`/${lang}/signin`}
          className="mt-6 inline-flex bg-[#1a1a1a] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
        >
          {t('signIn')}
        </Link>
      </div>
    );
  }

  const created = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime)
    : null;

  const stats = [
    { label: t('entriesCount'), value: journal.entries.length, icon: NotebookPen, to: `/${lang}/journal` },
    { label: t('savedArticles'), value: journal.savedArticles.length, icon: Bookmark, to: `/${lang}/journal` },
    { label: t('savedVerses'), value: journal.savedVerses.length, icon: Heart, to: `/${lang}/verse` },
  ];

  return (
    <>
      <SEOHead lang={lang} title={`${t('accountTitle')} | ${BRAND.name}`} url={`${BRAND.siteUrl}/${lang}/account`} robots="noindex, follow" />

      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-black uppercase tracking-tighter">{t('accountTitle')}</h1>
        <p className="mt-2 text-sm text-gray-600">{t('accountSubtitle')}</p>

        <div className="mt-8 border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <UserAvatar
              user={user}
              className="h-20 w-20 shrink-0 rounded-full border border-black/10"
            />
            <div className="min-w-0">
              <p className="truncate text-xl font-black uppercase tracking-tight">
                {user.displayName || t('accountTitle')}
              </p>
              <p className="truncate text-sm text-gray-500">{user.email}</p>
              {created && (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {t('memberSince')} {created.toLocaleDateString()}
                </p>
              )}
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 border border-black/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-600">
              <ShieldCheck size={13} className="text-red-600" />
              {t('privateBadge')}
            </span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="border border-black/10 p-4 transition hover:border-black"
              >
                <Icon size={16} className="text-red-600" />
                <p className="mt-2 text-3xl font-black tracking-tighter">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            to={`/${lang}/journal`}
            className="flex items-center justify-between border border-black/10 bg-white p-5 transition hover:border-black"
          >
            <span>
              <span className="block text-lg font-black uppercase tracking-tight">
                {t('journalTitle')}
              </span>
              <span className="mt-1 block text-xs text-gray-500">{t('journalSubtitle')}</span>
            </span>
            <NotebookPen size={20} className="text-gray-400 shrink-0" />
          </Link>
          <Link
            to={`/${lang}/verse`}
            className="flex items-center justify-between border border-black/10 bg-white p-5 transition hover:border-black"
          >
            <span>
              <span className="block text-lg font-black uppercase tracking-tight">
                {t('verseTitle')}
              </span>
              <span className="mt-1 block text-xs text-gray-500">{t('verseSubtitle')}</span>
            </span>
            <Sparkles size={20} className="text-red-600 shrink-0" />
          </Link>
        </div>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate(`/${lang}`);
          }}
          className="mt-8 inline-flex items-center gap-2 border border-black/20 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 transition hover:border-red-600 hover:text-red-600"
        >
          <LogOut size={14} />
          {t('signOut')}
        </button>

        <p className="mt-4 text-xs text-gray-400">
          {t('privacyTitle')}: {t('journalSignInText')}
        </p>
      </div>
    </>
  );
};

export default AccountPage;
