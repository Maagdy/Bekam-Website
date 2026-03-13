import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Plus, TrendingDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { useProductPrices, useVotePrice } from '../hooks/usePrices';
import { useRegion } from '../hooks/useRegion';
import PriceCard from '../components/PriceCard';
import CommentSection from '../components/CommentSection';
import PriceAlertButton from '../components/PriceAlertButton';
import TrustBadge from '../components/TrustBadge';
import SEOHead from '../components/SEOHead';
import PriceChart from '../components/PriceChart';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { selectedRegion } = useRegion();
  const { product, prices, isLoading, error, refetch } = useProductPrices(id, selectedRegion?.id);
  const { vote, isVoting } = useVotePrice();

  const cheapestPrice = prices.length > 0
    ? Math.min(...prices.map((p) => p.price))
    : null;

  async function handleVote(priceId: string, type: 'up' | 'down') {
    await vote(priceId, type);
    refetch();
  }

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="card animate-pulse">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl skeleton" />
            <div className="flex-1 space-y-3 py-2">
              <div className="h-5 skeleton w-3/4" />
              <div className="h-4 skeleton w-1/2" />
              <div className="h-3 skeleton w-1/3" />
            </div>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-6 skeleton w-24" />
                <div className="h-4 skeleton w-40" />
                <div className="h-3 skeleton w-32" />
              </div>
              <div className="space-y-2">
                <div className="w-14 h-10 skeleton rounded-xl" />
                <div className="w-14 h-10 skeleton rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">{t('common.error')}</p>
          <Link to="/" className="btn-primary text-sm">
            <BackIcon className="w-4 h-4" />
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  const nameAr = product.name_ar as string;
  const nameEn = product.name_en as string;
  const brandAr = product.brand_ar as string | null;
  const brandEn = product.brand_en as string | null;
  const unitAr = product.unit_ar as string;
  const unitEn = product.unit_en as string;
  const unitSize = product.unit_size as string | null;
  const imageUrl = product.image_url as string | null;

  const productName = isAr ? nameAr : nameEn;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <SEOHead
        title={productName}
        description={cheapestPrice ? t('product.cheapest_at', { price: cheapestPrice.toFixed(2) }) : ''}
      />
      {/* Product Header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-surface-100 to-surface-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={isAr ? nameAr : nameEn}
                className="w-16 h-16 object-contain"
                loading="lazy"
              />
            ) : (
              <Package className="w-10 h-10 text-gray-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">
              {isAr ? nameAr : nameEn}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isAr ? nameEn : nameAr}
            </p>
            {(brandAr || brandEn) && (
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {isAr ? brandAr : brandEn}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {unitSize && `${unitSize} `}{isAr ? unitAr : unitEn}
            </p>
          </div>
        </div>
      </div>

      {/* Cheapest Price Highlight */}
      {cheapestPrice != null && (
        <div className="bg-gradient-to-r from-success-50 to-success-100 border border-success-200/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 bg-success-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-success-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-success-700">
              {t('price.cheapest')}
            </p>
            <p className="text-2xl font-bold text-success-600">
              {cheapestPrice.toFixed(2)} <span className="text-sm font-medium">{t('price.egp')}</span>
            </p>
          </div>
        </div>
      )}

      {/* Price Chart */}
      <PriceChart prices={prices} />

      {/* Price Alert */}
      {id && <PriceAlertButton productId={id} />}

      {/* Price List */}
      <div>
        {prices.length > 0 ? (
          <div className="space-y-3">
            {prices.map((price) => {
              const store = price.stores as Record<string, unknown> | undefined;
              const user = price.users as Record<string, unknown> | undefined;

              return (
                <div key={price.id} className="space-y-2">
                  <PriceCard
                    id={price.id}
                    price={price.price}
                    storeName={(store?.name as string) || ''}
                    userName={(user?.display_name as string) || ''}
                    userTrustPoints={(user?.trust_points as number) || 0}
                    locationNoteAr={price.location_note_ar}
                    locationNoteEn={price.location_note_en}
                    upvotes={price.upvotes}
                    downvotes={price.downvotes}
                    createdAt={price.created_at}
                    onVote={handleVote}
                    isVoting={isVoting}
                  />
                  {user && <div className="flex items-center gap-2 px-2">
                    <TrustBadge points={(user?.trust_points as number) || 0} size="sm" />
                  </div>}
                  <CommentSection priceId={price.id} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('price.no_prices')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('price.add_first')}</p>
          </div>
        )}
      </div>

      {/* Add Price CTA */}
      <div className="sticky bottom-20 md:bottom-4 z-10">
        <Link
          to="/submit"
          className="flex items-center justify-center gap-2 w-full py-3.5 px-6
                     text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all
                     min-h-[48px] active:scale-[0.97]"
          style={{ background: 'var(--theme-gradient)' }}
        >
          <Plus className="w-5 h-5" />
          {t('nav.submit')}
        </Link>
      </div>
    </div>
  );
}
