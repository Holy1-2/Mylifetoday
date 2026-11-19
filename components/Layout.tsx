import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  DollarSign,
  ExternalLink,
  Heart,
  Home,
  Instagram,
  Facebook,
  Mail,
  Menu,
  MessageCircle,
  MonitorPlay,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { LANGUAGES, SOCIAL_LINKS, TRANSLATIONS } from '../constants';
import { Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getSiteSettings } from '../services/firebaseService';
import UserAvatar from './UserAvatar';
import NewsletterForm from './NewsletterForm';
import ScrollButtons from './ScrollButtons';

const navItems = [
  { key: 'home', to: '' },
  { key: 'media', to: 'media' },
  { key: 'verseOfDay', to: 'verse' },
  { key: 'journal', to: 'journal' },
];

const Layout = () => {
  const { lang, setLang, t, categoryName } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    let active = true;
    getSiteSettings().then((settings) => {
      if (!active || !settings) return;
      setAnnouncement(String(settings.announcement || '').trim());
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const siteName = TRANSLATIONS.siteName[lang];
  const tagline = TRANSLATIONS.tagline[lang];

  const flag = (code: string, label: string) => (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={label}
      className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
    />
  );

  const isArticleReading = /^\/[^/]+\/articles\//.test(location.pathname);

  const roundButton = `grid h-10 w-10 place-items-center rounded-full transition-colors ${
    isArticleReading
      ? 'text-gray-600 hover:bg-black/[0.06] hover:text-black'
      : 'text-white/80 hover:bg-white/10 hover:text-white'
  }`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1a1a1a]">
      {announcement && (
        <div className="border-b border-white/10 bg-[#0b0b0c] text-white">
          <div className="mx-auto max-w-7xl px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]">
            {announcement}
          </div>
        </div>
      )}

      <nav
        className={`sticky top-0 z-50 border-b transition-colors ${
          isArticleReading
            ? 'border-black/[0.08] bg-white text-[#1a1a1a] shadow-[0_1px_0_rgba(0,0,0,0.03)]'
            : 'border-white/10 bg-[#0b0b0c] text-white'
        }`}
      >
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:h-[88px] sm:px-6">
          <Link
            to={`/${lang}`}
            aria-label={siteName}
            className="flex min-w-0 items-center transition hover:opacity-75"
          >
            <img
              src="/logo.png"
              alt={`${siteName} logo`}
              className={`h-17 w-17 shrink-0 object-contain sm:h-[72px] sm:w-[72px] ${
                isArticleReading ? 'brightness-0' : 'brightness-0 invert'
              }`}
            />
          </Link>

          <Link to={`/${lang}`} className="min-w-0 max-w-[34vw] text-center sm:max-w-none">
            <h1
              className={`truncate text-[14px] font-semibold uppercase leading-none tracking-tight sm:text-xl lg:text-2xl ${
                isArticleReading ? 'text-[#1a1a1a]' : 'text-white'
              }`}
            >
              {siteName}
            </h1>
            <p
              className={`mt-1 hidden truncate text-[8px] font-medium uppercase tracking-[0.24em] sm:block sm:text-[9px] ${
                isArticleReading ? 'text-gray-500' : 'text-white/45'
              }`}
            >
              {tagline}
            </p>
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={`${roundButton} shrink-0`}
              aria-label={menuOpen ? t('close') : 'Menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div
              className={`hidden items-center gap-0.5 rounded-full border p-1 sm:flex ${
                isArticleReading
                  ? 'border-black/10 bg-white'
                  : 'border-white/15 bg-white/[0.06]'
              }`}
            >
              {LANGUAGES.map((l) => {
                const active = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`flex h-8 items-center gap-1.5 rounded-full px-2 text-[9px] font-semibold uppercase tracking-[0.08em] transition-all ${
                      active
                        ? isArticleReading
                          ? 'bg-[#f1f1f3] text-[#1a1a1a] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'
                          : 'bg-white text-[#0b0b0c] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]'
                        : isArticleReading
                          ? 'text-gray-500 hover:bg-black/[0.04] hover:text-[#1a1a1a]'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={`Switch to ${l.label}`}
                  >
                    {flag(l.flag, l.label)}
                    <span className="hidden lg:inline">{l.short}</span>
                  </button>
                );
              })}
            </div>

            <Link
              to={`/${lang}/search`}
              className={`${roundButton} ${
                isArticleReading
                  ? 'bg-[#f4f4f5] hover:bg-[#1a1a1a] hover:text-white'
                  : 'bg-white/[0.08] hover:bg-white hover:text-[#0b0b0c]'
              }`}
              aria-label={t('search')}
            >
              <Search size={19} />
            </Link>

            {user ? (
              <Link
                to={`/${lang}/account`}
                aria-label={t('account')}
                className={`h-10 w-10 overflow-hidden rounded-full ring-2 transition ${
                  isArticleReading
                    ? 'bg-[#f4f4f5] ring-white hover:ring-black/20'
                    : 'bg-white/10 ring-white/20 hover:ring-white/60'
                }`}
              >
                <UserAvatar user={user} className="h-full w-full" />
              </Link>
            ) : (
              <Link
                to={`/${lang}/signin`}
                aria-label={t('signIn')}
                className={`hidden h-10 items-center gap-2 rounded-full border px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors sm:flex ${
                  isArticleReading
                    ? 'border-black/10 text-gray-700 hover:border-black/40 hover:text-black'
                    : 'border-white/20 text-white/85 hover:border-white/60 hover:text-white'
                }`}
              >
                <UserRound size={14} />
                {t('signIn')}
              </Link>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="fixed inset-0 z-[70] flex flex-col bg-white text-[#1a1a1a] sm:absolute sm:inset-auto sm:left-0 sm:right-0 sm:top-full sm:z-50 sm:block sm:bg-transparent sm:px-4 sm:pt-2">
            <div className="flex items-center justify-between border-b border-black/[0.07] px-4 py-3 sm:hidden">
              <Link to={`/${lang}`} className="flex min-w-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
                <img
                  src="/logo-mark.png"
                  alt={`${siteName} logo`}
                  className="h-12 w-12 shrink-0 object-contain brightness-0"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold uppercase leading-none tracking-tight">
                    {siteName}
                  </p>
                  <p className="mt-1 truncate text-[8px] font-medium uppercase tracking-[0.24em] text-gray-400">
                    {tagline}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t('close')}
                className="grid h-10 w-10 place-items-center rounded-full text-gray-700 transition hover:bg-black/[0.06]"
              >
                <X size={22} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain sm:flex-none sm:overflow-visible">
            <div className="mx-auto max-w-7xl sm:overflow-hidden sm:rounded-2xl sm:border sm:border-black/[0.08] sm:bg-white sm:shadow-[0_35px_70px_-30px_rgba(0,0,0,0.45)] sm:animate-in sm:fade-in sm:slide-in-from-top-2 sm:duration-200">
              <div className="p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:max-h-[calc(100dvh-7rem)] sm:overflow-y-auto sm:p-6">
                <Link
                  to={`/${lang}/search`}
                  className="flex items-center gap-3 rounded-full bg-[#f5f5f6] px-5 py-3 text-sm text-gray-500 transition hover:bg-[#ececee] hover:text-[#1a1a1a]"
                >
                  <Search size={16} />
                  {t('search')}
                </Link>

                <div className="mt-6 grid gap-8 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <h4 className="mb-1 px-3 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      {t('quickLinks')}
                    </h4>
                    {[
                      { to: `/${lang}`, label: t('home'), icon: Home, end: true },
                      { to: `/${lang}/media`, label: t('media'), icon: MonitorPlay },
                      { to: `/${lang}/verse`, label: t('verseOfDay'), icon: Sparkles },
                      { to: `/${lang}/journal`, label: t('journal'), icon: Heart },
                      { to: `/${lang}/search`, label: t('search'), icon: Search },
                      { to: `/${lang}/donate`, label: t('donate'), icon: DollarSign },
                    ].map(({ to, label, icon: Icon, end }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-medium tracking-tight transition-colors ${
                            isActive
                              ? 'bg-[#1a1a1a] text-white'
                              : 'text-[#1a1a1a] hover:bg-black/[0.04]'
                          }`
                        }
                      >
                        <Icon size={18} className="opacity-50" />
                        {label}
                      </NavLink>
                    ))}
                  </div>

                  <div>
                    <h4 className="mb-3 px-1 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      {t('categories')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(Category).map((cat) => (
                        <Link
                          key={cat}
                          to={`/${lang}/search?category=${cat}`}
                          className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-gray-600 transition-colors hover:border-black/30 hover:bg-black/[0.03] hover:text-[#1a1a1a]"
                        >
                          {categoryName(cat)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-4 border-t border-black/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="inline-flex items-center gap-0.5 self-start rounded-full bg-[#f4f4f5] p-1">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLang(l.code)}
                        className={`flex h-9 items-center gap-2 rounded-full px-3 text-[11px] font-medium transition-all ${
                          lang === l.code
                            ? 'bg-[#1a1a1a] text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.45)]'
                            : 'text-gray-500 hover:text-[#1a1a1a]'
                        }`}
                      >
                        {flag(l.flag, l.label)}
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <Link
                    to={user ? `/${lang}/account` : `/${lang}/signin`}
                    className="inline-flex items-center gap-2 self-start rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black sm:self-auto"
                  >
                    <UserRound size={14} />
                    {user ? t('account') : t('signIn')}
                  </Link>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#1a1a1a] text-white pt-24 lg:pt-32 pb-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
            <div className="lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-6">
                {siteName}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md font-serif italic">
                {tagline}
              </p>
              <a
                href={`mailto:${SOCIAL_LINKS.email}`}
                className="mt-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors break-all"
              >
                <Mail size={16} className="shrink-0" />
                {SOCIAL_LINKS.email}
              </a>
              <div className="flex gap-4 mt-8">
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"
                >
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-2">
                {t('quickLinks')}
              </h4>
              {[
                { to: `/${lang}`, label: t('home') },
                { to: `/${lang}/media`, label: t('media') },
                { to: `/${lang}/verse`, label: t('verseOfDay') },
                { to: `/${lang}/journal`, label: t('journal') },
                { to: `/${lang}/search`, label: t('search') },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-sm font-bold uppercase hover:text-red-500">
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-2">
                {t('categories')}
              </h4>
              {[
                Category.DAILY_LIFE,
                Category.RELATIONSHIPS,
                Category.HEALTH,
                Category.HOPE,
                Category.TESTIMONY,
              ].map((cat) => (
                <Link
                  key={cat}
                  to={`/${lang}/search?category=${cat}`}
                  className="text-sm font-bold uppercase hover:text-red-500"
                >
                  {categoryName(cat)}
                </Link>
              ))}
              <Link to={`/${lang}/donate`} className="text-sm font-bold uppercase hover:text-red-500">
                {t('donate')}
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 pt-10">
            <div className="max-w-md">
              <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-3">
                {t('newsletterTitle')}
              </h4>
              <NewsletterForm compact />
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            <p>
              © {new Date().getFullYear()} {siteName}. {t('rights')}
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to={`/${lang}/terms`} className="flex items-center gap-2 hover:text-white transition-colors">
                {t('termsTitle')}
              </Link>
              <Link to={`/${lang}/privacy`} className="flex items-center gap-2 hover:text-white transition-colors">
                {t('privacyTitle')}
              </Link>
              <a
                href="https://devtopray.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                {t('portfolio')} <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <ScrollButtons />
    </div>
  );
};

export default Layout;
