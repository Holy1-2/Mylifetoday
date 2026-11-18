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
import { initials } from '../utils/text';
import NewsletterForm from './NewsletterForm';

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
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  const roundButton =
    'grid h-10 w-10 place-items-center rounded-full text-gray-700 transition-colors hover:bg-black/[0.06] hover:text-black';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1a1a1a]">
      {announcement && (
        <div className="bg-[#0b0b0c] text-white">
          <div className="mx-auto max-w-7xl px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]">
            {announcement}
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 border-b border-black/[0.07] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-[72px] sm:px-6">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={`${roundButton} shrink-0`}
              aria-label={menuOpen ? t('close') : 'Menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to={`/${lang}`} className="min-w-0 py-2">
              <h1 className="truncate text-lg font-semibold uppercase leading-none tracking-tight sm:text-xl lg:text-2xl">
                {siteName}
              </h1>
              <p className="mt-1 truncate text-[9px] font-medium uppercase tracking-[0.26em] text-gray-400">
                {tagline}
              </p>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="hidden items-center gap-0.5 rounded-full bg-[#1a1a1a] p-1 sm:flex">
              {LANGUAGES.map((l) => {
                const active = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`flex h-8 items-center gap-1.5 rounded-full px-2 text-[9px] font-semibold uppercase tracking-[0.08em] transition-all ${
                      active
                        ? 'bg-white text-[#1a1a1a] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)]'
                        : 'text-white/65 hover:bg-white/10 hover:text-white'
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
              className={`${roundButton} bg-[#f4f4f5] hover:bg-[#1a1a1a] hover:text-white`}
              aria-label={t('search')}
            >
              <Search size={19} />
            </Link>

            {user ? (
              <Link
                to={`/${lang}/account`}
                aria-label={t('account')}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#1a1a1a] text-[10px] font-semibold text-white ring-2 ring-white transition hover:bg-black"
              >
                {initials(user.displayName || user.email)}
              </Link>
            ) : (
              <Link
                to={`/${lang}/signin`}
                aria-label={t('signIn')}
                className="hidden h-10 items-center gap-2 rounded-full border border-black/10 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-black/40 sm:flex"
              >
                <UserRound size={14} />
                {t('signIn')}
              </Link>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="absolute left-0 right-0 top-full px-3 pt-2 sm:px-4">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_35px_70px_-30px_rgba(0,0,0,0.45)] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[calc(100vh-5.5rem)] overflow-y-auto p-4 sm:p-6">
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
    </div>
  );
};

export default Layout;
