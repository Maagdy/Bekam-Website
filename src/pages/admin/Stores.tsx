import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, CheckCircle, Inbox } from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';

interface StoreItem {
  id: string;
  name: string;
  address_ar: string | null;
  address_en: string | null;
  store_type: string;
  verified: boolean;
  status: string;
  regions?: { name_ar: string; name_en: string };
  areas?: { name_ar: string; name_en: string };
}

const storeTypeIcons: Record<string, string> = {
  grocery: '🏪',
  supermarket: '🛒',
  hypermarket: '🏬',
  wholesale: '📦',
  online: '🌐',
};

export default function AdminStores() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [pendingStores, setPendingStores] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending'>('all');

  async function fetchStores() {
    setIsLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        api.get('/admin/stores'),
        api.get('/admin/stores/pending'),
      ]);
      setStores(allRes.data.data);
      setPendingStores(pendingRes.data.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchStores(); }, []);

  async function approveStore(id: string) {
    try {
      await api.post(`/admin/stores/${id}/approve`);
      fetchStores();
    } catch { /* ignore */ }
  }

  if (isLoading) {
    return (
      <div>
        <div className="h-8 skeleton w-40 mb-6" />
        <div className="flex gap-2 mb-6">
          <div className="h-10 skeleton w-24 rounded-xl" />
          <div className="h-10 skeleton w-28 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton w-2/3" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayStores = tab === 'pending' ? pendingStores : stores;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('admin.stores')}</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('all')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
            tab === 'all' ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {isAr ? 'الكل' : 'All'} ({stores.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
            tab === 'pending' ? 'bg-warning-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {t('admin.pending')} ({pendingStores.length})
        </button>
      </div>

      {displayStores.length === 0 ? (
        <div className="card text-center py-12">
          <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{t('common.no_results')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayStores.map(s => (
            <div key={s.id} className="card animate-fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-surface-100 to-surface-200 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                    {storeTypeIcons[s.store_type] || '🏪'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                      {s.verified && <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{isAr ? s.address_ar : s.address_en}</p>
                    {s.regions && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {isAr ? s.regions.name_ar : s.regions.name_en}
                        {s.areas && ` - ${isAr ? s.areas.name_ar : s.areas.name_en}`}
                      </p>
                    )}
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full mt-1.5">
                      {t(`store.${s.store_type}`)}
                    </span>
                  </div>
                </div>

                {s.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveStore(s.id)}
                      className="w-10 h-10 rounded-xl bg-success-50 text-success-600 hover:bg-success-100 flex items-center justify-center transition-all active:scale-95"
                      title={t('admin.approve')}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all active:scale-95"
                      title={t('admin.reject')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
