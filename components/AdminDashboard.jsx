import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Settings, Plus, Edit, Trash2, Eye,
  LogOut, Calendar, TrendingUp, Users, FileText,
  Save, Image as ImageIcon, Tag, Globe, Lock, AlertCircle,
  Upload, Download, CheckCircle, XCircle, Menu, X,
  Share2, MessageSquare, Heart, BookOpen, Filter,
  Search, ChevronDown, ChevronUp, Clock, User,
  Mail, Phone, ExternalLink, Copy, Grid, List,
  PieChart, DollarSign, Bell, Shield, Zap,
  Bookmark, Star, Target, TrendingDown, Award, LogIn
} from 'lucide-react';
import { getArticles, deleteArticle, addArticle, updateArticle, getSubscriptions, loginUser, logoutUser } from '../services/firebaseService';
import { Category } from '../types';
import { toast, Toaster } from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import "react-quill-new/dist/quill.snow.css";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('admin@providence.com');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [articles, setArticles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalSubscribers: 0,
    todaysViews: 0,
    engagementRate: '72%'
  });

  // Rich text editor modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // Form state - Complete article structure
  const [formData, setFormData] = useState({
    // English content
    title: { en: '', fr: '', rw: '', sw: '' },
    situation: { en: '', fr: '', rw: '', sw: '' },
    verse: { en: '', fr: '', rw: '', sw: '' },
    teaching: { en: '', fr: '', rw: '', sw: '' },
    practice: { en: '', fr: '', rw: '', sw: '' },
    prayer: { en: '', fr: '', rw: '', sw: '' },
    closure: { en: '', fr: '', rw: '', sw: '' },

    // Article metadata
    category: Category.DAILY_LIFE,
    editor: 'Topray',
    editorBio: 'Expert in Biblical wisdom and modern life applications',
    image: '',
    featuredImage: '',

    // Content arrays
    healthHacks: [''],
    herbalRemedies: [''],
    tags: [],

    // SEO
    metaDescription: '',
    keywords: '',

    // Social
    whatsappGroup: '',
    telegramChannel: '',

    // Scheduling
    publishDate: new Date().toISOString().split('T')[0],
    featured: false,
    status: 'draft'
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const articlesData = await getArticles();
      const subsData = await getSubscriptions();
      setArticles(articlesData);
      setSubscriptions(subsData);

      // Calculate stats
      setStats({
        totalArticles: articlesData.length,
        totalSubscribers: subsData.length,
        todaysViews: articlesData.reduce((sum, article) => sum + (article.views || 0), 0),
        engagementRate: '72%'
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try Firebase Auth first
      await loginUser(email, password);
      setIsAuthenticated(true);
      toast.success('Welcome to Admin Dashboard!');
    } catch (firebaseError) {
      // Fallback for development
      if (email === 'admin@providence.com' && password === 'admin123') {
        setIsAuthenticated(true);
        toast.success('Welcome to Admin Dashboard! (Development Mode)');
      } else {
        setError('Invalid credentials. Use admin@providence.com / admin123');
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields (Kinyarwanda title is required by default)
      if (!formData.title.rw.trim()) {
        throw new Error('Kinyarwanda title is required');
      }

      if (!formData.image) {
        // Set default image
        setFormData(prev => ({
          ...prev,
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop'
        }));
      }

      // Clean arrays
      const cleanData = {
        ...formData,
        healthHacks: formData.healthHacks.filter(h => h.trim()),
        herbalRemedies: formData.herbalRemedies.filter(h => h.trim()),
        tags: formData.tags.filter(t => t.trim())
      };

      let result;
      if (currentArticle) {
        result = await updateArticle(currentArticle.id, cleanData);
        toast.success('Article updated successfully!');
      } else {
        result = await addArticle(cleanData);
        toast.success('Article published successfully!');
      }

      // Reset form
      resetForm();
      loadData();

    } catch (error) {
      console.error('Error saving article:', error);
      setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: { en: '', fr: '', rw: '', sw: '' },
      situation: { en: '', fr: '', rw: '', sw: '' },
      verse: { en: '', fr: '', rw: '', sw: '' },
      teaching: { en: '', fr: '', rw: '', sw: '' },
      practice: { en: '', fr: '', rw: '', sw: '' },
      prayer: { en: '', fr: '', rw: '', sw: '' },
      closure: { en: '', fr: '', rw: '', sw: '' },
      category: Category.DAILY_LIFE,
      editor: 'Topray',
      editorBio: 'Expert in Biblical wisdom and modern life applications',
      image: '',
      featuredImage: '',
      healthHacks: [''],
      herbalRemedies: [''],
      tags: [],
      metaDescription: '',
      keywords: '',
      whatsappGroup: '',
      telegramChannel: '',
      publishDate: new Date().toISOString().split('T')[0],
      featured: false,
      status: 'draft'
    });
    setCurrentArticle(null);
    setIsEditing(false);
  };

  const handleImageUpload = (e, field = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    // Simple base64 upload for demo
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result }));
      toast.success('Image uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const addHealthHack = () => {
    setFormData(prev => ({
      ...prev,
      healthHacks: [...prev.healthHacks, '']
    }));
  };

  const addHerbalRemedy = () => {
    setFormData(prev => ({
      ...prev,
      herbalRemedies: [...prev.herbalRemedies, '']
    }));
  };

  const updateHealthHack = (index, value) => {
    const newHacks = [...formData.healthHacks];
    newHacks[index] = value;
    setFormData(prev => ({ ...prev, healthHacks: newHacks }));
  };

  const updateHerbalRemedy = (index, value) => {
    const newRemedies = [...formData.herbalRemedies];
    newRemedies[index] = value;
    setFormData(prev => ({ ...prev, herbalRemedies: newRemedies }));
  };

  const handleEditArticle = (article) => {
    setCurrentArticle(article);
    setFormData({
      title: article.title || { en: '', fr: '', rw: '', sw: '' },
      situation: article.situation || { en: '', fr: '', rw: '', sw: '' },
      verse: article.verse || { en: '', fr: '', rw: '', sw: '' },
      teaching: article.teaching || { en: '', fr: '', rw: '', sw: '' },
      practice: article.practice || { en: '', fr: '', rw: '', sw: '' },
      prayer: article.prayer || { en: '', fr: '', rw: '', sw: '' },
      closure: article.closure || { en: '', fr: '', rw: '', sw: '' },
      category: article.category || Category.DAILY_LIFE,
      editor: article.editor || 'Topray',
      editorBio: article.editorBio || 'Expert in Biblical wisdom and modern life applications',
      image: article.image || '',
      featuredImage: article.featuredImage || '',
      healthHacks: article.healthHacks || [''],
      herbalRemedies: article.herbalRemedies || [''],
      tags: article.tags || [],
      metaDescription: article.metaDescription || '',
      keywords: article.keywords || '',
      whatsappGroup: article.whatsappGroup || '',
      telegramChannel: article.telegramChannel || '',
      publishDate: article.publishDate || new Date().toISOString().split('T')[0],
      featured: article.featured || false,
      status: article.status || 'draft'
    });
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        await deleteArticle(id);
        setArticles(articles.filter(article => article.id !== id));
        toast.success('Article deleted successfully');
      } catch (error) {
        toast.error('Failed to delete article');
      }
    }
  };

  const handleExportSubscriptions = () => {
    const csv = subscriptions.map(sub =>
      `${sub.email},${sub.name || ''},${sub.subscribedAt || ''}`
    ).join('\n');

    const blob = new Blob([`Email,Name,Subscribed At\n${csv}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.csv';
    a.click();

    toast.success('Subscriptions exported successfully');
  };

  const filteredArticles = articles.filter(article =>
    (article.title?.rw || article.title?.en)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">PROVIDENCE</h1>
            <p className="text-gray-400">Admin Dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="admin@providence.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-bold text-sm hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Demo: admin@providence.com / admin123
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">The Providence</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={() => {
                logoutUser();
                setIsAuthenticated(false);
                toast.success('Logged out successfully');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-sm transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
            <nav className="p-4">
              <div className="space-y-1">
                {[
                  { id: 'dashboard', icon: <Grid size={20} />, label: 'Dashboard' },
                  { id: 'articles', icon: <FileText size={20} />, label: 'Articles', count: articles.length },
                  { id: 'subscriptions', icon: <Users size={20} />, label: 'Subscribers', count: subscriptions.length },
                  { id: 'analytics', icon: <BarChart size={20} />, label: 'Analytics' },
                  { id: 'settings', icon: <Settings size={20} />, label: 'Settings' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                        ? 'bg-red-50 text-red-700 font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-bold text-sm hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  New Article
                </button>
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {isEditing ? (
            <ArticleEditor
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmitArticle}
              onCancel={resetForm}
              loading={loading}
              currentArticle={currentArticle}
              handleImageUpload={handleImageUpload}
              addHealthHack={addHealthHack}
              addHerbalRemedy={addHerbalRemedy}
              updateHealthHack={updateHealthHack}
              updateHerbalRemedy={updateHerbalRemedy}
              modules={modules}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardOverview stats={stats} articles={articles} subscriptions={subscriptions} />
              )}

              {activeTab === 'articles' && (
                <ArticlesManagement
                  articles={filteredArticles}
                  onEdit={handleEditArticle}
                  onDelete={handleDeleteArticle}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}

              {activeTab === 'subscriptions' && (
                <SubscriptionsManagement
                  subscriptions={subscriptions}
                  onExport={handleExportSubscriptions}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard stats={stats} articles={articles} />
              )}

              {activeTab === 'settings' && (
                <SettingsPanel />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Sub-components for better organization
const DashboardOverview = ({ stats, articles, subscriptions }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<FileText className="text-blue-600" size={24} />}
        title="Total Articles"
        value={stats.totalArticles}
        change="+12%"
        trend="up"
      />
      <StatCard
        icon={<Users className="text-green-600" size={24} />}
        title="Subscribers"
        value={stats.totalSubscribers}
        change="+8%"
        trend="up"
      />
      <StatCard
        icon={<Eye className="text-purple-600" size={24} />}
        title="Today's Views"
        value={stats.todaysViews.toLocaleString()}
        change="+24%"
        trend="up"
      />
      <StatCard
        icon={<TrendingUp className="text-orange-600" size={24} />}
        title="Engagement"
        value={stats.engagementRate}
        change="+5%"
        trend="up"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Articles</h3>
          <button className="text-sm text-red-600 font-semibold hover:text-red-700">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {articles.slice(0, 5).map(article => (
            <div key={article.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={article.image} alt={(article.title?.rw || article.title?.en)} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h4 className="font-semibold text-sm line-clamp-1">{article.title?.rw || article.title?.en}</h4>
                  <p className="text-xs text-gray-500">{article.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{article.views || 0} views</p>
                <p className="text-xs text-gray-500">{article.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Subscribers</h3>
          <button className="text-sm text-red-600 font-semibold hover:text-red-700">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {subscriptions.slice(0, 5).map(sub => (
            <div key={sub.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-100 to-red-50 rounded-full flex items-center justify-center">
                  <User className="text-red-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{sub.email}</h4>
                  <p className="text-xs text-gray-500">{sub.name || 'No name provided'}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {sub.subscribedAt?.toDate?.().toLocaleDateString() || 'Recent'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ArticlesManagement = ({ articles, onEdit, onDelete, searchTerm, setSearchTerm }) => (
  <div className="bg-white rounded-xl border border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Articles Management</h2>
          <p className="text-gray-500">Manage and publish your content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-full md:w-64"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
            <option>All Categories</option>
            <option>Health</option>
            <option>Daily Life</option>
            <option>Relationships</option>
          </select>
        </div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Article</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {articles.map(article => (
            <tr key={article.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img src={article.image} alt={(article.title?.rw || article.title?.en)} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{article.title?.rw || article.title?.en}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{article.situation?.rw || article.situation?.en}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                  {article.category}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${article.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {article.status || 'draft'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-gray-400" />
                  <span className="font-semibold">{article.views || 0}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {article.date}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(article)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(article.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SubscriptionsManagement = ({ subscriptions, onExport }) => (
  <div className="bg-white rounded-xl border border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscribers</h2>
          <p className="text-gray-500">{subscriptions.length} total subscribers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription Date</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subscriptions.map(sub => (
            <tr key={sub.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-100 to-red-50 rounded-full flex items-center justify-center">
                    <Mail className="text-red-600" size={16} />
                  </div>
                  <span className="font-medium">{sub.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={sub.name ? '' : 'text-gray-400 italic'}>
                  {sub.name || 'Not provided'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {sub.subscribedAt?.toDate?.().toLocaleDateString() || 'N/A'}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ArticleEditor = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  currentArticle,
  handleImageUpload,
  addHealthHack,
  addHerbalRemedy,
  updateHealthHack,
  updateHerbalRemedy,
  modules
}) => (
  <div className="max-w-6xl mx-auto">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {currentArticle ? 'Edit Article' : 'Create New Article'}
        </h1>
        <p className="text-gray-500">Fill in all required fields below</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Preview functionality
            toast.info('Preview feature coming soon');
          }}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold text-sm hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : currentArticle ? (
            <>
              <Save size={18} />
              Update Article
            </>
          ) : (
            <>
              <Plus size={18} />
              Publish Article
            </>
          )}
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Article Title</h3>
          <input
            type="text"
            value={formData.title.rw}
            onChange={(e) => setFormData({
              ...formData,
              title: { ...formData.title, rw: e.target.value }
            })}
            className="w-full p-4 text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            placeholder="Enter article title"
            required
          />
        </div>

        {/* Situation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Situation/Introduction</h3>
          <ReactQuill
            value={formData.situation.rw}
            onChange={(value) => setFormData({
              ...formData,
              situation: { ...formData.situation, rw: value }
            })}
            modules={modules}
            theme="snow"
            className="h-48 mb-12"
          />
        </div>

        {/* Teaching */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Biblical Teaching</h3>
          <ReactQuill
            value={formData.teaching.rw}
            onChange={(value) => setFormData({
              ...formData,
              teaching: { ...formData.teaching, rw: value }
            })}
            modules={modules}
            theme="snow"
            className="h-64 mb-12"
          />
        </div>

        {/* Practice */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Daily Practice Step</h3>
          <textarea
            value={formData.practice.rw}
            onChange={(e) => setFormData({
              ...formData,
              practice: { ...formData.practice, rw: e.target.value }
            })}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 h-32"
            placeholder="What practical step should readers take?"
          />
        </div>

        {/* Prayer & Closure */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Prayer & Closing Thoughts</h3>
          <ReactQuill
            value={formData.prayer.rw}
            onChange={(value) => setFormData({
              ...formData,
              prayer: { ...formData.prayer, rw: value }
            })}
            modules={modules}
            theme="snow"
            className="h-48 mb-12"
          />
        </div>

        {/* Health Content */}
        {formData.category === 'health' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">Health & Wellness Content</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Health Hacks</h4>
                {formData.healthHacks.map((hack, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={hack}
                      onChange={(e) => updateHealthHack(index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="e.g., Drink 8 glasses of water daily"
                    />
                    {index > 0 && (
                      <button
                        onClick={() => {
                          const newHacks = formData.healthHacks.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, healthHacks: newHacks }));
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addHealthHack}
                  className="mt-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  + Add Health Hack
                </button>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Herbal Remedies</h4>
                {formData.herbalRemedies.map((remedy, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={remedy}
                      onChange={(e) => updateHerbalRemedy(index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="e.g., Ginger tea for digestion"
                    />
                    {index > 0 && (
                      <button
                        onClick={() => {
                          const newRemedies = formData.herbalRemedies.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, herbalRemedies: newRemedies }));
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addHerbalRemedy}
                  className="mt-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  + Add Herbal Remedy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Settings */}
      <div className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Featured Image</h3>
          <div className="space-y-4">
            {formData.image ? (
              <div className="relative">
                <img src={formData.image} alt="Featured" className="w-full h-48 object-cover rounded-lg" />
                <button
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500 mb-4">Upload featured image</p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                    className="hidden"
                  />
                  <span className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Choose Image
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Article Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Article Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Publish Date</label>
              <input
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <label htmlFor="featured" className="text-sm font-semibold">
                Mark as Featured
              </label>
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">SEO Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Meta Description</label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 h-24"
                placeholder="Brief description for search engines"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Keywords</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="comma, separated, keywords"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Community Links</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">WhatsApp Group</label>
              <input
                type="url"
                value={formData.whatsappGroup}
                onChange={(e) => setFormData({ ...formData, whatsappGroup: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Telegram Channel</label>
              <input
                type="url"
                value={formData.telegramChannel}
                onChange={(e) => setFormData({ ...formData, telegramChannel: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="https://t.me/..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, title, value, change, trend }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gray-50 rounded-xl">
        {icon}
      </div>
      <span className={`text-sm font-semibold flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
        {trend === 'up' ? '↗' : '↘'} {change}
      </span>
    </div>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-gray-500 text-sm mt-1">{title}</p>
  </div>
);

const AnalyticsDashboard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
    <div className="text-center py-12 text-gray-500">
      <BarChart className="mx-auto mb-4 text-gray-400" size={48} />
      <p className="text-lg">Analytics dashboard coming soon</p>
      <p className="text-sm mt-2">Track detailed metrics and performance</p>
    </div>
  </div>
);

const SettingsPanel = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h2 className="text-2xl font-bold mb-6">Settings</h2>
    <div className="text-center py-12 text-gray-500">
      <Settings className="mx-auto mb-4 text-gray-400" size={48} />
      <p className="text-lg">Settings panel coming soon</p>
      <p className="text-sm mt-2">Configure your site settings and preferences</p>
    </div>
  </div>
);

export default AdminDashboard;