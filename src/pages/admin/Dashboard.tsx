import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Store, DollarSign, Users, TrendingUp } from 'lucide-react';

import api from '../../lib/api';
import { cn } from '../../lib/utils';

interface Stats {
  products: number;
  stores: number;
  prices: number;
  users: number;
  today_submissions: number;
}

const statConfig = [
  { key: 'products', icon: Package, color: 'text-primary-600 bg-primary-50', accent: 'border-primary-200' },
  { key: 'stores', icon: Store, color: 'text-secondary-600 bg-secondary-50', accent: 'border-secondary-200' },
  { key: 'prices', icon: DollarSign, color: 'text-success-600 bg-success-50', accent: 'border-success-200' },
  { key: 'users', icon: Users, color: 'text-warning-600 bg-warning-50', accent: 'border-warning-200' },
  { key: 'today', icon: TrendingUp, color: 'text-primary-500 bg-primary-100', accent: 'border-primary-300' },
] as const;

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="h-8 skeleton w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="space-y-2">
                  <div className="h-6 skeleton w-12" />
                  <div className="h-3 skeleton w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statValues: Record<string, number> = {
    products: stats.products,
    stores: stats.stores,
    prices: stats.prices,
    users: stats.users,
    today: stats.today_submissions,
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statConfig.map((cfg) => {
          const Icon = cfg.icon;
          return (
            <div key={cfg.key} className={cn('card border-s-4', cfg.accent)}>
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', cfg.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{statValues[cfg.key]}</p>
                  <p className="text-xs text-gray-500 font-medium">{t(`admin.stats.${cfg.key}`)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
