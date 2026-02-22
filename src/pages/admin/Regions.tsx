import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import api from '../../lib/api';
import RegionProgress from '../../components/RegionProgress';
import { cn } from '../../lib/utils';

interface Region {
  id: string;
  name_ar: string;
  name_en: string;
  active: boolean;
  price_count: number;
  user_count: number;
  auto_activate_threshold: number;
}

export default function AdminRegions() {
  const { t } = useTranslation();
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingThreshold, setEditingThreshold] = useState<string | null>(null);
  const [thresholdValue, setThresholdValue] = useState('');

  async function fetchRegions() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/regions');
      setRegions(data.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchRegions(); }, []);

  async function toggleActive(region: Region) {
    try {
      await api.put(`/admin/regions/${region.id}`, { active: !region.active });
      fetchRegions();
    } catch { /* ignore */ }
  }

  async function saveThreshold(regionId: string) {
    try {
      await api.put(`/admin/regions/${regionId}/threshold`, { threshold: Number(thresholdValue) });
      setEditingThreshold(null);
      fetchRegions();
    } catch { /* ignore */ }
  }

  if (isLoading) {
    return (
      <div>
        <div className="h-8 skeleton w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg skeleton" />
                <div className="h-5 skeleton w-24" />
              </div>
              <div className="h-2 skeleton rounded-full" />
              <div className="flex gap-2">
                <div className="h-8 skeleton flex-1 rounded-lg" />
                <div className="h-8 skeleton flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
          <Globe className="w-5 h-5 text-primary-500" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.regions')}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {regions.map(r => (
          <div key={r.id} className="space-y-2">
            <RegionProgress
              nameAr={r.name_ar}
              nameEn={r.name_en}
              active={r.active}
              priceCount={r.price_count}
              threshold={r.auto_activate_threshold}
            />
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(r)}
                className={cn(
                  'btn text-xs flex-1 rounded-xl',
                  r.active
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-success-50 text-success-600 hover:bg-success-100'
                )}
              >
                {r.active ? t('admin.deactivate') : t('admin.activate')}
              </button>

              {editingThreshold === r.id ? (
                <div className="flex gap-1 flex-1">
                  <input
                    type="number"
                    value={thresholdValue}
                    onChange={e => setThresholdValue(e.target.value)}
                    className="input text-xs py-1 flex-1 min-w-0"
                    min="1"
                    dir="ltr"
                    autoFocus
                  />
                  <button onClick={() => saveThreshold(r.id)} className="btn-primary text-xs px-3 rounded-xl">
                    {t('admin.save')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingThreshold(r.id);
                    setThresholdValue(String(r.auto_activate_threshold));
                  }}
                  className="btn bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs flex-1 rounded-xl"
                >
                  {t('admin.threshold')}: {r.auto_activate_threshold}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
