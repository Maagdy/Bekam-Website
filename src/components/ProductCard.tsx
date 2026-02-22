import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, TrendingDown } from 'lucide-react';

interface ProductCardProps {
  id: string;
  nameAr: string;
  nameEn: string;
  brandAr?: string | null;
  brandEn?: string | null;
  imageUrl?: string | null;
  unitAr: string;
  unitEn: string;
  unitSize?: string | null;
  cheapestPrice?: number | null;
}

export default function ProductCard({
  id, nameAr, nameEn, brandAr, brandEn, imageUrl,
  unitAr, unitEn, unitSize, cheapestPrice,
}: ProductCardProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <Link to={`/product/${id}`} className="card-hover group block">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-gradient-to-br from-surface-100 to-surface-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={isAr ? nameAr : nameEn} className="w-14 h-14 object-contain" loading="lazy" />
          ) : (
            <Package className="w-8 h-8 text-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-500 transition-colors">
            {isAr ? nameAr : nameEn}
          </h3>
          {(brandAr || brandEn) && (
            <p className="text-sm text-gray-500 truncate">
              {isAr ? brandAr : brandEn}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {unitSize && `${unitSize} `}{isAr ? unitAr : unitEn}
          </p>
        </div>
        {cheapestPrice != null && (
          <div className="text-end flex-shrink-0">
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-success-500" />
              <p className="text-lg font-bold text-primary-500">
                {cheapestPrice.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-gray-400">{isAr ? 'ج.م' : 'EGP'}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
