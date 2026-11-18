import { useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LanguageProvider, isLanguage, useLanguage } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { JournalProvider } from './contexts/JournalContext';
import Layout from './components/Layout';
import SEOHead from './components/SEOHead';
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import MediaPage from './pages/MediaPage';
import MediaDetailPage from './pages/MediaDetailPage';
import VersePage from './pages/VersePage';
import JournalPage from './pages/JournalPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import StaticPage from './pages/StaticPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const LanguageGate = () => {
  const { lang } = useParams();
  const location = useLocation();
  if (!isLanguage(lang || '')) {
    const rest = location.pathname.replace(/^\/[^/]*/, '');
    return <Navigate to={`/rw${rest}${location.search}`} replace />;
  }
  return <Layout />;
};

const NotFound = () => {
  const { lang, t } = useLanguage();
  return (
    <>
      <SEOHead
        lang={lang}
        title={`404 — ${t('pageNotFound')}`}
        description={t('pageNotFound')}
        robots="noindex, follow"
      />
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <p className="text-[64px] font-black leading-none tracking-tighter text-gray-200">404</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-black">
          {t('pageNotFound')}
        </h1>
        <Link
          to={`/${lang}`}
          className="mt-6 inline-flex items-center gap-2 bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition hover:bg-red-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('goHome')}
        </Link>
      </div>
    </>
  );
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Navigate to="/rw" replace />} />
      <Route path="/:lang" element={<LanguageGate />}>
        <Route index element={<Home />} />
        <Route path="articles/:slug" element={<ArticlePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="media/:id" element={<MediaDetailPage />} />
        <Route path="verse" element={<VersePage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="signin" element={<AuthPage mode="signin" />} />
        <Route path="signup" element={<AuthPage mode="signup" />} />
        <Route path="donate" element={<StaticPage kind="donate" />} />
        <Route path="privacy" element={<StaticPage kind="privacy" />} />
        <Route path="terms" element={<StaticPage kind="terms" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/rw" replace />} />
    </Routes>
  </>
);

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <JournalProvider>
        <AppRoutes />
      </JournalProvider>
    </AuthProvider>
  </LanguageProvider>
);

export default App;
