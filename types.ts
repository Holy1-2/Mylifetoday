
export type Language = 'en' | 'rw' | 'sw' | 'fr';

export enum Category {
  DAILY_LIFE = 'daily_life',
  MONEY_WORK = 'money_work',
  RELATIONSHIPS = 'relationships',
  MENTAL_HEALTH = 'mental_health',
  TECH = 'tech',
  SOCIETY = 'society',
  HOPE = 'hope',
  HEALTH = 'health'
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
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
  editor: string;
  editorBio?: string;
  tags: string[];
  comments?: Comment[];
  healthHacks?: string[];
  herbalRemedies?: string[];
}

export interface Translations {
  siteName: Record<Language, string>;
  tagline: Record<Language, string>;
  categories: Record<Category, Record<Language, string>>;
  ui: {
    readMore: Record<Language, string>;
    latestArticles: Record<Language, string>;
    searchPlaceholder: Record<Language, string>;
    share: Record<Language, string>;
    comments: Record<Language, string>;
    healthSection: Record<Language, string>;
  };
}
