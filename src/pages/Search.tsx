import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Filter, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import VoiceSearchButton from '../components/VoiceSearchButton';
import { useSearch } from '../hooks/useSearch';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import { cn } from '../lib/utils';

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  icon?: string;
}

export default function Search() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAr = i18n.language === 'ar';

  const urlQuery = searchParams.get('q') || '';

  const { query, setQuery, results, pagination, isLoading, error, searchPage } = useSearch();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const { data } = await api.get('/products/categories');
        if (!cancelled) {
          setCategories(data.data ?? data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    }

    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  function handleSearchInput(value: string) {
    setQuery(value);
    setSearchParams(value.trim() ? { q: value.trim() } : {}, { replace: true });
  }

  function handleCategoryToggle(categoryId: string) {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > pagination.pages) return;
    searchPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filteredResults = selectedCategory
    ? results.filter((product) => product.category_id === selectedCategory)
    : results;

  function getPageNumbers(): (number | '...')[] {
    const { page, pages } = pagination;
    if (pages <= 5) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    const items: (number | '...')[] = [1];
    if (page > 3) items.push('...');

    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);
    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (page < pages - 2) items.push('...');
    items.push(pages);

    return items;
  }

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <SearchIcon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={t('home.search_placeholder')}
            className="input ps-12 pe-20 py-3.5 text-base sm:text-lg w-full"
            autoFocus
          />
          <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={() => handleSearchInput('')}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <VoiceSearchButton
              onResult={(transcript) => handleSearchInput(transcript)}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">{t('home.categories')}</span>
        </div>

        {loadingCategories ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-400">{t('common.loading')}</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border active:scale-[0.97]',
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                )}
              >
                {category.icon && <span>{category.icon}</span>}
                {isAr ? category.name_ar : category.name_en}
                {selectedCategory === category.id && (
                  <X className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {error && (
        <div className="card text-center py-8">
          <p className="text-red-500 mb-2">{t('common.error')}</p>
          <button
            onClick={() => searchPage(pagination.page)}
            className="btn-ghost text-sm text-primary-500"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl skeleton" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                  <div className="h-3 skeleton w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !query.trim() ? (
        <div className="text-center py-16">
          <SearchIcon className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">{t('home.search_placeholder')}</p>
        </div>
      ) : filteredResults.length > 0 ? (
        <>
          <p className="text-sm text-gray-400 mb-4 font-medium">
            {t('search.results_count', { count: pagination.total })}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredResults.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nameAr={product.name_ar}
                nameEn={product.name_en}
                brandAr={product.brand_ar}
                brandEn={product.brand_en}
                imageUrl={product.image_url}
                unitAr={product.unit_ar}
                unitEn={product.unit_en}
                unitSize={product.unit_size}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <nav className="flex items-center justify-center gap-1 mt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className={cn(
                  'p-2.5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center',
                  pagination.page <= 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 active:scale-95'
                )}
                aria-label={t('common.previous')}
              >
                {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>

              {getPageNumbers().map((pageNum, idx) =>
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-300">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95',
                      pageNum === pagination.page
                        ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className={cn(
                  'p-2.5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center',
                  pagination.page >= pagination.pages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 active:scale-95'
                )}
                aria-label={t('common.next')}
              >
                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <SearchIcon className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">{t('common.no_results')}</p>
        </div>
      )}
    </div>
  );
}
