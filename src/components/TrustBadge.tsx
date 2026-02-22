import { useTranslation } from 'react-i18next';
import { getTrustLevel } from '../lib/utils';

const TRUST_LEVELS = [
  { min: 0, next: 50 },
  { min: 50, next: 150 },
  { min: 150, next: 500 },
  { min: 500, next: 1000 },
  { min: 1000, next: null },
];

interface TrustBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function TrustBadge({ points, size = 'sm', showProgress = false }: TrustBadgeProps) {
  const { t, i18n } = useTranslation();
  const level = getTrustLevel(points);
  const isAr = i18n.language === 'ar';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-medium',
  };

  // Find current level range for progress bar
  const currentLevel = TRUST_LEVELS.find(l => points >= l.min && (l.next === null || points < l.next));
  const progress = currentLevel?.next
    ? ((points - currentLevel.min) / (currentLevel.next - currentLevel.min)) * 100
    : 100;

  return (
    <div className="inline-flex flex-col">
      <span className={`inline-flex items-center gap-1 text-gray-600 ${sizeClasses[size]}`} title={`${points} pts`}>
        <span>{level.emoji}</span>
        <span>{isAr ? level.name_ar : level.name_en}</span>
      </span>
      {showProgress && currentLevel?.next && (
        <div className="mt-1">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {currentLevel.next - points} {t('trust.next_level', 'to next level')}
          </p>
        </div>
      )}
    </div>
  );
}
