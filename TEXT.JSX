import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import {
  Menu, X, Search, Heart, Briefcase,
  Smartphone, Users, Globe, BookOpen, Sun,
  Send, Share2, ChevronRight, ArrowLeft, Clock,
  ChevronLeft, LayoutGrid, Newspaper, User, Hash, ExternalLink,
  MessageCircle, Shield, FileText, Info, Activity, Leaf, Pill, Apple,
  TrendingUp, Home, DollarSign, Heart as HeartIcon, Brain, Cpu, Users as UsersIcon, Sparkles,
  LogIn, LogOut, Plus, Edit, Trash2, BarChart, Settings, Eye, Download, Upload,
  Filter, Calendar, Tag, Bookmark, BookmarkCheck, Copy, Check, Loader2, Send as SendIcon
} from 'lucide-react';
import { Article, Category, Language, Comment } from './types';
import { TRANSLATIONS, LANGUAGES } from './constants';
import { getArticles, getArticleById, searchArticles, addSubscription, getCategories, getArticlesByCategory } from './services/firebaseService';
import SEOHead from './components/SEOHead';
import AdminDashboard from './components/AdminDashboard';
import SafeHTMLRenderer from './components/SafeHTMLRenderer';
import ArticleContent from './components/ArticleContent';
import { debounce } from 'lodash';

// --- Context ---
interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => { },
  t: () => '',
});

const AuthContext = createContext<{
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}>({
  user: null,
  login: async () => { },
  logout: () => { },
});
const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'tech':
      return <Cpu />;
    case 'mental_health':
      return <Heart />;
    case 'health':
      return <DollarSign />;
    case 'relationships':
      return <Globe />;
    case 'daily_life':
      return <BookOpen />;
    case 'hope':  
      return <Leaf />;
    default:
      return <FileText />;
  }
};
// --- Skeleton Loaders ---
const ArticleCardSkeleton: React.FC<{ type?: 'big' | 'small' | 'grid' }> = ({ type = 'big' }) => {
  if (type === 'big') {
    return (
      <div className="border-b border-black/10 pb-8 mb-8 animate-pulse">
        <div className="aspect-video bg-gray-200 mb-4"></div>
        <div className="h-4 bg-gray-200 w-32 mb-2"></div>
        <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 w-full"></div>
          <div className="h-4 bg-gray-200 w-5/6"></div>
          <div className="h-4 bg-gray-200 w-4/6"></div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <div className="h-3 bg-gray-200 w-24"></div>
          <div className="h-3 bg-gray-200 w-20"></div>
          <div className="h-3 bg-gray-200 w-16"></div>
        </div>
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="group cursor-pointer animate-pulse">
        <div className="w-full aspect-square bg-gray-200 mb-4"></div>
        <div className="h-3 bg-gray-200 w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 w-full mb-2"></div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer flex gap-6 mb-6 pb-6 border-b border-black/10 animate-pulse">
      <div className="w-32 h-32 flex-shrink-0 bg-gray-200"></div>
      <div className="flex flex-col flex-1">
        <div className="h-3 bg-gray-200 w-20 mb-2"></div>
        <div className="h-5 bg-gray-200 w-full mb-2"></div>
        <div className="h-3 bg-gray-200 w-32 mt-auto"></div>
      </div>
    </div>
  );
};

const CategorySkeleton: React.FC = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="p-3 bg-gray-100">
        <div className="h-4 bg-gray-200"></div>
      </div>
    ))}
  </div>
);

// --- Empty State Components ---
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="text-center py-20">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>
    {action}
  </div>
);

// --- Enhanced UI Components ---
const Button: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', size = 'md', loading = false, className = '', disabled = false }) => {
  const base = "font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2";
  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2 text-xs",
    lg: "px-8 py-3 text-sm"
  };
  const variants = {
    primary: "bg-[#1a1a1a] text-white hover:bg-black disabled:bg-gray-400",
    secondary: "bg-[#f4f4f4] text-[#1a1a1a] hover:bg-gray-200 disabled:bg-gray-100",
    outline: "border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white disabled:border-gray-300 disabled:text-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "hover:bg-gray-100 text-gray-600"
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

const EnhancedSearchBar: React.FC<{
  onSearch: (term: string) => void;
  onClear: () => void;
  loading?: boolean;
}> = ({ onSearch, onClear, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { lang } = useContext(LanguageContext);
  const [copied, setCopied] = useState(false);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.trim()) {
        onSearch(term);
      }
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      onClear();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onClear();
  };

  const handleShareSearch = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('search', searchTerm);
    const url = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Search results for "${searchTerm}"`,
          text: `Check out these articles about "${searchTerm}"`,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={TRANSLATIONS.ui.searchPlaceholder[lang]}
          className="w-full p-4 pl-12 pr-32 border-2 border-black rounded-none focus:outline-none focus:border-red-600"
          disabled={loading}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        
        {searchTerm && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <>
                <button
                  onClick={handleShareSearch}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Share search results"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {searchTerm && !loading && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-10 p-2 text-xs">
          <div className="flex items-center justify-between text-gray-500 px-2 py-1">
            <span>Press Enter to search</span>
            <span>Esc to clear</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ShareMenu: React.FC<{ article: Article }> = ({ article }) => {
  const { lang } = useContext(LanguageContext);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: <Copy size={16} />,
      action: async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'Share to Facebook',
      icon: <Share2 size={16} />,
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Share to Twitter',
      icon: <Share2 size={16} />,
      action: () => {
        const text = encodeURIComponent(`"${article.title[lang]}" - ${TRANSLATIONS.siteName[lang]}`);
        const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Share via Email',
      icon: <Send size={16} />,
      action: () => {
        const subject = encodeURIComponent(article.title[lang]);
        const body = encodeURIComponent(`Check out this article: ${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title[lang],
          text: article.situation[lang],
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={navigator.share ? handleNativeShare : () => setShowMenu(!showMenu)}
        className="group"
      >
        {copied ? (
          <>
            <Check size={16} className="text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Share2 size={16} />
            {TRANSLATIONS.ui.share[lang]}
          </>
        )}
      </Button>
      
      {showMenu && !navigator.share && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-50 animate-in slide-in-from-top">
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.action();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              {option.icon}
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Category Navigation ---
const CategoryNavigation: React.FC<{
  categories: Category[];
  activeCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
  articleCounts: Record<Category, number>;
}> = ({ categories, activeCategory, onCategorySelect, articleCounts }) => {
  const { lang } = useContext(LanguageContext);
  const [viewAll, setViewAll] = useState(false);

  const displayedCategories = viewAll ? categories : categories.slice(0, 6);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Browse Categories</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewAll(!viewAll)}
          className="text-xs"
        >
          {viewAll ? 'Show Less' : 'View All'} <ChevronRight size={14} />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onCategorySelect(null)}
          className={`p-4 border-2 flex flex-col items-center justify-center gap-2 transition-all ${activeCategory === null ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}
        >
          <LayoutGrid size={20} />
          <span className="text-xs font-bold uppercase">All</span>
          <span className="text-xs opacity-60">{Object.values(articleCounts).reduce((a, b) => a + b, 0)}</span>
        </button>
        
        {displayedCategories.map(category => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`p-4 border-2 flex flex-col items-center justify-center gap-2 transition-all ${activeCategory === category ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}
          >
            {getCategoryIcon(category)}
            <span className="text-xs font-bold uppercase text-center">
              {TRANSLATIONS.categories[category][lang]}
            </span>
            <span className="text-xs opacity-60">{articleCounts[category] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Enhanced Article Card ---
const EnhancedArticleCard: React.FC<{
  article: Article;
  onClick: (a: Article) => void;
  variant?: 'big' | 'small' | 'grid';
  showCategory?: boolean;
  showMetadata?: boolean;
}> = ({ article, onClick, variant = 'grid', showCategory = true, showMetadata = true }) => {
  const { lang } = useContext(LanguageContext);
  const [bookmarked, setBookmarked] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    // TODO: Implement bookmark storage
  };

  if (variant === 'big') {
    return (
      <div className="group cursor-pointer border-b border-black/10 pb-8 mb-8" onClick={() => onClick(article)}>
        <div className="aspect-video overflow-hidden mb-4 relative">
          <img
            src={article.image}
            alt={article.title[lang]}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <button
            onClick={handleBookmark}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            {bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>
        {showCategory && (
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 block">
            {TRANSLATIONS.categories[article.category][lang]}
          </span>
        )}
        <h3 className="text-3xl md:text-5xl font-bold leading-none tracking-tight group-hover:underline mb-4">
          {article.title[lang]}
        </h3>
        <p className="text-[#555] text-lg leading-relaxed line-clamp-3 mb-6">
          <SafeHTMLRenderer html={article.situation[lang]} />
        </p>
        {showMetadata && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#999]">
              <span>By {article.editor}</span>
              <span>•</span>
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.views || 0} views</span>
            </div>
            <ShareMenu article={article} />
          </div>
        )}
      </div>
    );
  }

  if (variant === 'small') {
    return (
      <div className="group cursor-pointer flex gap-6 mb-6 pb-6 border-b border-black/10" onClick={() => onClick(article)}>
        <div className="w-32 h-32 flex-shrink-0 overflow-hidden relative">
          <img
            src={article.image}
            alt={article.title[lang]}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col flex-1">
          {showCategory && (
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-1">
              {TRANSLATIONS.categories[article.category][lang]}
            </span>
          )}
          <h4 className="text-lg font-bold leading-tight group-hover:underline mb-2">{article.title[lang]}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2 flex-1">
            <SafeHTMLRenderer html={article.situation[lang]} />
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#999]">{article.date}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(article);
              }}
              className="text-[10px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
            >
              Read →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="group cursor-pointer" onClick={() => onClick(article)}>
      <div className="aspect-square overflow-hidden mb-4 relative">
        <img
          src={article.image}
          alt={article.title[lang]}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={handleBookmark}
          className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
        >
          {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
        <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white uppercase tracking-widest bg-black/80 px-2 py-1">
          {TRANSLATIONS.categories[article.category][lang]}
        </span>
      </div>
      <h5 className="font-bold leading-tight group-hover:underline mb-1">{article.title[lang]}</h5>
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>{article.date}</span>
        <span>{article.views || 0} views</span>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<'home' | 'health' | 'admin' | 'privacy' | 'terms'>('home');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Article[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [articleCounts, setArticleCounts] = useState<Record<Category, number>>({} as Record<Category, number>);
  const [searchQuery, setSearchQuery] = useState('');

  // Load articles from Firebase
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await getArticles();
        setArticles(data);
        setFilteredArticles(data);
        
        // Calculate article counts per category
        const counts = {} as Record<Category, number>;
        Object.values(Category).forEach(cat => {
          counts[cat] = data.filter(a => a.category === cat).length;
        });
        setArticleCounts(counts);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Handle category filter
  useEffect(() => {
    if (activeCategory) {
      const filtered = articles.filter(article => article.category === activeCategory);
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  }, [activeCategory, articles]);

  // Handle URL parameters for search and category
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
    
    if (searchParam) {
      setSearchQuery(searchParam);
      handleSearch(searchParam);
    }
    
    if (categoryParam && Object.values(Category).includes(categoryParam as Category)) {
      setActiveCategory(categoryParam as Category);
    }
  }, []);

  const navigateTo = (page: any, category?: Category) => {
    setCurrentPage(page);
    setActiveArticle(null);
    setSearchResults(null);
    setSearchQuery('');
    setIsMenuOpen(false);
    setShowSearch(false);
    setActiveCategory(category || null);
    window.scrollTo(0, 0);
    
    // Update URL without page reload
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', url);
  };

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setSearchQuery('');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchQuery(searchTerm);
      const results = await searchArticles(searchTerm);
      setSearchResults(results);
      setShowSearch(true);
      
      // Update URL with search parameter
      const params = new URLSearchParams(window.location.search);
      params.set('search', searchTerm);
      window.history.pushState({}, '', `?${params.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
    setSearchLoading(false);
    
    // Remove search parameter from URL
    const params = new URLSearchParams(window.location.search);
    params.delete('search');
    window.history.pushState({}, '', params.toString() ? `?${params.toString()}` : window.location.pathname);
  };

  const handleSubscribe = async (email: string, name?: string) => {
    try {
      await addSubscription(email, name);
      alert('Subscribed successfully!');
    } catch (error) {
      alert('Subscription failed. Please try again.');
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case Category.DAILY_LIFE: return <Home size={16} />;
      case Category.MONEY_WORK: return <DollarSign size={16} />;
      case Category.RELATIONSHIPS: return <HeartIcon size={16} />;
      case Category.MENTAL_HEALTH: return <Brain size={16} />;
      case Category.TECH: return <Cpu size={16} />;
      case Category.SOCIETY: return <UsersIcon size={16} />;
      case Category.HOPE: return <Sparkles size={16} />;
      case Category.HEALTH: return <Activity size={16} />;
      default: return <Newspaper size={16} />;
    }
  };

  const featuredArticle = filteredArticles[0];
  const sidebarArticles = filteredArticles.slice(1, 5);
  const listArticles = filteredArticles.slice(5, 15);
  const trendingArticles = filteredArticles.slice(0, 4);

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[key]?.[lang] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <AuthContext.Provider value={{
        user,
        login: async (email, password) => {
          // Implement Firebase auth login
        },
        logout: () => setUser(null)
      }}>
        <SEOHead
          title="Kubana n'Imana Buri Munsi"
          description="Kubana n'Imana Buri Munsi ni urubuga rutanga Ijambo ry'Imana, inyigisho ngufi, n'inama z'ubuzima bwa buri munsi: umubano, amafaranga, akazi, amahoro y'umutima, n'iterambere mu by'umwuka."
          keywords="Kubana n'Imana, Bibiliya, Ijambo ry'Imana, inyigisho, isengesho, kwizera, amahoro y'umutima, umubano, amafaranga, ubuzima bwa buri munsi, gikirisitu"
          article={activeArticle}
          lang={lang}
        />

        <div className="min-h-screen flex flex-col selection:bg-black selection:text-white">
          {/* Enhanced Navigation Bar */}
          <nav className="sticky top-0 z-50 bg-white border-b-2 border-black">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-gray-100 transition-colors relative"
                  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                  {activeCategory && !isMenuOpen && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                  )}
                </button>
                <div className="cursor-pointer" onClick={() => navigateTo('home')}>
                  <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{TRANSLATIONS.siteName[lang]}</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">{TRANSLATIONS.tagline[lang]}</p>
                </div>
              </div>

              <div className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-widest items-center">
                <button
                  onClick={() => navigateTo('home')}
                  className={`hover:text-red-600 transition-colors flex items-center gap-2 ${currentPage === 'home' ? 'text-red-600' : ''}`}
                >
                  <Home size={14} /> {t('home')}
                </button>
                <button
                  onClick={() => navigateTo('health')}
                  className={`hover:text-red-600 transition-colors flex items-center gap-2 ${currentPage === 'health' ? 'text-red-600' : ''}`}
                >
                  <Activity size={14} /> {t('health')}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`hover:text-red-600 transition-colors flex items-center gap-2 ${showSearch ? 'text-red-600' : ''}`}
                  >
                    <Search size={14} /> {t('search')}
                  </button>
                  {searchQuery && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                  )}
                </div>
                <button
                  onClick={() => navigateTo('admin')}
                  className="text-gray-400 hover:text-black flex items-center gap-2"
                >
                  <LogIn size={14} /> {t('ui.admin')}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex gap-2">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`text-[9px] font-black px-2 py-1 border border-black/10 hover:border-black transition-all ${lang === l.code ? 'bg-black text-white' : ''}`}
                      aria-label={`Switch to ${l.name}`}
                    >
                      {l.code}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                  aria-label="Search"
                >
                  <Search size={22} />
                  {searchQuery && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            {showSearch && (
              <div className="border-t border-gray-200 p-4 bg-white animate-in slide-in-from-top duration-300">
                <div className="max-w-7xl mx-auto">
                  <EnhancedSearchBar
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    loading={searchLoading}
                  />
                </div>
              </div>
            )}

            {/* Category Breadcrumb */}
            {activeCategory && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="hover:text-red-600 transition-colors"
                    >
                      All Categories
                    </button>
                    <ChevronRight size={12} />
                    <span className="font-bold flex items-center gap-2">
                      {getCategoryIcon(activeCategory)}
                      {TRANSLATIONS.categories[activeCategory][lang]}
                    </span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                      {filteredArticles.length} articles
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Overlay Menu */}
            {isMenuOpen && (
              <div className="absolute top-20 left-0 w-full bg-white border-b-4 border-black p-12 animate-in slide-in-from-top duration-300 shadow-2xl z-[100]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="flex flex-col gap-6">
                    <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400">Categories</h4>
                    {Object.values(Category).map(cat => (
                      <button
                        key={cat}
                        onClick={() => { navigateTo('home', cat); }}
                        className="text-2xl font-black uppercase tracking-tighter text-left hover:text-red-600 transition-all flex items-center gap-3 justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(cat)}
                          {TRANSLATIONS.categories[cat][lang]}
                        </div>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          ({articleCounts[cat] || 0})
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-6">
                    <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400">Resources</h4>
                    <button
                      onClick={() => navigateTo('health')}
                      className="text-2xl font-black uppercase tracking-tighter text-left hover:text-red-600 flex items-center gap-3"
                    >
                      <Activity /> Wellness Desk
                    </button>
                    <button
                      onClick={() => navigateTo('admin')}
                      className="text-2xl font-black uppercase tracking-tighter text-left hover:text-red-600 flex items-center gap-3"
                    >
                      <LogIn /> Admin Login
                    </button>
                    <button
                      onClick={() => navigateTo('privacy')}
                      className="text-2xl font-black uppercase tracking-tighter text-left hover:text-red-600 flex items-center gap-3"
                    >
                      <Shield /> Privacy
                    </button>
                  </div>
                  <div className="flex flex-col gap-6">
                    <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400">Subscribe</h4>
                    <div className="bg-black text-white p-6">
                      <h5 className="text-lg font-bold mb-4">Get Daily Wisdom</h5>
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full bg-white/10 border border-white/20 p-3 mb-3 text-sm outline-none placeholder-gray-400"
                      />
                      <Button variant="secondary" className="w-full">Subscribe</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Main Content Area */}
          <main className="flex-1">
            {activeArticle ? (
              <article className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in duration-500">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-10 hover:gap-4 transition-all group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Return to {activeCategory ? TRANSLATIONS.categories[activeCategory][lang] : 'library'}
                </button>

                <header className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                      {TRANSLATIONS.categories[activeArticle.category][lang]}
                    </span>
                    <ShareMenu article={activeArticle} />
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tighter mb-8 italic">
                    {activeArticle.title[lang]}
                  </h1>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-y border-black py-6 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <div className="flex items-center gap-3">
                      <User size={16} />
                      <span>By {activeArticle.editor}</span>
                      <span className="hidden md:inline">•</span>
                      <Clock size={16} />
                      <span>{activeArticle.date}</span>
                      <span className="hidden md:inline">•</span>
                      <Eye size={16} />
                      <span>{activeArticle.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setActiveCategory(activeArticle.category)}
                        className="flex items-center gap-2 hover:text-black transition-colors"
                      >
                        <Tag size={16} />
                        More from {TRANSLATIONS.categories[activeArticle.category][lang]}
                      </button>
                    </div>
                  </div>
                </header>

                <div className="mb-12 aspect-video overflow-hidden relative">
                  <img
                    src={activeArticle.image}
                    className="w-full h-full object-cover"
                    alt={activeArticle.title[lang]}
                    loading="eager"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(activeArticle)}
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      <Share2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      <Bookmark size={16} />
                    </Button>
                  </div>
                </div>

                {/* Article content remains the same */}
                <div className="space-y-12 prose prose-xl max-w-none text-black/80 font-serif leading-relaxed">
                  <p className="text-3xl italic leading-tight text-gray-500 font-light">"  <SafeHTMLRenderer html={activeArticle.situation[lang]} />"</p>
                 
                                   <div className="bg-[#f9f9f9] p-8 border-l-8 border-black font-serif italic text-2xl">
                                     {activeArticle.verse[lang]}
                                   </div>
                 
                                  <div className="space-y-6">
                   <SafeHTMLRenderer html={activeArticle.teaching[lang]} />
                 </div>
                                   {activeArticle.category === Category.HEALTH && (
                                     <div className="bg-green-50 p-10 space-y-8 font-sans">
                                       <h4 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3"><Apple className="text-green-600" /> Professional Health Counsel</h4>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                         <div>
                                           <h5 className="font-bold text-sm uppercase mb-4 text-green-800">Health Hacks</h5>
                                           <ul className="space-y-2 text-sm italic">
                                             {activeArticle.healthHacks?.map((h, i) => <li key={i}>• {h}</li>)}
                                           </ul>
                                         </div>
                                         <div>
                                           <h5 className="font-bold text-sm uppercase mb-4 text-green-800">Home Herbal Pharmacy</h5>
                                           <ul className="space-y-2 text-sm italic">
                                             {activeArticle.herbalRemedies?.map((h, i) => <li key={i}>• {h}</li>)}
                                           </ul>
                                         </div>
                                       </div>
                                     </div>
                                   )}
                 
                                   <div className="border-t-4 border-black pt-12">
                                     <h4 className="text-2xl font-black uppercase tracking-tighter mb-6">Daily Practical Step</h4>
                                     <p className="text-xl font-bold">  <SafeHTMLRenderer html={activeArticle.practice[lang]} /></p>
                                   </div>
                 
                                   <div className="text-center py-12 border-b-2 border-black">
                                     <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Closing Prayer</h4>
                                     <p className="text-4xl italic serif leading-tight">"  <SafeHTMLRenderer html={activeArticle.prayer[lang]} />"</p>
                                   </div>
                                 </div>
                 
                                 {/* Comments Section */}
                                 <section className="mt-20">
                                   <h3 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3"><MessageCircle /> Discourse</h3>
                                   <div className="space-y-8">
                                     {activeArticle.comments?.map(c => (
                                       <div key={c.id} className="border-b border-gray-100 pb-6">
                                         <div className="flex justify-between items-center mb-2">
                                           <span className="font-bold">{c.author}</span>
                                           <span className="text-[10px] text-gray-400 uppercase font-bold">{c.date}</span>
                                         </div>
                                         <p className="text-gray-600 leading-relaxed italic">"{c.text}"</p>
                                       </div>
                                     ))}
                                     <div className="bg-gray-50 p-8">
                                       <h5 className="text-xs font-bold uppercase mb-4">Add your thoughts</h5>
                                       <textarea className="w-full h-32 p-4 border border-gray-200 outline-none focus:border-black transition-all" placeholder="Respectful discourse only..."></textarea>
                                       <Button className="mt-4">Post Comment</Button>
                                     </div>
                                   </div>
                                 </section>
                 
                                 {/* Editor Bio */}
                                 <div className="mt-20 bg-[#f4f4f4] p-10 flex flex-col md:flex-row gap-8 items-center">
                                   <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                     <User className="w-full h-full p-6 text-white" />
                                   </div>
                                   <div>
                                     <h5 className="font-black uppercase tracking-widest text-xs mb-2">Editorial Desk: {activeArticle.editor}</h5>
                                     <p className="text-sm italic text-gray-500">{activeArticle.editorBio || "A seasoned writer dedicated to sharing Biblical truths with modern clarity."}</p>
                                   </div>
                                 </div>
                               </article>
                      
            ) : (
              <>
                {currentPage === 'home' && (
                  <div className="max-w-7xl mx-auto px-4 py-12">
                    {loading ? (
                      // Skeleton Loading State
                      <div className="space-y-12">
                        <div className="h-8 bg-gray-200 w-64 mb-8"></div>
                        <CategorySkeleton />
                        <ArticleCardSkeleton type="big" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {[...Array(4)].map((_, i) => (
                            <ArticleCardSkeleton key={i} type="small" />
                          ))}
                        </div>
                      </div>
                    ) : searchResults ? (
                      // Search Results State
                      <div className="mb-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                          <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                              Search Results for "{searchQuery}"
                            </h2>
                            <p className="text-gray-600">
                              Found {searchResults.length} article{searchResults.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <ShareMenu article={searchResults[0]} />
                            <button
                              onClick={handleClearSearch}
                              className="flex items-center gap-2 text-sm font-bold hover:text-red-600 transition-colors"
                            >
                              <ArrowLeft size={16} /> Back to all articles
                            </button>
                          </div>
                        </div>
                        
                        {searchResults.length === 0 ? (
                          <EmptyState
                            icon={<Search size={32} />}
                            title="No results found"
                            description={`We couldn't find any articles matching "${searchQuery}". Try searching with different keywords.`}
                            action={
                              <Button onClick={handleClearSearch} variant="outline">
                                Clear Search
                              </Button>
                            }
                          />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {searchResults.map(article => (
                              <EnhancedArticleCard
                                key={article.id}
                                article={article}
                                onClick={setActiveArticle}
                                variant="grid"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Main Home Content
                      <>
                        {/* Category Navigation */}
                        <CategoryNavigation
                          categories={Object.values(Category)}
                          activeCategory={activeCategory}
                          onCategorySelect={setActiveCategory}
                          articleCounts={articleCounts}
                        />

                        {filteredArticles.length === 0 ? (
                          <EmptyState
                            icon={<Newspaper size={32} />}
                            title="No articles found"
                            description={activeCategory 
                              ? `There are no articles in the ${TRANSLATIONS.categories[activeCategory][lang]} category yet.`
                              : "No articles have been published yet."
                            }
                            action={
                              activeCategory && (
                                <Button onClick={() => setActiveCategory(null)} variant="outline">
                                  View All Categories
                                </Button>
                              )
                            }
                          />
                        ) : (
                          <>
                            <div className="flex flex-col lg:flex-row gap-12">
                              {/* Featured / Big Column */}
                              <div className="lg:w-2/3">
                                {featuredArticle && (
                                  <EnhancedArticleCard
                                    article={featuredArticle}
                                    onClick={setActiveArticle}
                                    variant="big"
                                  />
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {listArticles.slice(0, 4).map(a => (
                                    <EnhancedArticleCard
                                      key={a.id}
                                      article={a}
                                      onClick={setActiveArticle}
                                      variant="small"
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Sidebar / List Column */}
                              <div className="lg:w-1/3 border-l-0 lg:border-l border-black/10 lg:pl-12">
                                <div className="mb-8">
                                  <h4 className="text-xs font-black uppercase tracking-[0.4em] text-gray-300 mb-4">
                                    Quick Categories
                                  </h4>
                                  <div className="space-y-2">
                                    {Object.values(Category).slice(0, 5).map(cat => (
                                      <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                      >
                                        <div className="flex items-center gap-3">
                                          {getCategoryIcon(cat)}
                                          <span className="text-sm font-bold">
                                            {TRANSLATIONS.categories[cat][lang]}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-400 group-hover:text-black">
                                          {articleCounts[cat] || 0}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-gray-300 mb-8">
                                  Daily Bread Feed
                                </h4>
                                {sidebarArticles.map(a => (
                                  <EnhancedArticleCard
                                    key={a.id}
                                    article={a}
                                    onClick={setActiveArticle}
                                    variant="small"
                                    showCategory={false}
                                  />
                                ))}

                                {/* Subscription Box */}
                                <div className="bg-black text-white p-8 mt-12">
                                  <h4 className="text-2xl font-bold mb-4 italic">Get Biblical Clarity</h4>
                                  <p className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">
                                    Weekly newsletter on faith & health
                                  </p>
                                  <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full bg-white/10 border border-white/20 p-3 mb-4 text-sm outline-none placeholder-gray-400"
                                  />
                                  <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => handleSubscribe('')}
                                  >
                                    Subscribe
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Trending Feed */}
                            {trendingArticles.length > 0 && (
                              <div className="mt-20 border-t-4 border-black pt-12">
                                <div className="flex items-center justify-between mb-12">
                                  <h3 className="text-3xl font-black uppercase tracking-tighter">
                                    Trending Discourse
                                  </h3>
                                  <Button variant="ghost" size="sm">
                                    View All <ChevronRight size={14} />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                  {trendingArticles.map(a => (
                                    <EnhancedArticleCard
                                      key={a.id}
                                      article={a}
                                      onClick={setActiveArticle}
                                      variant="grid"
                                      showCategory={false}
                                      showMetadata={false}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Other pages remain the same */}
                {currentPage === 'admin' && <AdminDashboard />}
                {currentPage === 'privacy' && (
                  <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-8">Privacy Policy</h1>
                    <div className="prose prose-lg font-serif">
                      <p>At My Life Today, your privacy is sacred. We only collect data necessary to enhance your editorial experience.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Footer remains the same */}
          <footer className="bg-[#1a1a1a] text-white pt-32 pb-12 px-4 mt-20">
          <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                <div className="md:col-span-2">
                  <h2 className="text-5xl font-black uppercase tracking-tighter mb-6">{TRANSLATIONS.siteName[lang]}</h2>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-md font-serif italic">
                    "Architecting spiritual and physical clarity for the modern human experience."
                  </p>
                  <div className="flex gap-4 mt-8">
                    <button className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><Globe size={20} /></button>
                    <button className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><BookOpen size={20} /></button>
                    <button className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><Shield size={20} /></button>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">Categories</h4>
                  {Object.values(Category).map(cat => (
                    <button key={cat} className="text-left text-sm font-bold uppercase hover:text-red-500">
                      {TRANSLATIONS.categories[cat][lang]}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">Network</h4>
                  <button onClick={() => navigateTo('terms')} className="text-left text-sm font-bold uppercase hover:text-red-500">Terms of service</button>
                  <button onClick={() => navigateTo('privacy')} className="text-left text-sm font-bold uppercase hover:text-red-500">Privacy policy</button>
                  <button onClick={() => navigateTo('admin')} className="text-left text-sm font-bold uppercase hover:text-red-500">Admin login</button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                <div className="flex flex-col gap-2">
                  <p>© 2024 My Life Today DIGITAL NETWORK. ALL RIGHTS RESERVED.</p>
                  <p className="flex items-center gap-2">DESIGNED BY <span className="text-white">TOPRAY</span> • ARCHITECTED BY AN EXPERT</p>
                </div>
                <div className="flex gap-8">
                  <a href="devtopray.netlify.app" className="flex items-center gap-2 hover:text-white transition-colors">PORTFOLIO <ExternalLink size={12} /></a>
                  <a href="devtopray.netlify.app" className="flex items-center gap-2 hover:text-white transition-colors">CONTACT EDITORIAL</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
}