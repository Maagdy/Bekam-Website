import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Bell, Check } from 'lucide-react';
import { useRegion } from '../hooks/useRegion';
import RegionProgress from '../components/RegionProgress';
import api from '../lib/api';

export default function Regions() {
  const { t } = useTranslation();
  const { regions } = useRegion();
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistRegion, setWaitlistRegion] = useState<string | null>(null);
  const [waitlistDone, setWaitlistDone] = useState<Set<string>>(new Set());
  const [isJoining, setIsJoining] = useState(false);

  async function joinWaitlist(regionId: string) {
    setIsJoining(true);
    try {
      await api.post(`/regions/${regionId}/waitlist`, {
        phone: waitlistPhone || undefined,
      });
      setWaitlistDone(prev => new Set(prev).add(regionId));
      setWaitlistRegion(null);
      setWaitlistPhone('');
    } catch { /* ignore */ }
    finally { setIsJoining(false); }
  }

  const activeRegions = regions.filter(r => r.active);
  const inactiveRegions = regions.filter(r => !r.active);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20" style={{ background: 'var(--theme-gradient)' }}>
          <Globe className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-cairo">{t('nav.regions')}</h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm sm:text-base">{t('region.help_activate')}</p>
      </div>

      {/* Active Regions */}
      {activeRegions.length > 0 && (
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-success-500 animate-pulse" />
            <h2 className="text-lg font-bold text-gray-900">
              {t('region.active')}
            </h2>
            <span className="text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-0.5 rounded-full">
              {activeRegions.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {activeRegions.map(r => (
              <RegionProgress
                key={r.id}
                nameAr={r.name_ar}
                nameEn={r.name_en}
                active={r.active}
                priceCount={r.price_count}
                threshold={r.auto_activate_threshold}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Regions */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <h2 className="text-lg font-bold text-gray-900">
            {t('region.coming_soon')}
          </h2>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
            {inactiveRegions.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {inactiveRegions.map(r => (
            <div key={r.id} className="space-y-2">
              <RegionProgress
                nameAr={r.name_ar}
                nameEn={r.name_en}
                active={r.active}
                priceCount={r.price_count}
                threshold={r.auto_activate_threshold}
              />
              <div>
                {waitlistDone.has(r.id) ? (
                  <div className="flex items-center gap-1.5 text-sm text-success-600 font-medium px-1">
                    <Check className="w-4 h-4" />
                    {t('region.waitlist_joined')}
                  </div>
                ) : waitlistRegion === r.id ? (
                  <div className="flex gap-2 animate-fade-in">
                    <input
                      type="tel"
                      value={waitlistPhone}
                      onChange={e => setWaitlistPhone(e.target.value)}
                      placeholder={t('auth.phone_placeholder')}
                      className="input text-sm flex-1"
                      dir="ltr"
                      autoFocus
                    />
                    <button
                      onClick={() => joinWaitlist(r.id)}
                      disabled={isJoining}
                      className="btn-primary text-sm px-4"
                    >
                      {isJoining ? '...' : t('common.save')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setWaitlistRegion(r.id)}
                    className="btn-outline text-sm w-full flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {t('region.join_waitlist')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
