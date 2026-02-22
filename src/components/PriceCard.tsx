import { useTranslation } from 'react-i18next';
import { ThumbsUp, ThumbsDown, MapPin, Clock } from 'lucide-react';
import { timeAgo } from '../lib/utils';
import TrustBadge from './TrustBadge';

interface PriceCardProps {
  id: string;
  price: number;
  storeName: string;
  userName: string;
  userTrustPoints: number;
  locationNoteAr?: string | null;
  locationNoteEn?: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  onVote?: (priceId: string, type: 'up' | 'down') => void;
  isVoting?: boolean;
}

export default function PriceCard({
  id, price, storeName, userName, userTrustPoints,
  locationNoteAr, locationNoteEn, upvotes, downvotes,
  createdAt, onVote, isVoting,
}: PriceCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const locationNote = isAr ? locationNoteAr : locationNoteEn;

  return (
    <div className="card-hover animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold gradient-text">
              {price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 font-medium">{t('price.egp')}</span>
          </div>

          <p className="text-sm text-gray-600">
            {t('price.at_store')} <span className="font-semibold text-gray-800">{storeName}</span>
          </p>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              {t('price.submitted_by')} {userName || (isAr ? 'مجهول' : 'Anonymous')}
            </span>
            <TrustBadge points={userTrustPoints} />
          </div>

          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {timeAgo(createdAt, i18n.language)}
          </div>

          {locationNote && (
            <div className="flex items-start gap-1.5 mt-2.5 text-xs text-secondary-700 bg-secondary-50 rounded-xl p-2.5">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{locationNote}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5 ms-4">
          <button
            onClick={() => onVote?.(id, 'up')}
            disabled={isVoting}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium
                       text-success-600 bg-success-50 hover:bg-success-100 transition-all
                       disabled:opacity-50 min-w-[52px] min-h-[44px] justify-center
                       active:scale-95"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{upvotes}</span>
          </button>
          <button
            onClick={() => onVote?.(id, 'down')}
            disabled={isVoting}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium
                       text-red-600 bg-red-50 hover:bg-red-100 transition-all
                       disabled:opacity-50 min-w-[52px] min-h-[44px] justify-center
                       active:scale-95"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{downvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
