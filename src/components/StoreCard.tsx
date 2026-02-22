import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface StoreCardProps {
  id: string;
  name: string;
  addressAr?: string | null;
  addressEn?: string | null;
  storeType: string;
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

export default function StoreCard({ id, name, addressAr, addressEn, storeType, verified }: StoreCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const address = isAr ? addressAr : addressEn;

  return (
    <Link to={`/store/${id}`} className="card-hover group block">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-surface-100 to-surface-200 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
          {storeTypeIcons[storeType] || '🏪'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-500 transition-colors">
              {name}
            </h3>
            {verified && (
              <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
            )}
          </div>
          {address && (
            <p className="text-sm text-gray-500 truncate mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {address}
            </p>
          )}
          <span className={cn(
            'inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1.5',
            storeTypeColors[storeType] || 'bg-gray-100 text-gray-600'
          )}>
            {t(`store.${storeType}`)}
          </span>
        </div>
      </div>
    </Link>
  );
}
