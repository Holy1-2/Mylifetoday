import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import {
  Menu, X, Search, Heart, Briefcase, Download, Upload,
  Smartphone, Users, Globe, BookOpen, Sun, Filter, Calendar,
  Send, Share2, ChevronRight, ArrowLeft, Clock, Bookmark, BookmarkCheck,
  ChevronLeft, LayoutGrid, Newspaper, User, Hash, ExternalLink, Eye,
  MessageCircle, Shield, FileText, Info, Activity, Leaf, Pill, Apple, Settings,
  TrendingUp, Home, DollarSign, Heart as HeartIcon, Brain, Cpu, Users as UsersIcon, Sparkles,
  LogIn, LogOut, Plus, Edit, Trash2, BarChart, Wallet, HandHeart,
  Tag, Copy, Check, Loader2, Send as SendIcon, Mail
} from 'lucide-react';
import { Article, Category, Language, Comment, DonationStats } from './types';
import { TRANSLATIONS, LANGUAGES, DONATION, SOCIAL_LINKS, LEGAL, INITIAL_DONATION_STATS } from './constants';
import { getArticles, getArticleById, searchArticles, addSubscription, getCategories, getArticlesByCategory, incrementArticleViews, addComment, getCommentsByArticle } from './services/firebaseService';
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
      return <HeartIcon />;
    case 'health':
      return <Activity />;
    case 'relationships':
      return <Heart />;
    case 'daily_life':
      return <Home />;
    case 'hope':
      return <Sparkles />;
    case 'money_work':
      return <DollarSign />;
    case 'society':
      return <UsersIcon />;
    default:
      return <FileText />;
  }
};

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

// --- Modern News Grid Components ---
const ArticleGridCard: React.FC<{
  article: Article;
  onClick: (a: Article) => void;
  bookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  layout?: 'standard' | 'featured' | 'compact';
}> = ({ article, onClick, bookmarked = false, onToggleBookmark, layout = 'standard' }) => {
  const { lang } = useContext(LanguageContext);

  if (layout === 'compact') {
    return (
      <div className="group cursor-pointer" onClick={() => onClick(article)}>
        <div className="aspect-[4/3] overflow-hidden mb-3 relative rounded-lg">
          <img
            src={article.image}
            alt={article.title[lang]}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark?.(article.id);
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
            {TRANSLATIONS.categories[article.category][lang]}
          </span>
          <h5 className="font-bold leading-tight line-clamp-2 group-hover:underline">{article.title[lang]}</h5>
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>{article.date}</span>
            <span className="flex items-center gap-1">
              <Eye size={10} /> {article.views || 0}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300" onClick={() => onClick(article)}>
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={article.image}
          alt={article.title[lang]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark?.(article.id);
          }}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">
            {TRANSLATIONS.categories[article.category][lang]}
          </span>
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
            {article.title[lang]}
          </h3>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          <SafeHTMLRenderer html={article.situation[lang]} />
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="font-medium">{article.editor}</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={12} />
            <span>{article.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Share Modal Component ---
const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}> = ({ isOpen, onClose, article }) => {
  const { lang } = useContext(LanguageContext);
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: <Copy size={20} />,
      action: async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'Facebook',
      icon: <Share2 size={20} />,
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Twitter',
      icon: <Share2 size={20} />,
      action: () => {
        const text = encodeURIComponent(`"${article?.title[lang]}" - ${TRANSLATIONS.siteName[lang]}`);
        const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      action: () => {
        const text = `${article?.title[lang]} - ${TRANSLATIONS.siteName[lang]}\n\n${window.location.href}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Email',
      icon: <Mail size={20} />,
      action: () => {
        const subject = encodeURIComponent(article?.title[lang] || '');
        const body = encodeURIComponent(`Check out this article: ${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Share Article</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {shareOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  {option.icon}
                </div>
                <span className="text-sm font-medium">{option.name}</span>
              </button>
            ))}
          </div>

          {copied && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center text-sm">
              Link copied to clipboard!
            </div>
          )}

          {article?.whatsappGroup && (
            <div className="mt-4 pt-4 border-t">
              <a
                href={article.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle size={20} />
                Join WhatsApp Discussion
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Enhanced Search Bar ---
const GlobalSearchBar: React.FC<{
  onSearch: (term: string) => void;
  onClear: () => void;
  loading?: boolean;
  value?: string;
}> = ({ onSearch, onClear, loading = false, value = '' }) => {
  const { lang } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState(value);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.trim()) {
        onSearch(term);
      }
    }, 500),
    [onSearch]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    } else {
      onClear();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    onClear();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                debouncedSearch(value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={TRANSLATIONS.ui.searchPlaceholder[lang]}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 focus:shadow-lg transition-all"
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
          >
            <Filter size={20} />
          </button>
          <Button onClick={handleSearch} loading={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {showFilters && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10 animate-in slide-in-from-top">
            <div className="mb-3">
              <label className="text-sm font-medium mb-2 block">Filter by Category</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Category).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${selectedCategory === cat
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    {TRANSLATIONS.categories[cat][lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Donation Page Component ---
const DonationPage: React.FC<{ stats: DonationStats }> = ({ stats }) => {
  const { lang } = useContext(LanguageContext);
  const [copied, setCopied] = useState<string | null>(null);

  const percentage = Math.min(100, Math.floor((stats.current / stats.goal) * 100));

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const paymentMethods = [
    {
      id: 'momo',
      name: 'Mobile Money (MTN)',
      account: '0788123456',
      owner: 'TOPRAY Digital Network',
      icon: <Smartphone className="text-yellow-500" />
    },
    {
      id: 'bank',
      name: 'Bank of Kigali (BK)',
      account: '00011-2223344-55',
      owner: 'TOPRAY Digital Network',
      icon: <Wallet className="text-blue-600" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <HandHeart size={64} className="mx-auto mb-6 text-red-600" />
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">{TRANSLATIONS.ui.donate[lang]}</h1>
        <p className="text-xl text-gray-500 font-serif italic max-w-2xl mx-auto">
          "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7
        </p>
      </div>

      {/* Progress Section */}
      <div className="bg-[#f9f9f9] p-10 border-2 border-black mb-16">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{TRANSLATIONS.ui.donationGoal[lang]}</h3>
            <p className="text-4xl font-black">{stats.current.toLocaleString()} / {stats.goal.toLocaleString()} FRW</p>
          </div>
          <span className="text-5xl font-black opacity-10">{percentage}%</span>
        </div>
        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden border border-black/5">
          <div
            className="h-full bg-black transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-6 text-sm text-gray-600 font-medium">
          Purpose: Funding our monthly server costs, health awareness campaigns, and providing Bible study materials to local communities.
        </p>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {paymentMethods.map(method => (
          <div key={method.id} className="border-2 border-black p-8 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gray-100 rounded-lg">{method.icon}</div>
              <h4 className="text-xl font-bold">{method.name}</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Number</p>
                <p className="text-2xl font-mono font-bold tracking-tighter">{method.account}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Name</p>
                <p className="text-lg font-bold">{method.owner}</p>
              </div>
              <button
                onClick={() => copyToClipboard(method.account, method.id)}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
              >
                {copied === method.id ? <><Check size={16} /> {TRANSLATIONS.ui.copied[lang]}</> : <><Copy size={16} /> {TRANSLATIONS.ui.copy[lang]}</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Health Page Component ---
const HealthPage: React.FC<{ articles: Article[] }> = ({ articles }) => {
  const { lang } = useContext(LanguageContext);
  const healthArticles = articles.filter(a => a.category === 'health');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="border-b-4 border-black pb-4 mb-12 flex justify-between items-end">
        <h1 className="text-6xl font-black uppercase tracking-tighter">Health & Wellness</h1>
        <p className="text-lg font-bold text-gray-400 italic">Natural, Biblical Healing for Life</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {healthArticles.slice(0, 3).map(a => (
            <div key={a.id} className="border-b-2 border-black pb-12">
              <div className="flex flex-col md:flex-row gap-8">
                <img src={a.image} className="w-full md:w-1/2 aspect-video object-cover rounded-xl" alt="" />
                <div>
                  <h3 className="text-3xl font-bold mb-4">{a.title[lang]}</h3>
                  <p className="text-lg text-gray-600 mb-6 italic">"{a.situation[lang]}"</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f0f9f0] p-4 rounded-lg">
                      <h5 className="text-xs font-bold uppercase mb-2 flex items-center gap-2"><Apple size={14} className="text-green-600" /> Hack</h5>
                      <ul className="text-xs space-y-1">
                        {a.healthHacks?.map((h, i) => <li key={i}>• {h}</li>)}
                      </ul>
                    </div>
                    <div className="bg-[#fff9f0] p-4 rounded-lg">
                      <h5 className="text-xs font-bold uppercase mb-2 flex items-center gap-2"><Leaf size={14} className="text-orange-600" /> Herbal</h5>
                      <ul className="text-xs space-y-1">
                        {a.herbalRemedies?.map((h, i) => <li key={i}>• {h}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-4">
          <div className="bg-black text-white p-8 rounded-xl">
            <h4 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity /> Health Wisdom</h4>
            <div className="space-y-6">
              <div className="border-b border-white/20 pb-4">
                <p className="text-sm font-bold uppercase text-gray-400 mb-2">Did you know?</p>
                <p className="text-lg font-serif">A 20-minute walk after lunch can lower blood sugar spikes by 22%.</p>
              </div>
              <div className="border-b border-white/20 pb-4">
                <p className="text-sm font-bold uppercase text-gray-400 mb-2">Biblical Insight</p>
                <p className="text-lg font-serif italic">"Honey is good for the soul and health for the body." - Proverbs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin Dashboard Component ---
const AdminDashboard: React.FC<{
  donationStats: DonationStats,
  onUpdateDonation: (val: number) => void
}> = ({ donationStats, onUpdateDonation }) => {
  const [pass, setPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [tempAmount, setTempAmount] = useState(donationStats.current);

  if (!isAuth) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold mb-6">Editorial Login</h2>
        <input
          type="password"
          placeholder="Access Key"
          className="w-full p-3 border-2 border-black mb-4 outline-none rounded-lg"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <Button onClick={() => pass === "topray_admin" && setIsAuth(true)} className="w-full">Unlock Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in">
      <div className="border-b-4 border-black pb-4 mb-12 flex justify-between items-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Publisher Console</h1>
        <div className="flex gap-4">
          <Button variant="outline">New Story</Button>
          <Button variant="outline">Analytics</Button>
          <Button onClick={() => setIsAuth(false)} variant="primary">Logout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Donation Management */}
          <div className="bg-white border-4 border-black p-8 rounded-xl">
            <h3 className="text-xl font-black uppercase tracking-widest mb-6">Financial Campaign Status</h3>
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Current Amount Collected (FRW)</label>
                <input
                  type="number"
                  value={tempAmount}
                  onChange={(e) => setTempAmount(Number(e.target.value))}
                  className="w-full p-4 text-2xl font-bold border-2 border-black outline-none rounded-lg"
                />
              </div>
              <Button onClick={() => onUpdateDonation(tempAmount)} className="h-16 px-10">Update Campaign</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-widest mb-4">Content Library</h3>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-gray-200 p-4 flex justify-between items-center bg-white rounded-lg">
                <div>
                  <h4 className="font-bold">Story ID: #234{i}</h4>
                  <p className="text-sm text-gray-500">Last edited 2 hours ago by Topray</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
                  <button className="text-red-600 text-xs font-bold hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#f9f9f9] p-6 space-y-6 self-start rounded-xl">
          <h5 className="font-bold border-b border-black pb-2">Stats Overview</h5>
          <div className="flex justify-between"><span>Unique Readers</span><span className="font-bold">4.2k</span></div>
          <div className="flex justify-between"><span>Daily Shares</span><span className="font-bold">892</span></div>
          <div className="flex justify-between"><span>Health Tips Views</span><span className="font-bold">1.5k</span></div>
          <div className="flex justify-between"><span>Donation Reach</span><span className="font-bold">{Math.floor((donationStats.current / donationStats.goal) * 100)}%</span></div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [lang, setLang] = useState<Language>('rw');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('bookmarks');
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  });
  const [currentPage, setCurrentPage] = useState<'home' | 'health' | 'admin' | 'privacy' | 'terms' | 'donate'>('home');
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [donationStats, setDonationStats] = useState<DonationStats>(INITIAL_DONATION_STATS);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
    const articleParam = params.get('article');

    if (searchParam) {
      setSearchQuery(searchParam);
      handleSearch(searchParam);
    }

    if (categoryParam && Object.values(Category).includes(categoryParam as Category)) {
      setActiveCategory(categoryParam as Category);
    }

    if (articleParam) {
      (async () => {
        try {
          const a = await getArticleById(articleParam);
          if (a) openArticle(a);
        } catch (err) {
          console.error('Failed to open article from URL param', err);
        }
      })();
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

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[key]?.[lang] || key;
  }, [lang]);

  const openArticle = useCallback(async (article: Article) => {
    try {
      setActiveArticle(article);
      if (article?.id) {
        try {
          const raw = localStorage.getItem('viewedArticles');
          const viewed = raw ? JSON.parse(raw) : [];
          if (!viewed.includes(article.id)) {
            await incrementArticleViews(article.id);
            viewed.push(article.id);
            localStorage.setItem('viewedArticles', JSON.stringify(viewed));
          }
        } catch (err) {
          console.error('Failed to increment views:', err);
        }

        try {
          const params = new URLSearchParams(window.location.search);
          params.set('article', article.id);
          const url = `${window.location.pathname}?${params.toString()}`;
          window.history.pushState({}, '', url);
        } catch (err) {
          // non-fatal
        }

        try {
          const fresh = await getArticleById(article.id);
          if (fresh) setActiveArticle(fresh as Article);
        } catch (err) {
          console.error('Failed to fetch article after opening:', err);
        }

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
  }, []);

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

  const handleUpdateDonation = (newAmount: number) => {
    setDonationStats(prev => ({ ...prev, current: newAmount }));
    alert("Donation stats updated successfully!");
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
          {/* Navigation Bar */}
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
                <button
                  onClick={() => navigateTo('donate')}
                  className={`hover:text-red-600 transition-colors flex items-center gap-2 ${currentPage === 'donate' ? 'text-red-600' : ''}`}
                >
                  <HandHeart size={14} /> {t('donate')}
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
                      className={`text-[9px] font-black px-2 py-1 border border-black/10 hover:border-black transition-all rounded ${lang === l.code ? 'bg-black text-white' : ''}`}
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
                <GlobalSearchBar
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  loading={searchLoading}
                  value={searchQuery}
                />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowShareModal(true)}
                      className="group"
                    >
                      <Share2 size={16} />
                      {TRANSLATIONS.ui.share[lang]}
                    </Button>
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

                <div className="mb-12 aspect-video overflow-hidden relative rounded-2xl">
                  <img
                    src={activeArticle.image}
                    className="w-full h-full object-cover"
                    alt={activeArticle.title[lang]}
                    loading="eager"
                  />
                </div>

                <div className="space-y-12 prose prose-xl max-w-none text-black/80 font-serif leading-relaxed">
                  <p className="text-3xl italic leading-tight text-gray-500 font-light">"  <SafeHTMLRenderer html={activeArticle.situation[lang]} />"</p>

                  <div className="bg-[#f9f9f9] p-8 border-l-8 border-black font-serif italic text-2xl rounded-r-lg">
                    {activeArticle.verse[lang]}
                  </div>

                  <div className="space-y-6">
                    <SafeHTMLRenderer html={activeArticle.teaching[lang]} />
                  </div>

                  {activeArticle.category === 'health' && activeArticle.healthHacks && activeArticle.herbalRemedies && (
                    <div className="bg-green-50 p-10 space-y-8 font-sans rounded-2xl">
                      <h4 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3"><Apple className="text-green-600" /> Professional Health Counsel</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h5 className="font-bold text-sm uppercase mb-4 text-green-800">Health Hacks</h5>
                          <ul className="space-y-2 text-sm italic">
                            {activeArticle.healthHacks.map((h, i) => <li key={i}>• {h}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-bold text-sm uppercase mb-4 text-green-800">Home Herbal Pharmacy</h5>
                          <ul className="space-y-2 text-sm italic">
                            {activeArticle.herbalRemedies.map((h, i) => <li key={i}>• {h}</li>)}
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

                {/* Action Buttons */}
                <div className="mt-12 flex flex-wrap gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 size={16} /> Share Article
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => activeArticle && toggleBookmark(activeArticle.id)}
                  >
                    {activeArticle && bookmarks.includes(activeArticle.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {activeArticle && bookmarks.includes(activeArticle.id) ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  {activeArticle?.whatsappGroup && (
                    <a href={activeArticle.whatsappGroup} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary">
                        <MessageCircle size={16} /> Join WhatsApp Discussion
                      </Button>
                    </a>
                  )}
                </div>

                {/* Comments Section */}
                <section className="mt-20">
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3"><MessageCircle /> Discourse</h3>
                  <div className="space-y-8">
                    {commentsLoading ? (
                      <div className="text-center py-8">Loading comments...</div>
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

                    <div className="bg-gray-50 p-8 rounded-xl">
                      <h5 className="text-xs font-bold uppercase mb-4">Add your thoughts</h5>
                      <input value={newCommentAuthor} onChange={(e) => setNewCommentAuthor(e.target.value)} placeholder="Your name (optional)" className="w-full p-3 mb-3 border border-gray-200 rounded-lg" />
                      <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} className="w-full h-32 p-4 border border-gray-200 outline-none focus:border-black transition-all rounded-lg" placeholder="Respectful discourse only..."></textarea>
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
                <div className="mt-20 bg-[#f4f4f4] p-10 rounded-2xl flex flex-col md:flex-row gap-8 items-center">
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
                        <div className="h-8 bg-gray-200 w-64 mb-8 rounded"></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
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
                            <button
                              onClick={handleClearSearch}
                              className="flex items-center gap-2 text-sm font-bold hover:text-red-600 transition-colors"
                            >
                              <ArrowLeft size={16} /> Back to all articles
                            </button>
                          </div>
                        </div>

                        {searchResults.length === 0 ? (
                          <div className="text-center py-20">
                            <Search size={48} className="mx-auto mb-6 text-gray-400" />
                            <h3 className="text-2xl font-bold mb-3">No results found</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                              We couldn't find any articles matching "{searchQuery}". Try searching with different keywords.
                            </p>
                            <Button onClick={handleClearSearch} variant="outline">
                              Clear Search
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {searchResults.map(article => (
                              <ArticleGridCard
                                key={article.id}
                                article={article}
                                onClick={openArticle}
                                bookmarked={bookmarks.includes(article.id)}
                                onToggleBookmark={toggleBookmark}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Main Home Content with Modern Grid
                      <>
                        {/* Category Navigation */}
                        <div className="mb-12">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Browse Categories</h2>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <button
                              onClick={() => setActiveCategory(null)}
                              className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activeCategory === null ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}
                            >
                              <LayoutGrid size={20} />
                              <span className="text-xs font-bold uppercase">All</span>
                              <span className="text-xs opacity-60">{Object.values(articleCounts).reduce((a, b) => a + b, 0)}</span>
                            </button>

                            {Object.values(Category).slice(0, 6).map(category => (
                              <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activeCategory === category ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}
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

                        {filteredArticles.length === 0 ? (
                          <div className="text-center py-20">
                            <Newspaper size={48} className="mx-auto mb-6 text-gray-400" />
                            <h3 className="text-2xl font-bold mb-3">No articles found</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                              {activeCategory
                                ? `There are no articles in the ${TRANSLATIONS.categories[activeCategory][lang]} category yet.`
                                : "No articles have been published yet."
                              }
                            </p>
                            {activeCategory && (
                              <Button onClick={() => setActiveCategory(null)} variant="outline">
                                View All Categories
                              </Button>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Featured Section */}
                            {filteredArticles[0] && (
                              <div className="mb-16">
                                <ArticleGridCard
                                  article={filteredArticles[0]}
                                  onClick={openArticle}
                                  layout="standard"
                                  bookmarked={bookmarks.includes(filteredArticles[0].id)}
                                  onToggleBookmark={toggleBookmark}
                                />
                              </div>
                            )}

                            {/* Grid Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                              {filteredArticles.slice(1, 7).map(article => (
                                <ArticleGridCard
                                  key={article.id}
                                  article={article}
                                  onClick={openArticle}
                                  layout="compact"
                                  bookmarked={bookmarks.includes(article.id)}
                                  onToggleBookmark={toggleBookmark}
                                />
                              ))}
                            </div>

                            {/* Subscription & Donation Sidebar */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
                              <div className="lg:col-span-2">
                                {/* More Articles Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {filteredArticles.slice(7, 11).map(article => (
                                    <ArticleGridCard
                                      key={article.id}
                                      article={article}
                                      onClick={openArticle}
                                      layout="compact"
                                      bookmarked={bookmarks.includes(article.id)}
                                      onToggleBookmark={toggleBookmark}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-8">
                                {/* Subscription Box */}
                                <div className="bg-black text-white p-8 rounded-2xl">
                                  <h4 className="text-2xl font-bold mb-4 italic">Get Biblical Clarity</h4>
                                  <p className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">
                                    Weekly newsletter on faith & health
                                  </p>
                                  <input
                                    type="email"
                                    placeholder="Your Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 p-3 mb-4 text-sm outline-none placeholder-gray-400 rounded-lg"
                                  />
                                  <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => handleSubscribe(email)}
                                  >
                                    {subscribed ? 'Subscribed!' : TRANSLATIONS.ui.subscribe[lang]}
                                  </Button>
                                </div>

                                {/* Donation Sidebar Preview */}
                                <div className="border-4 border-black p-6 bg-red-50 rounded-2xl">
                                  <h4 className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">Digital Ministry Support</h4>
                                  <div className="flex justify-between items-end mb-2">
                                    <span className="text-xl font-bold">{Math.floor((donationStats.current / donationStats.goal) * 100)}% Reached</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-black" style={{ width: `${(donationStats.current / donationStats.goal) * 100}%` }}></div>
                                  </div>
                                  <Button onClick={() => navigateTo('donate')} variant="primary" className="w-full">Contribute Now</Button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Other Pages */}
                {currentPage === 'health' && <HealthPage articles={articles} />}
                {currentPage === 'donate' && <DonationPage stats={donationStats} />}
                {currentPage === 'admin' && <AdminDashboard donationStats={donationStats} onUpdateDonation={handleUpdateDonation} />}
                {currentPage === 'privacy' && (
                  <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-8">{TRANSLATIONS.ui.privacyTitle[lang]}</h1>
                    <div className="prose prose-lg font-serif">
                      <p>{LEGAL.privacy[lang]}</p>
                      <div className="mt-6">
                        <h4 className="font-bold">Contact</h4>
                        <p className="text-sm text-gray-700">If you have questions about privacy, contact us at <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-red-600">{SOCIAL_LINKS.email}</a>.</p>
                        <div className="flex gap-3 mt-3">
                          <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="underline text-sm">WhatsApp</a>
                          <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="underline text-sm">Facebook</a>
                          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="underline text-sm">Instagram</a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {currentPage === 'terms' && (
                  <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-8">{TRANSLATIONS.ui.termsTitle[lang]}</h1>
                    <div className="prose prose-lg font-serif">
                      <p>{LEGAL.terms[lang]}</p>
                      <p className="mt-6 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-[#1a1a1a] text-white pt-32 pb-12 px-4 mt-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                <div className="md:col-span-2">
                  <h2 className="text-5xl font-black uppercase tracking-tighter mb-6">{TRANSLATIONS.siteName[lang]}</h2>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-md font-serif italic">
                    "Architecting spiritual and physical clarity for the modern human experience."
                  </p>
                  <div className="flex gap-4 mt-8">
                    <button className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all rounded-lg"><Globe size={20} /></button>
                    <button className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all rounded-lg"><BookOpen size={20} /></button>
                    <button className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all rounded-lg"><Shield size={20} /></button>
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
                  <button onClick={() => navigateTo('terms')} className="text-left text-sm font-bold uppercase hover:text-red-500">{TRANSLATIONS.ui.termsTitle[lang]}</button>
                  <button onClick={() => navigateTo('privacy')} className="text-left text-sm font-bold uppercase hover:text-red-500">{TRANSLATIONS.ui.privacyTitle[lang]}</button>
                  <button onClick={() => navigateTo('admin')} className="text-left text-sm font-bold uppercase hover:text-red-500">Publisher Login</button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                <div className="flex flex-col gap-2">
                  <p>© {new Date().getFullYear()} My Life Today DIGITAL NETWORK. ALL RIGHTS RESERVED.</p>
                  <p className="flex items-center gap-2">DESIGNED BY <span className="text-white">TOPRAY</span> • ARCHITECTED BY AN EXPERT</p>
                </div>
                <div className="flex gap-8">
                  <a href="https://devtopray.netlify.app" className="flex items-center gap-2 hover:text-white transition-colors">PORTFOLIO <ExternalLink size={12} /></a>
                  <a href="https://devtopray.netlify.app" className="flex items-center gap-2 hover:text-white transition-colors">CONTACT EDITORIAL</a>
                </div>
              </div>
            </div>
          </footer>

          {/* Share Modal */}
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            article={activeArticle}
          />
        </div>
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
}