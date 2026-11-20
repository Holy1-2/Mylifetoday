export type Language = 'en' | 'rw' | 'sw' | 'fr';

export enum Category {
  DAILY_LIFE = 'daily_life',
  MONEY_WORK = 'money_work',
  RELATIONSHIPS = 'relationships',
  MENTAL_HEALTH = 'mental_health',
  TECH = 'tech',
  SOCIETY = 'society',
  HOPE = 'hope',
  HEALTH = 'health',
  HISTORY = 'history',
  TESTIMONY = 'testimony'
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  createdAt?: any;
}

export interface Article {
  id: string;
  category: Category;
  title: Record<Language, string>;
  situation: Record<Language, string>;
  verse: Record<Language, string>;
  teaching: Record<Language, string>;
  practice: Record<Language, string>;
  prayer: Record<Language, string>;
  closure?: Record<Language, string>;
  date: string;
  image: string;
  featuredImage?: string;
  gallery?: string[];
  slug?: string;
  createdAt?: any;
  publishDate?: any;
  updatedAt?: any;
  editor: string;
  editorBio?: string;
  authorName?: string;
  authorBio?: string;
  tags: string[];
  comments?: Comment[];
  healthHacks?: string[];
  herbalRemedies?: string[];
  videos?: string[];
  audio?: string[];
  whatsappGroup?: string;
  telegramChannel?: string;
  views?: number;
  viewsByDay?: Record<string, number>;
  status?: 'draft' | 'published' | 'scheduled';
  featured?: boolean;
  metaDescription?: Record<Language, string> | string;
  keywords?: string;
  mediaEmbeds?: string[];
}

export interface MediaItem {
  id: string;
  type: 'youtube' | 'video' | 'audio' | 'image' | 'quote';
  title: string;
  url?: string;
  text?: string;
  author?: string;
  thumbnail?: string;
  category?: string;
  likes?: number;
  language?: Language;
  status?: 'draft' | 'published';
  createdAt?: any;
}

export interface JournalEntry {
  id?: string;
  type: 'reflection' | 'prayer' | 'note';
  title?: string;
  text: string;
  reference?: string;
  answered?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface SavedArticleSnapshot {
  id: string;
  articleId?: string;
  slug?: string;
  title?: string;
  situation?: string;
  image?: string;
  category?: string;
  date?: string;
  savedAt?: any;
}

export interface SavedVerse {
  id: string;
  verseId?: string;
  reference: Record<Language, string> | string;
  text: Record<Language, string> | string;
  language?: Language;
  savedAt?: any;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface Verse {
  id: string;
  reference: Record<Language, string>;
  text: Record<Language, string>;
}

export interface DailyVerse extends Verse {
  date?: string;
  image?: string;
  status?: 'draft' | 'published';
  createdAt?: any;
}

export interface SiteSettings {
  announcement?: string;
  siteName?: string;
  tagline?: string;
  defaultLang?: Language;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  reference?: string;
  explanation?: string;
  active?: boolean;
  status?: string;
  createdAt?: any;
}

export interface QuizAnswer {
  id?: string;
  questionId: string;
  userName: string;
  userId?: string | null;
  answerIndex: number;
  isCorrect?: boolean;
  createdAt?: any;
}

export interface Translations {
  siteName: Record<Language, string>;
  tagline: Record<Language, string>;
  categories: Record<Category, Record<Language, string>>;
  ui: Record<string, Record<Language, string>>;
  [key: string]: any;
}
