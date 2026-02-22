import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { MapPin, Check, Clock } from 'lucide-react';

interface RegionProgressProps {
  nameAr: string;
  nameEn: string;
  active: boolean;
  priceCount: number;
  threshold: number;
}

export default function RegionProgress({ nameAr, nameEn, active, priceCount, threshold }: RegionProgressProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const progress = Math.min(100, Math.round((priceCount / threshold) * 100));
  const isInProgress = !active && priceCount > 0;

  return (
    <div className={cn(
      'card-hover',
      active && 'ring-2 ring-success-500/30 bg-success-50/30',
      isInProgress && 'ring-2 ring-warning-500/30 bg-warning-50/30'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            active ? 'bg-success-100 text-success-600' :
            isInProgress ? 'bg-warning-100 text-warning-600' :
            'bg-gray-100 text-gray-400'
          )}>
            {active ? <Check className="w-4 h-4" /> :
             isInProgress ? <Clock className="w-4 h-4" /> :
             <MapPin className="w-4 h-4" />}
          </div>
          <h3 className="font-semibold text-gray-900">{isAr ? nameAr : nameEn}</h3>
        </div>
        <span className={cn(
          'text-xs font-semibold px-2.5 py-1 rounded-full',
          active && 'bg-success-100 text-success-600',
          isInProgress && 'bg-warning-100 text-warning-600',
          !active && !isInProgress && 'bg-gray-100 text-gray-500'
        )}>
          {active ? t('region.active') : isInProgress ? t('region.in_progress') : t('region.coming_soon')}
        </span>
      </div>

      {!active && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-700 ease-out',
                isInProgress
                  ? 'bg-gradient-to-r from-warning-500 to-warning-600'
                  : 'bg-gray-300'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{priceCount}</span> / {threshold} {t('region.prices_needed')}
            </p>
            <p className="text-xs font-semibold text-gray-500">{progress}%</p>
          </div>
        </>
      )}

      {active && (
        <p className="text-sm text-success-600 font-medium">
          {priceCount} {t('store.prices_available')}
        </p>
      )}
    </div>
  );
}
