import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, TrendingUp, Store, PlusCircle, ArrowRight, Sparkles, Trophy } from 'lucide-react';
import VoiceSearchButton from '../components/VoiceSearchButton';
import { useRegion } from '../hooks/useRegion';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import StoreCard from '../components/StoreCard';
import SEOHead from '../components/SEOHead';

interface TrendingProduct {
  id: string;
  name_ar: string;
  name_en: string;
  brand_ar: string | null;
  brand_en: string | null;
  image_url: string | null;
  unit_ar: string;
  unit_en: string;
  unit_size: string | null;
  cheapest_price: number | null;
}

interface RankedStore {
  id: string;
  name: string;
  address_ar: string | null;
  address_en: string | null;
  store_type: string;
  verified: boolean;
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedRegion } = useRegion();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [cheapestStores, setCheapestStores] = useState<RankedStore[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<{ id: string; title_ar: string; title_en: string; description_ar: string; description_en: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrending() {
      setLoadingTrending(true);
      try {
        const { data } = await api.get('/products/trending');
        if (!cancelled) {
          setTrendingProducts(data.data ?? data);
        }
      } catch (err) {
        console.error('Failed to fetch trending products:', err);
      } finally {
        if (!cancelled) setLoadingTrending(false);
      }
    }

    fetchTrending();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    api.get('/challenges/active')
      .then(({ data }) => setActiveChallenge(data.data ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedRegion) {
      setCheapestStores([]);
      setLoadingStores(false);
      return;
    }

    let cancelled = false;

    async function fetchStores() {
      setLoadingStores(true);
      try {
        const { data } = await api.get('/stores/rankings', {
          params: { region_id: selectedRegion!.id },
        });
        if (!cancelled) {
          setCheapestStores(data.data ?? data);
        }
      } catch (err) {
        console.error('Failed to fetch store rankings:', err);
      } finally {
        if (!cancelled) setLoadingStores(false);
      }
    }

    fetchStores();
    return () => { cancelled = true; };
  }, [selectedRegion]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <div className="-mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
      <SEOHead title="Bekam - بكام" description="Compare grocery prices in Egypt | قارن أسعار البقالة في مصر" />
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: 'var(--theme-gradient)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 start-10 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-10 end-10 w-48 h-48 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute top-1/2 start-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {t('home.hero_badge', 'Compare prices across Egypt')}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-cairo text-white mb-4 text-balance">
            {t('home.hero_title')}
          </h1>
          <p className="text-base sm:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {t('home.hero_subtitle')}
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.search_placeholder')}
                className="w-full rounded-2xl border-0 py-3.5 sm:py-4 ps-12 pe-40 text-gray-900 shadow-xl
                           placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 text-base"
              />
              <div className="absolute end-[5.5rem] top-1/2 -translate-y-1/2">
                <VoiceSearchButton
                  onResult={(transcript) => {
                    setSearchQuery(transcript);
                    navigate(`/search?q=${encodeURIComponent(transcript)}`);
                  }}
                />
              </div>
              <button
                type="submit"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 btn-primary rounded-xl px-5 py-2.5 shadow-none"
              >
                {t('common.search')}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Region Selector CTA */}
      {!selectedRegion && (
        <section className="bg-gradient-to-r from-warning-50 to-warning-100 border-b border-warning-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-center gap-3 text-warning-800">
              <MapPin className="w-5 h-5 flex-shrink-0 text-warning-600" />
              <p className="text-sm font-medium">
                {t('region.help_activate')}
              </p>
              <Link
                to="/regions"
                className="inline-flex items-center gap-1 text-sm font-bold text-warning-900 hover:text-warning-700 transition-colors"
              >
                {t('region.select')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* Challenge Banner */}
        {activeChallenge && (
          <Link
            to="/challenge"
            className="block rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-5 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold font-cairo text-sm sm:text-base truncate">
                  {t('challenge.active_banner', 'Weekly Challenge!')}
                </p>
                <p className="text-white/80 text-xs sm:text-sm truncate">
                  {document.documentElement.lang === 'ar' ? activeChallenge.title_ar : activeChallenge.title_en}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 flex-shrink-0 rtl:rotate-180" />
            </div>
          </Link>
        )}

        {/* Trending Products */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-cairo">
                {t('home.trending')}
              </h2>
            </div>
            <Link
              to="/search"
              className="text-sm font-semibold text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 transition-colors"
            >
              {t('home.view_all')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>

          {loadingTrending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-3 skeleton w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {trendingProducts.map((product) => (
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
                  cheapestPrice={product.cheapest_price}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">{t('common.no_results')}</p>
            </div>
          )}
        </section>

        {/* Cheapest Stores */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-cairo">
                {t('home.cheapest_stores')}
              </h2>
            </div>
          </div>

          {!selectedRegion ? (
            <div className="card text-center py-10">
              <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">{t('region.select')}</p>
            </div>
          ) : loadingStores ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 skeleton w-2/3" />
                      <div className="h-3 skeleton w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cheapestStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {cheapestStores.map((store) => (
                <StoreCard
                  key={store.id}
                  id={store.id}
                  name={store.name}
                  addressAr={store.address_ar}
                  addressEn={store.address_en}
                  storeType={store.store_type}
                  verified={store.verified}
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-10">
              <Store className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">{t('store.no_stores')}</p>
            </div>
          )}
        </section>

        {/* Inflation Dashboard Link */}
        <section>
          <Link
            to="/inflation"
            className="block card-hover group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                <TrendingUp className="w-5 h-5 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 font-cairo">
                  {t('inflation.title', 'Price Trends')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('inflation.home_description', 'Track grocery price changes over time')}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0 rtl:rotate-180 transition-colors" />
            </div>
          </Link>
        </section>

        {/* Join CTA Section */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center" style={{ background: 'var(--theme-gradient)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 end-0 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute bottom-0 start-0 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          </div>

          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-cairo mb-3 text-balance">
              {t('home.join_cta')}
            </h2>
            <p className="text-white/75 mb-6 max-w-md mx-auto text-sm sm:text-base">
              {t('app.description')}
            </p>
            <Link to="/submit" className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold rounded-xl px-6 py-3 hover:bg-white/90 transition-all active:scale-[0.97] shadow-lg text-sm sm:text-base">
              <PlusCircle className="w-5 h-5" />
              {t('home.join_button')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
