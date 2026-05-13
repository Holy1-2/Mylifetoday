
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
  date: string;
  image: string;
  featuredImage?: string; // optional override for social previews
  slug?: string;
  createdAt?: any;
  publishDate?: any;
  updatedAt?: any;
  editor: string;
  editorBio?: string;
  tags: string[];
  comments?: Comment[];
  healthHacks?: string[];
  herbalRemedies?: string[];
  videos?: string[];
  whatsappGroup?: string;
  views?: number;
  metaDescription?: Record<Language, string>;
  mediaEmbeds?: string[];
}

export interface Translations {
  siteName: Record<Language, string>;
  tagline: Record<Language, string>;
  categories: Record<Category, Record<Language, string>>;
  ui: Record<string, Record<Language, string>>;
  [key: string]: any; // Allow dynamic access
}
