import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { categoryImages } from '../utils/categoryImages';

interface CategoryCarouselProps {
  counts?: Record<string, number>;
}

const CategoryCarousel = ({ counts = {} }: CategoryCarouselProps) => {
  const { lang, t, categoryName } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const items = Object.values(Category);

  const slide = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector('a');
    const step = card ? card.clientWidth + 16 : 200;
    scroller.scrollBy({ left: direction * step * 2, behavior: 'smooth' });
  };

  return (
    <section className="mt-16 border-t border-black/10 pt-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-[#1a1a1a] sm:text-2xl">
            {t('browseCategories')}
          </h2>
          <p className="mt-1 text-xs text-gray-400">{t('browseCategoriesSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={t('back')}
            onClick={() => slide(-1)}
            className="grid h-10 w-10 place-items-center rounded-none border border-black/15 text-[#1a1a1a] transition hover:border-black hover:bg-black hover:text-white"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            aria-label={t('mediaReelNext')}
            onClick={() => slide(1)}
            className="grid h-10 w-10 place-items-center rounded-none border border-black/15 text-[#1a1a1a] transition hover:border-black hover:bg-black hover:text-white"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
      >
        {items.map((category) => (
          <Link
            key={category}
            to={`/${lang}/search?category=${category}`}
            className="group relative h-40 w-40 shrink-0 snap-start overflow-hidden bg-[#101012] ring-1 ring-black/10 sm:h-48 sm:w-48"
          >
            <img
              src={categoryImages[category]}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
              <span className="mb-2 block h-1 w-6 bg-red-600" />
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                {categoryName(category)}
              </span>
            </div>
            <span className="absolute right-3 top-3 bg-black/55 px-2 py-1 text-[10px] font-bold tracking-wider text-white/70">
              {counts[category] || 0}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryCarousel;
