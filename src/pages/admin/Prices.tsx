import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, AlertTriangle, Inbox } from 'lucide-react';
import api from '../../lib/api';
import { formatPrice, timeAgo } from '../../lib/utils';

interface PendingPrice {
  id: string;
  price: number;
  status: string;
  created_at: string;
  image_url: string | null;
  products: { name_ar: string; name_en: string };
  stores: { name: string; address_ar: string };
  users: { display_name: string; trust_points: number };
}

export default function AdminPrices() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [prices, setPrices] = useState<PendingPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchPrices() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/prices/pending');
      setPrices(data.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchPrices(); }, []);

  async function approve(id: string) {
    try {
      await api.post(`/admin/prices/${id}/approve`);
      setPrices(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  }

  async function reject(id: string) {
    try {
      await api.delete(`/admin/prices/${id}`);
      setPrices(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  }

  if (isLoading) {
    return (
      <div>
        <div className="h-8 skeleton w-64 mb-6" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-5 skeleton w-20" />
                  <div className="h-4 skeleton w-40" />
                  <div className="h-3 skeleton w-32" />
                </div>
                <div className="flex gap-2 ms-4">
                  <div className="w-10 h-10 skeleton rounded-xl" />
                  <div className="w-10 h-10 skeleton rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t('admin.prices')} - {t('admin.pending')}
        </h1>
        <span className="bg-warning-500 text-white text-sm font-bold px-3.5 py-1 rounded-full">
          {prices.length}
        </span>
      </div>

      {prices.length === 0 ? (
        <div className="card text-center py-12">
          <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{t('common.no_results')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prices.map(p => (
            <div key={p.id} className="card animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-lg font-bold gradient-text">{formatPrice(p.price)}</span>
                    {p.status === 'flagged' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-warning-600 bg-warning-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> {t('price.flagged')}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 truncate">
                    {isAr ? p.products.name_ar : p.products.name_en}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{p.stores.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {p.users.display_name || 'Anonymous'} - {timeAgo(p.created_at, i18n.language)}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => approve(p.id)}
                    className="w-10 h-10 rounded-xl bg-success-50 text-success-600 hover:bg-success-100 flex items-center justify-center transition-all active:scale-95"
                    title={t('admin.approve')}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => reject(p.id)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all active:scale-95"
                    title={t('admin.reject')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
