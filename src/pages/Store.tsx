import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Store as StoreIcon, MapPin } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
import PriceCard from '../components/PriceCard';
import SEOHead from '../components/SEOHead';

interface StorePrice {
  id: string;
  product_id: string;
  price: number;
  upvotes: number;
  downvotes: number;
  location_note_ar: string | null;
  location_note_en: string | null;
  created_at: string;
  status: string;
  products?: {
    id: string;
    name_ar: string;
    name_en: string;
    brand_ar: string | null;
    brand_en: string | null;
    category_ar: string | null;
    category_en: string | null;
    unit_ar: string;
    unit_en: string;
    unit_size: string | null;
  };
  users?: {
    display_name: string | null;
    trust_points: number;
  };
}

interface StoreDetails {
  id: string;
  name: string;
  address_ar: string | null;
  address_en: string | null;
  location_description_ar: string | null;
  location_description_en: string | null;
  store_type: string;
  verified: boolean;
}

const storeTypeColors: Record<string, string> = {
  grocery: 'bg-primary-100 text-primary-700',
  supermarket: 'bg-secondary-100 text-secondary-700',
  hypermarket: 'bg-warning-100 text-warning-700',
  wholesale: 'bg-success-100 text-success-700',
  online: 'bg-primary-50 text-primary-600',
};

const storeTypeIcons: Record<string, string> = {
  grocery: '🏪',
  supermarket: '🛒',
  hypermarket: '🏬',
  wholesale: '📦',
  online: '🌐',
};

export default function Store() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [store, setStore] = useState<StoreDetails | null>(null);
  const [prices, setPrices] = useState<StorePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchStore() {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/stores/${id}`);
        setStore(data.store);
        setPrices(data.prices || []);
        setError(null);
      } catch {
        setError('Failed to load store');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStore();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="card animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl skeleton" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 skeleton w-2/3" />
              <div className="h-4 skeleton w-1/3" />
              <div className="h-3 skeleton w-1/2" />
            </div>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 skeleton w-1/3 mb-3" />
            <div className="space-y-2">
              <div className="h-5 skeleton w-24" />
              <div className="h-3 skeleton w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <StoreIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">{t('common.error')}</p>
        </div>
      </div>
    );
  }

  const address = isAr ? store.address_ar : store.address_en;
  const locationDescription = isAr
    ? store.location_description_ar
    : store.location_description_en;

  const grouped = prices.reduce<Record<string, StorePrice[]>>((acc, price) => {
    const product = price.products;
    const groupKey = product
      ? (isAr ? product.name_ar : product.name_en)
      : (isAr ? 'اخرى' : 'Other');

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(price);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <SEOHead title={store.name} description={isAr ? store.address_ar || '' : store.address_en || ''} />
      {/* Store Header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-surface-100 to-surface-200 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
            {storeTypeIcons[store.store_type] || '🏪'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {store.name}
              </h1>
              {store.verified && (
                <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
              )}
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'inline-block text-xs font-medium px-2.5 py-0.5 rounded-full',
                  storeTypeColors[store.store_type] || 'bg-gray-100 text-gray-600'
                )}
              >
                {t(`store.${store.store_type}`)}
              </span>
              {store.verified && (
                <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700">
                  {t('store.verified')}
                </span>
              )}
            </div>

            {address && (
              <div className="flex items-start gap-1.5 mt-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{address}</span>
              </div>
            )}

            {locationDescription && (
              <p className="text-xs text-gray-400 mt-1 ms-5.5">
                {locationDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Prices grouped by product */}
      {groupEntries.length > 0 ? (
        <div className="space-y-5">
          {groupEntries.map(([productName, groupPrices]) => {
            const firstProduct = groupPrices[0]?.products;

            return (
              <div key={productName}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <h2 className="text-base font-bold text-gray-800">
                    {productName}
                  </h2>
                  {firstProduct && (firstProduct.brand_ar || firstProduct.brand_en) && (
                    <span className="text-sm text-gray-400">
                      {isAr ? firstProduct.brand_ar : firstProduct.brand_en}
                    </span>
                  )}
                  {firstProduct && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {firstProduct.unit_size && `${firstProduct.unit_size} `}
                      {isAr ? firstProduct.unit_ar : firstProduct.unit_en}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {groupPrices.map((price) => {
                    const user = price.users;

                    return (
                      <PriceCard
                        key={price.id}
                        id={price.id}
                        price={price.price}
                        storeName={store.name}
                        userName={user?.display_name || ''}
                        userTrustPoints={user?.trust_points || 0}
                        locationNoteAr={price.location_note_ar}
                        locationNoteEn={price.location_note_en}
                        upvotes={price.upvotes}
                        downvotes={price.downvotes}
                        createdAt={price.created_at}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <StoreIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t('price.no_prices')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('price.add_first')}</p>
        </div>
      )}
    </div>
  );
}
