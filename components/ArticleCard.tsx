import { Link } from 'react-router-dom';
import type { Article } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { readingMinutes, truncate } from '../utils/text';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'row';
  showCategory?: boolean;
}

const ArticleCard = ({ article, variant = 'default', showCategory = true }: ArticleCardProps) => {
  const { lang, t, categoryName, dateLabel } = useLanguage();
  const title = article.title?.[lang] || article.title?.en || article.title?.rw || 'Untitled Article';
  const situation = article.situation?.[lang] || article.situation?.en || article.situation?.rw || '';
  const href = `/${lang}/articles/${article.slug || article.id}`;
  const minutes = readingMinutes(article.situation?.[lang], article.teaching?.[lang]);
  const date = dateLabel(article.publishDate || article.createdAt || article.date);

  if (variant === 'featured') {
    return (
      <Link to={href} className="group block border-b border-black/10 pb-10">
        <div className="aspect-video overflow-hidden mb-5 bg-gray-200">
          {article.image ? (
            <img
              src={article.image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : null}
        </div>
        {showCategory && (
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-3 block">
            {categoryName(article.category)}
          </span>
        )}
        <h2 className="text-3xl md:text-5xl font-bold font-serif leading-[1.05] tracking-tight group-hover:underline mb-4">
          {title}
        </h2>
        <div className="text-[#555] text-lg leading-relaxed line-clamp-3 mb-6">
          {truncate(situation, 240)}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#999]">
          <span className="text-black">{article.editor || 'Editorial Desk'}</span>
          <span>•</span>
          <span>{date}</span>
          <span>•</span>
          <span>
            {minutes} {t('minRead')}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'row') {
    return (
      <Link to={href} className="group flex gap-5 border-b border-black/10 pb-5">
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden bg-gray-200">
          {article.image ? (
            <img
              src={article.image}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : null}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          {showCategory && (
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-1">
              {categoryName(article.category)}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-bold font-serif leading-tight group-hover:underline line-clamp-2">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2 flex-1">{truncate(situation, 120)}</p>
          <div className="flex items-center justify-between mt-2 text-[9px] font-bold uppercase tracking-widest text-[#999]">
            <span>{date}</span>
            <span className="text-black group-hover:text-red-600 transition-colors">{t('readMore')} →</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={href} className="group block">
      <div className="aspect-square overflow-hidden mb-4 relative bg-gray-200">
        {article.image ? (
          <img
            src={article.image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {showCategory && (
          <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white uppercase tracking-widest bg-black/80 px-2 py-1">
            {categoryName(article.category)}
          </span>
        )}
      </div>
      <h3 className="font-bold font-serif leading-tight group-hover:underline mb-1 line-clamp-2">
        {title}
      </h3>
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>{date}</span>
        <span>
          {minutes} {t('minRead')}
        </span>
      </div>
    </Link>
  );
};

export default ArticleCard;
