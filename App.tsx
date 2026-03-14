import React, { useState, useEffect, createContext, useContext, useMemo, useCallback, useRef } from 'react';
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
import { TRANSLATIONS, LANGUAGES, DONATION, SOCIAL_LINKS, LEGAL } from './constants';
import { getArticles, getArticleById, getArticleBySlug, ensureUniqueSlugAndSave, searchArticles, addSubscription, getCategories, getArticlesByCategory, incrementArticleViews, addComment, getCommentsByArticle } from './services/firebaseService';
import SEOHead from './components/SEOHead';

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
  lang: 'rw',
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

  // copy shareable search URL (used by the search bar share button)
  const handleShareSearch = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy search link', err);
    }
  };

  // submit immediate search on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      debouncedSearch.cancel();
      if (searchTerm.trim()) onSearch(searchTerm.trim());
    } else if (e.key === 'Escape') {
      handleClear();
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
          onKeyDown={handleKeyDown}
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

  // always use the shareable URL for the specific article
  const articleUrl = `${window.location.origin}/articles/${article.slug || article.id}`;

  const shareOptions = [
    {
      name: 'Copy link',
      icon: <Copy size={16} />,
      action: async () => {
        await navigator.clipboard.writeText(articleUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'Facebook',
      icon: <Share2 size={16} />,
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Twitter',
      icon: <Share2 size={16} />,
      action: () => {
        const text = encodeURIComponent(`"${article.title[lang]}" - ${TRANSLATIONS.siteName[lang]}`);
        const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={16} />,
      action: () => {
        const text = `${article.title[lang]} - ${TRANSLATIONS.siteName[lang]}\n\n${articleUrl}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Email',
      icon: <Send size={16} />,
      action: () => {
        const subject = encodeURIComponent(article.title[lang]);
        const body = encodeURIComponent(`Check out this article: ${articleUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    }
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(true)}
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

      {showMenu && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-64 max-w-full p-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-3">{TRANSLATIONS.ui.share[lang]}</h3>
            {shareOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
              >
                {option.icon}
                {option.name}
              </button>
            ))}
            {article.whatsappGroup && (
              <div className="border-t mt-2 pt-2">
                <a
                  href={article.whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  <MessageCircle size={16} />
                  {TRANSLATIONS.ui.joinWhatsApp[lang]}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
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

// helper used throughout the app for human-readable dates
const formatDate = (article: Article) => {
  const raw = (article.createdAt || article.publishDate || article.date) as any;
  if (!raw) return '';
  try {
    if (raw.seconds) {
      return new Date(raw.seconds * 1000).toLocaleDateString();
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString();
  } catch {
    return String(raw);
  }
};

// --- Enhanced Article Card ---
const EnhancedArticleCard: React.FC<{
  article: Article;
  onClick: (a: Article) => void;
  variant?: 'big' | 'small' | 'grid';
  showCategory?: boolean;
  showMetadata?: boolean;
  bookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onLoadMore?: () => void; // added prop for overlay load-more on big card
}> = ({ article, onClick, variant = 'grid', showCategory = true, showMetadata = true, bookmarked = false, onToggleBookmark, onLoadMore }) => {
  const { lang } = useContext(LanguageContext);
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) onToggleBookmark(article.id);
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
              <span>{formatDate(article)}</span>
              <span>•</span>
              <span>{article.views || 0} views</span>
            </div>
            <ShareMenu article={article} />
          </div>
        )}
      </div>
    );
  }
  // ...existing code...

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
  const [lang, setLang] = useState<Language>('rw');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  // safer persisted itemsToShow initializer (handles invalid stored values)
  const [itemsToShow, setItemsToShow] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('itemsToShow');
      if (!raw) return 4;
      const n = parseInt(raw, 10);
      return Number.isFinite(n) && n > 0 ? Math.max(4, n) : 4;
    } catch {
      return 4;
    }
  });

  // persist itemsToShow so returning users keep the expanded view
  useEffect(() => {
    try {
      if (Number.isFinite(itemsToShow) && itemsToShow > 0) {
        localStorage.setItem('itemsToShow', String(itemsToShow));
      }
    } catch (err) {
      /* ignore */
    }
  }, [itemsToShow]);

  const moreRef = useRef<HTMLDivElement | null>(null);
  const prevItemsRef = useRef<number>(0);
  const [animateNew, setAnimateNew] = useState<boolean>(false);
  const [newlyAddedCount, setNewlyAddedCount] = useState<number>(0);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('bookmarks');
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  });
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
  const LOAD_STEP = 4;
  const loadMore = () => {
    // remember previous shown count so we can animate the newly appended items
    prevItemsRef.current = itemsToShow;

    // listArticles is filteredArticles.slice(1) — compute remaining from that
    const totalList = Math.max(0, filteredArticles.length - 1);
    const remaining = Math.max(0, totalList - itemsToShow);
    const add = Math.min(LOAD_STEP, remaining || LOAD_STEP);
    if (add <= 0) return;

    setItemsToShow(prev => prev + add);
    setNewlyAddedCount(add);
    setAnimateNew(true);

    // smooth scroll to the *first new item* after DOM updates
    setTimeout(() => {
      const container = document.querySelector('[data-article-list]');
      if (container) {
        const idx = prevItemsRef.current;
        const child = container.children[idx] as HTMLElement | null;
        if (child) {
          child.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      // fallback to existing anchor if everything else fails
      const el = moreRef.current || document.getElementById('more-articles');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };
  // persist itemsToShow so returning users keep the expanded view
  useEffect(() => {
    try {
      localStorage.setItem('itemsToShow', String(itemsToShow));
    } catch (err) {
      /* ignore */
    }
  }, [itemsToShow]);

  // clear animation state after animation completes
  useEffect(() => {
    if (!animateNew) return;
    const id = setTimeout(() => {
      setAnimateNew(false);
      setNewlyAddedCount(0);
      prevItemsRef.current = 0;
    }, 700);
    return () => clearTimeout(id);
  }, [animateNew]);
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


    const pathMatch = window.location.pathname.match(/^\/articles\/([^\/]+)/);
    if (pathMatch) {
      const slug = decodeURIComponent(pathMatch[1]);
      (async () => {
        try {
          // Try find in-memory first, fallback to server fetch by slug
          let a = articles.find(x => x.slug === slug);
          if (!a) a = await getArticleBySlug(slug);
          if (a) openArticle(a);
        } catch (err) {
          console.error('Failed to open article from route', err);
        }
      })();
    }
  }, [articles]);

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

  // fast local-first search (instant suggestions) + server fallback
  const handleSearch = async (searchTerm: string) => {
    const term = (searchTerm || '').trim();
    setSearchQuery(term);
    if (!term) {
      setSearchResults(null);
      setShowSearch(false);
      return;
    }

    // Local fast filter (no network)
    const lower = term.toLowerCase();
    const localMatches = articles.filter(a => {
      const text = `${a.title?.[lang] || ''} ${(a.situation?.[lang] || '')}`.toLowerCase();
      return text.includes(lower);
    });

    if (localMatches.length > 0) {
      setSearchResults(localMatches);
      setShowSearch(true);
      // update URL
      const params = new URLSearchParams(window.location.search);
      params.set('search', term);
      window.history.pushState({}, '', `?${params.toString()}`);
      return;
    }

    // Fallback to server search only when local yields nothing
    try {
      setSearchLoading(true);
      const results = await searchArticles(term);
      setSearchResults(results);
      setShowSearch(true);
      const params = new URLSearchParams(window.location.search);
      params.set('search', term);
      window.history.pushState({}, '', `?${params.toString()}`);
    } catch (err) {
      console.error('Search error:', err);
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

  // Share an article (native share when available, otherwise copy link)
  const handleShare = async (article: Article | null) => {
    if (!article) return;
    const url = `${window.location.origin}${window.location.pathname}?article=${article.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title?.[lang] || TRANSLATIONS.siteName[lang],
          text: (article.situation?.[lang] || '').replace(/<[^>]+>/g, ''),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        // eslint-disable-next-line no-alert
        alert('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (email: string, name?: string) => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      await addSubscription(email, name);
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      alert("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
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
  // Deduplicate filteredArticles by id to avoid rendering duplicates across sections
  const uniqueArticles = useMemo(() => {
    const seen = new Set<string>();
    return filteredArticles.filter(a => {
      if (!a?.id) return false;
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [filteredArticles]);
  const featuredArticle = filteredArticles[0] || null;
  const listArticles = filteredArticles.slice(1);
  const sidebarArticles = filteredArticles.slice(1, 5);

  // build a separate list of trending items based purely on view counts rather than
  // the currently filtered set.  This gives us a “most‑viewed” feed on every page.
  const trendingArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4);
  }, [articles]);
  const t = useCallback((key: string): string => {
    return TRANSLATIONS[key]?.[lang] || key;
  }, [lang]);
  // ...existing code...

  useEffect(() => {
    const getMeta = (selector: string) => document.querySelector(selector) as HTMLMetaElement | null;
    const defaults = {
      title: document.title,
      description: getMeta('meta[name="description"]')?.content || '',
      ogTitle: getMeta('meta[property="og:title"]')?.content || '',
      ogDesc: getMeta('meta[property="og:description"]')?.content || '',
      ogImage: getMeta('meta[property="og:image"]')?.content || '',
      ogUrl: getMeta('meta[property="og:url"]')?.content || document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.href,
      twitterImage: getMeta('meta[name="twitter:image"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.href,
    };
    const createOrSetMeta = (selector: string, attr: 'content' | 'href', value: string) => {
      if (!value) return;
      const isLink = selector.startsWith('link');
      const existing = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (existing) {
        if (isLink) (existing as HTMLLinkElement).setAttribute('href', value);
        else (existing as HTMLMetaElement).setAttribute(attr, value);
        return;
      }
      if (isLink) {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        l.setAttribute('href', value);
        document.head.appendChild(l);
        return;
      }
      const m = document.createElement('meta');
      const prop = selector.includes('property') ? 'property' : 'name';
      const match = selector.match(/"(.*?)"/) || selector.match(/=(?:'|")?([^'"\]]+)(?:'|")?/);
      const key = match ? match[1] || match[0] : selector;
      m.setAttribute(prop, key);
      m.setAttribute('content', value);
      document.head.appendChild(m);
    };
    const applyMeta = (article: Article | null) => {
      // remove previous injected JSON-LD if any
      const existingSchema = document.getElementById('article-schema');
      if (existingSchema) existingSchema.remove();

      if (!article) {
        // restore defaults
        document.title = defaults.title;
        createOrSetMeta('meta[name="description"]', 'content', defaults.description);
        createOrSetMeta('meta[property="og:title"]', 'content', defaults.ogTitle);
        createOrSetMeta('meta[property="og:description"]', 'content', defaults.ogDesc);
        createOrSetMeta('meta[property="og:image"]', 'content', defaults.ogImage);
        createOrSetMeta('meta[property="og:url"]', 'content', defaults.ogUrl || defaults.canonical);
        createOrSetMeta('meta[name="twitter:image"]', 'content', defaults.twitterImage);
        createOrSetMeta('link[rel="canonical"]', 'href', defaults.canonical);
        return;
      }

      // Title and description
      const title = `${article.title?.[lang] || TRANSLATIONS.siteName[lang]} • ${TRANSLATIONS.siteName[lang]}`;
      const desc = (article.metaDescription || article.situation?.[lang] || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .slice(0, 160)
        .trim();

      // PROTECTION: Only allow HTTP URLs for social images
      const buildImageUrl = (src?: string | null) => {
        if (!src) return null;

        // 1. BLOCK BASE64 FOR META TAGS
        // Social crawlers ignore Base64 because it's too large for their headers
        if (src.startsWith('data:image')) {
          console.warn("Base64 images cannot be used for OpenGraph/Twitter tags.");
          return `${window.location.origin}/og.png`; // Fallback to your public logo
        }

        try {
          // 2. HANDLE CLOUDINARY TRANSFORMS
          if (src.includes('res.cloudinary.com')) {
            const parts = src.split('/upload/');
            if (parts.length === 2 && !parts[1].startsWith('f_auto')) {
              // Inject SEO optimized dimensions (1200x630 is best for Facebook/Twitter)
              return `${parts[0]}/upload/f_auto,q_auto,c_fill,w_1200,h_630/${parts[1]}`;
            }
            return src;
          }

          // 3. HANDLE ABSOLUTE VS RELATIVE
          const maybeUrl = new URL(src, window.location.origin);
          return maybeUrl.href.replace(/^http:/, 'https:'); // Force HTTPS

        } catch (e) {
          // 4. FALLBACK TO CLOUDINARY VIA ENV
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          if (cloudName && !src.startsWith('http')) {
            return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1200/${src}`;
          }
          return null;
        }
      };

      const image = buildImageUrl(article.featuredImage) || buildImageUrl(article.image) || defaults.ogImage || `${window.location.origin}/og.png`;

      const articleUrl = `${window.location.origin}/articles/${article.slug || article.id}`;

      document.title = title;
      createOrSetMeta('meta[name="description"]', 'content', desc);
      createOrSetMeta('meta[property="og:title"]', 'content', title);
      createOrSetMeta('meta[property="og:description"]', 'content', desc);
      createOrSetMeta('meta[property="og:image"]', 'content', image);
      createOrSetMeta('meta[property="og:url"]', 'content', articleUrl);
      // also set secure_url and recommended dimensions (if known)
      createOrSetMeta('meta[property="og:image:secure_url"]', 'content', image);
      // optional: set type and fallback
      createOrSetMeta('meta[property="og:image:type"]', 'content', 'image/jpeg');
      createOrSetMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
      createOrSetMeta('meta[name="twitter:image"]', 'content', image);
      createOrSetMeta('link[rel="canonical"]', 'href', articleUrl);
      // --- JSON-LD Structured Data ---
      // --- JSON-LD Structured Data ---

      // Safe ISO date helper — handles Firestore Timestamp, toDate(), numeric epoch, and string
      const toISO = (raw: any): string | null => {
        if (!raw) return null;
        try {
          if (typeof raw === 'number') {
            const ms = raw < 1e12 ? raw * 1000 : raw;
            const d = new Date(ms);
            return isNaN(d.getTime()) ? null : d.toISOString();
          }
          if (raw?.seconds && typeof raw.seconds === 'number') {
            const d = new Date(raw.seconds * 1000);
            return isNaN(d.getTime()) ? null : d.toISOString();
          }
          if (typeof raw?.toDate === 'function') {
            const d = raw.toDate();
            return d instanceof Date && !isNaN(d.getTime()) ? d.toISOString() : null;
          }
          const d = new Date(raw);
          return isNaN(d.getTime()) ? null : d.toISOString();
        } catch {
          return null;
        }
      };

      // JSON-LD structured data
      const datePublishedISO = toISO(article.createdAt) || toISO(article.publishDate) || new Date().toISOString();
      const dateModifiedISO = toISO(article.updatedAt) || datePublishedISO;

      const schemaData: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title?.[lang] || "",
        "image": [image],
        "datePublished": datePublishedISO,
        "dateModified": dateModifiedISO,
        "author": [{
          "@type": "Organization",
          "name": TRANSLATIONS.siteName[lang],
          "url": window.location.origin
        }],
        "publisher": {
          "@type": "Organization",
          "name": TRANSLATIONS.siteName[lang],
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/logo.png`
          }
        },
        "description": desc,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": articleUrl
        }
      };

      const script = document.createElement('script');
      script.id = 'article-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    };

    applyMeta(activeArticle);
  }, [activeArticle, lang]);
  const LegalArticle: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const paragraphs = content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    return (
      <article className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold leading-tight mb-2">{title}</h1>
            <p className="text-sm text-gray-500">Last updated: <time>{new Date().toLocaleDateString()}</time></p>
          </header>

          <div className="prose prose-lg max-w-none text-gray-800">
            {paragraphs.map((para, idx) => {
              if (/^\d+\./m.test(para)) {
                const items = para.split(/\n/).map(s => s.replace(/^\s*\d+\.\s*/, '').trim()).filter(Boolean);
                return (
                  <ol key={idx} className="list-decimal ml-6 mb-4">
                    {items.map((it, i) => <li key={i}>{it}</li>)}
                  </ol>
                );
              }
              const lines = para.split(/\n/).map((l, i) => <span key={i}>{l}{i < para.split(/\n/).length - 1 && <br />}</span>);
              return <p key={idx}>{lines}</p>;
            })}
          </div>
        </div>
      </article>
    );
  };
  // ...existing code...
  // Open article helper — increments views and loads latest article + comments
  const openArticle = useCallback(async (article: Article) => {
    try {
      // Optimistically set active article so UI responds quickly
      setActiveArticle(article);

      // If article doesn't have a slug, generate + persist one and update local state
      if (article?.id && !article.slug) {
        try {
          const newSlug = await ensureUniqueSlugAndSave(article.id, article.title?.[lang] || article.title || article.id);
          // reflect new slug in current activeArticle and articles list
          setActiveArticle(prev => prev ? { ...prev, slug: newSlug } : prev);
          setArticles(prev => prev.map(a => a.id === article.id ? { ...a, slug: newSlug } : a));
          setFilteredArticles(prev => prev.map(a => a.id === article.id ? { ...a, slug: newSlug } : a));
        } catch (err) {
          console.error('Failed to ensure or save slug:', err);
        }
      }
      if (article?.id) {
        // Only increment views once per device (localStorage) to avoid duplicate views
        try {
          const raw = localStorage.getItem('viewedArticles');
          const viewed = raw ? JSON.parse(raw) : [];
          if (!viewed.includes(article.id)) {
            await incrementArticleViews(article.id);
            viewed.push(article.id);
            localStorage.setItem('viewedArticles', JSON.stringify(viewed));
          }
        } catch (err) {
          console.error('Failed to increment views or access storage:', err);
        }


        // Update URL so share links work and direct links open
        try {
          const slug = (article.slug) || articles.find(a => a.id === article.id)?.slug || article.id;
          const url = `/articles/${encodeURIComponent(slug)}`;
          window.history.pushState({}, '', url);
        } catch (err) {
          // non-fatal
        }

        // Refresh article from DB to get latest counts/fields
        try {
          const fresh = await getArticleById(article.id);
          if (fresh) setActiveArticle(fresh as Article);
        } catch (err) {
          console.error('Failed to fetch article after opening:', err);
        }

        // Load comments for this article
        try {
          setCommentsLoading(true);
          const fetched = await getCommentsByArticle(article.id);
          setComments(fetched as Comment[]);
        } catch (err) {
          console.error('Failed loading comments:', err);
        } finally {
          setCommentsLoading(false);
        }
      }
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('openArticle error:', err);
    }
  }, [articles, lang]);


  // Persist bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    } catch (err) {
      console.error('Failed to persist bookmarks', err);
    }
  }, [bookmarks]);

  const toggleBookmark = (articleId: string) => {
    setBookmarks(prev => {
      if (prev.includes(articleId)) return prev.filter(id => id !== articleId);
      return [...prev, articleId];
    });
  };

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
                  {`Return to ${activeCategory ? TRANSLATIONS.categories[activeCategory][lang] : TRANSLATIONS.ui.library[lang]}`}
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
                      <span> {activeArticle.editor}</span>
                      <span className="hidden md:inline">•</span>
                      <Clock size={16} />
                      <span>{formatDate(activeArticle)}</span>
                      <span className="hidden md:inline">•</span>
                      <Eye size={16} />
                      <span>{activeArticle.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => { navigateTo('home', activeArticle.category); setActiveArticle(null); }}
                        className="flex items-center gap-2 hover:text-black transition-colors"
                      >
                        <Tag size={16} />
                        {`${TRANSLATIONS.ui.moreFrom[lang]} ${TRANSLATIONS.categories[activeArticle.category][lang]}`}
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
                    {activeArticle?.whatsappGroup && (
                      <a href={activeArticle.whatsappGroup} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="bg-white/90 backdrop-blur-sm">
                          <MessageCircle size={16} />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm"
                      onClick={() => activeArticle && toggleBookmark(activeArticle.id)}
                    >
                      {activeArticle && bookmarks.includes(activeArticle.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </Button>
                  </div>
                </div>

                {/* Join WhatsApp CTA (article-specific or fallback) */}
                {(activeArticle?.whatsappGroup || SOCIAL_LINKS.whatsapp) && (
                  <div className="text-center my-6">
                    <a
                      href={activeArticle?.whatsappGroup || SOCIAL_LINKS.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="primary" size="md">{TRANSLATIONS.ui.joinWhatsApp[lang]}</Button>
                    </a>
                  </div>
                )}

                {/* Article content remains the same */}
                <div className="space-y-12 max-w-none text-black/80 font-sans leading-relaxed">
                  <p className="text-2xl font-medium leading-tight text-gray-700">"<SafeHTMLRenderer html={activeArticle.situation[lang]} />"</p>


                  <div className="space-y-6">
                    <SafeHTMLRenderer html={activeArticle.teaching[lang]} />
                  </div>
                  {/* Health content: same color scheme, different clean layout (no green bg) */}
                  {activeArticle.category === Category.HEALTH && (
                    <div className="p-6 space-y-6 border border-gray-100 rounded-md">
                      <h4 className="text-2xl font-bold uppercase tracking-tight">Health Insights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold mb-3">Health Hacks</h5>
                          <ul className="list-disc list-inside space-y-2 text-sm">
                            {activeArticle.healthHacks?.map((h, i) => <li key={i}>{h}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-3">Herbal Remedies</h5>
                          <ul className="list-disc list-inside space-y-2 text-sm">
                            {activeArticle.herbalRemedies?.map((h, i) => <li key={i}>{h}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="border-t-4 border-black pt-12">
                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-6">{TRANSLATIONS.ui.dailyPracticalStep[lang]}</h4>
                    <p className="text-xl font-medium"><SafeHTMLRenderer html={activeArticle.practice[lang]} /></p>
                  </div>

                  <div className="text-center py-12 border-b-2 border-black">
                    <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">{TRANSLATIONS.ui.closingPrayer[lang]}</h4>
                    <p className="text-2xl leading-tight">"<SafeHTMLRenderer html={activeArticle.prayer[lang]} />"</p>
                  </div>
                </div>

                {/* Comments Section */}
                <section className="mt-20">
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3"><MessageCircle /> {TRANSLATIONS.ui.comments[lang]}</h3>
                  <div className="space-y-8">
                    {commentsLoading ? (
                      <div>{TRANSLATIONS.ui.loadingComments[lang]}</div>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="border-b border-gray-100 pb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">{c.author || 'Guest'}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">{c.date ? new Date(c.createdAt?.seconds ? c.createdAt.seconds * 1000 : c.date).toLocaleString() : ''}</span>
                          </div>
                          <p className="text-gray-600 leading-relaxed italic">"{c.text}"</p>
                        </div>
                      ))
                    )}

                    <div className="bg-gray-50 p-8">
                      <h5 className="text-xs font-bold uppercase mb-4">{TRANSLATIONS.ui.addYourThoughts[lang]}</h5>
                      <input value={newCommentAuthor} onChange={(e) => setNewCommentAuthor(e.target.value)} placeholder={TRANSLATIONS.ui.nameOptionalPlaceholder[lang]} className="w-full p-3 mb-3 border border-gray-200" />
                      <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} className="w-full h-32 p-4 border border-gray-200 outline-none focus:border-black transition-all" placeholder={TRANSLATIONS.ui.respectfulDiscoursePlaceholder[lang]}></textarea>
                      <Button className="mt-4" onClick={async () => {
                        if (!newCommentText.trim() || !activeArticle) return;
                        try {
                          setCommentsLoading(true);
                          await addComment(activeArticle.id, {
                            author: newCommentAuthor?.trim() || 'Guest',
                            text: newCommentText.trim(),
                            date: new Date().toISOString()
                          });
                          const refreshed = await getCommentsByArticle(activeArticle.id);
                          setComments(refreshed as Comment[]);
                          setNewCommentText('');
                          setNewCommentAuthor('');
                        } catch (err) {
                          console.error('Failed to post comment', err);
                        } finally {
                          setCommentsLoading(false);
                        }
                      }}>{TRANSLATIONS.ui.postComment[lang]}</Button>
                    </div>
                  </div>
                </section>

                {/* Editor Bio */}
                <div className="mt-20 bg-[#f4f4f4] p-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    <User className="w-full h-full p-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-black uppercase tracking-widest text-xs mb-2">{TRANSLATIONS.ui.editorialDesk[lang]}: {activeArticle.editor}</h5>
                    <p className="text-sm italic text-gray-500">{activeArticle.editorBio || TRANSLATIONS.ui.editorBioFallback?.[lang] || "A seasoned writer dedicated to sharing Biblical truths with modern clarity."}</p>
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
                                onClick={openArticle}
                                variant="grid"
                                bookmarked={bookmarks.includes(article.id)}
                                onToggleBookmark={() => toggleBookmark(article.id)}
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
                              {/* Featured / Big Column (scrollable container for featured + undercards) */}
                              {/* Featured / Big Column */}
                              <div className="lg:w-2/3">
                                {/* NOTE: remove inner scroll — let the whole page scroll normally.
      Featured and subsequent cards flow with page scrolling. */}
                                {/* Featured */}
                                {featuredArticle && (
                                  <div className="relative mb-8">
                                    <EnhancedArticleCard
                                      article={featuredArticle}
                                      onClick={openArticle}
                                      variant="big"
                                      bookmarked={bookmarks.includes(featuredArticle.id)}
                                      onToggleBookmark={() => toggleBookmark(featuredArticle.id)}
                                      onLoadMore={loadMore}
                                    />
                                  </div>
                                )}

                                {/* Unified list: show first `itemsToShow` articles from listArticles.
      Earlier items remain visible when loading more. */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-article-list>
                                  {listArticles.slice(0, itemsToShow).map((a, index) => {
                                    const prevStart = prevItemsRef.current || 0;
                                    const isNew = index >= prevStart && index < (prevStart + newlyAddedCount);
                                    const animClass = isNew
                                      ? (animateNew ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')
                                      : 'opacity-100 translate-y-0';

                                    return (
                                      <div
                                        key={a.id}
                                        className={`transform transition-all duration-600 ${animClass}`}
                                      >
                                        <EnhancedArticleCard
                                          article={a}
                                          onClick={openArticle}
                                          variant="small"
                                          bookmarked={bookmarks.includes(a.id)}
                                          onToggleBookmark={() => toggleBookmark(a.id)}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Footer Controls */}
                                <div className="mt-8 flex justify-center" ref={moreRef} id="more-articles">
                                  {listArticles.length > itemsToShow ? (
                                    <div className="flex gap-4">
                                      <Button variant="primary" onClick={loadMore}>
                                        Load more
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        onClick={() => {
                                          const leftCol = moreRef.current?.closest('[style]') as HTMLElement | null;
                                          if (leftCol) leftCol.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                      >
                                        Scroll to top
                                      </Button>
                                    </div>
                                  ) : listArticles.length > 0 ? (
                                    <div className="flex flex-col items-center gap-4 pb-10">
                                      <span className="text-gray-500 text-sm">All articles loaded</span>
                                      {itemsToShow > 4 && (
                                        <Button
                                          variant="secondary"
                                          onClick={() => {
                                            setItemsToShow(4);
                                            const leftCol = moreRef.current?.closest('[style]') as HTMLElement | null;
                                            if (leftCol) {
                                              setTimeout(() => leftCol.scrollTo({ top: 0, behavior: 'smooth' }), 80);
                                            }
                                          }}
                                        >
                                          Show less
                                        </Button>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              </div>


                              {/* Sidebar / List Column (sticky aside) */}
                              <div className="lg:w-1/3 lg:pl-12 border-l-0 lg:border-l border-black/10">
                                <div className="sticky top-24 space-y-12">
                                  {/* Categories */}
                                  <div>
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

                                  {/* Sidebar Feed */}
                                  <div>
                                    <h4 className="text-xs font-black uppercase tracking-[0.4em] text-gray-300 mb-6">
                                      Daily Bread Feed
                                    </h4>
                                    <div className="space-y-6">
                                      {sidebarArticles.map(a => (
                                        <EnhancedArticleCard
                                          key={a.id}
                                          article={a}
                                          onClick={openArticle}
                                          variant="small"
                                          showCategory={false}
                                          bookmarked={bookmarks.includes(a.id)}
                                          onToggleBookmark={() => toggleBookmark(a.id)}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  {/* Subscription Box */}
                                  <div className="bg-black text-white p-6 rounded shadow-xl">
                                    <h4 className="text-xl font-bold mb-2 italic">Get Biblical Clarity</h4>
                                    <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60">
                                      Weekly newsletter on faith & health
                                    </p>
                                    <input
                                      type="email"
                                      placeholder="Your Email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      className="w-full bg-white/10 border border-white/20 p-3 mb-3 text-sm outline-none placeholder-gray-400 focus:border-white/50 transition-colors"
                                    />
                                    <Button
                                      variant="secondary"
                                      className="w-full"
                                      onClick={() => handleSubscribe(email)}
                                    >
                                      {TRANSLATIONS.ui.subscribe[lang]}
                                    </Button>
                                    <Button
                                      variant="primary"
                                      className="w-full mt-3 border border-white/20"
                                      onClick={() => navigateTo('donate')}
                                    >
                                      {TRANSLATIONS.ui.donate[lang]}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Trending Feed */}
                            {trendingArticles.length > 0 && (
                              <div className="mt-20 border-t-4 border-black pt-12">
                                <div className="flex items-center justify-between mb-12">
                                  <h3 className="text-3xl font-black uppercase tracking-tighter">
                                    Most Viewed Articles
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
                                      onClick={openArticle}
                                      variant="grid"
                                      showCategory={false}
                                      showMetadata={false}
                                      bookmarked={bookmarks.includes(a.id)}
                                      onToggleBookmark={() => toggleBookmark(a.id)}
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

                {currentPage === 'donate' && (
                  <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in">
                    <h2 className="text-3xl font-black mb-6">
                      {TRANSLATIONS.ui.donationHeader[lang].replace('{site}', TRANSLATIONS.siteName[lang])}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {TRANSLATIONS.ui.donationDescription[lang]}
                    </p>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold">{TRANSLATIONS.ui.mobileMoneyLabel[lang]}</h4>
                        <p className="text-lg font-semibold">{DONATION.momoNumber} — {DONATION.momoName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{TRANSLATIONS.ui.bankTransferLabel[lang]}</h4>
                        <p className="text-lg font-semibold">{DONATION.bankName} — {DONATION.bankAccount}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {TRANSLATIONS.ui.donationPurposeLabel[lang]}: {DONATION.purpose}
                      </p>
                      <div className="flex gap-3 mt-4">
                        <Button variant="primary" onClick={() => { navigator.clipboard.writeText(DONATION.momoNumber); alert(TRANSLATIONS.ui.copyMoMo[lang]); }}>
                          {TRANSLATIONS.ui.copyMoMo[lang]}
                        </Button>
                        <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(DONATION.bankAccount); alert(TRANSLATIONS.ui.copyBank[lang]); }}>
                          {TRANSLATIONS.ui.copyBank[lang]}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 'privacy' && (
                  <LegalArticle title={TRANSLATIONS.ui.privacyTitle[lang]} content={LEGAL.privacy[lang]} />
                )}

                {currentPage === 'terms' && (
                  <LegalArticle title={TRANSLATIONS.ui.termsTitle[lang]} content={LEGAL.terms[lang]} />
                )}
              </>
            )}
          </main>

          {/* Footer remains the same */}
          <footer className="bg-[#1a1a1a] text-white pt-32 pb-12 px-4 mt-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                <div className="md:col-span-2">
                  <h2 className="text-5xl font-black uppercase tracking-tighter mb-6">{t('siteName')}</h2>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-md font-serif italic">
                    {t('tagline')}
                  </p>
                  <div className="flex gap-4 mt-8">
                    <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><Globe size={20} /></a>
                    <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><BookOpen size={20} /></a>
                    <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><Shield size={20} /></a>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">{t('home')}</h4>
                  {Object.values(Category).map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); navigateTo('home', cat); }}
                      className="text-left text-sm font-bold uppercase hover:text-red-500"
                    >
                      {TRANSLATIONS.categories[cat][lang]}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">Network</h4>
                  <button onClick={() => navigateTo('terms')} className="text-left text-sm font-bold uppercase hover:text-red-500">{TRANSLATIONS.ui.termsTitle[lang]}</button>
                  <button onClick={() => navigateTo('privacy')} className="text-left text-sm font-bold uppercase hover:text-red-500">{TRANSLATIONS.ui.privacyTitle[lang]}</button>
                  <button onClick={() => navigateTo('donate')} className="text-left text-sm font-bold uppercase hover:text-red-500">{TRANSLATIONS.ui.donate[lang]}</button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                <div className="flex flex-col gap-2 text-left">
                  <p>© {new Date().getFullYear()} {t('siteName')} DIGITAL NETWORK. ALL RIGHTS RESERVED.</p>
                  <p className="flex items-center gap-2">DESIGNED BY <span className="text-white">TOPRAY</span> • ARCHITECTED BY AN EXPERT</p>
                </div>
                <div className="flex gap-8">
                  <a href="https://devtopray.netlify.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    {t('portfolio')} <ExternalLink size={12} />
                  </a>
                  <a href="mailto:contact@theWithGodDaily.org" className="flex items-center gap-2 hover:text-white transition-colors">
                    {t('contactEditorial')}
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
}