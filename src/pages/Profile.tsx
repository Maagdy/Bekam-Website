import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User, LogOut, Award, BarChart3, CheckCircle2, Star, Shield, Bell, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRegion } from '../hooks/useRegion';
import TrustBadge from '../components/TrustBadge';
import { cn } from '../lib/utils';
import api from '../lib/api';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, signOut, updateProfile, isAdmin } = useAuth();
  const { regions } = useRegion();
  const isAr = i18n.language === 'ar';

  const [name, setName] = useState(user?.display_name || '');
  const [lang, setLang] = useState(user?.preferred_lang || 'ar');
  const [regionId, setRegionId] = useState(user?.region_id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/alerts').then(({ data }) => setAlerts(data.data || [])).catch(() => {});
  }, []);

  async function deleteAlert(id: string) {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch {}
  }

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        display_name: name || undefined,
        preferred_lang: lang as 'ar' | 'en',
        region_id: regionId || undefined,
      } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    finally { setIsSaving(false); }
  }

  if (!user) return null;

  const stats = [
    { icon: Star, label: t('profile.trust_points'), value: user.trust_points, color: 'text-primary-500 bg-primary-50' },
    { icon: BarChart3, label: t('profile.total_reports'), value: user.total_reports, color: 'text-secondary-500 bg-secondary-50' },
    { icon: CheckCircle2, label: t('profile.accepted_reports'), value: user.accepted_reports, color: 'text-success-500 bg-success-50' },
  ];

  return (
    <div className="max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20" style={{ background: 'var(--theme-gradient)' }}>
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{user.display_name || t('profile.title')}</h1>
        <div className="mt-2">
          <TrustBadge points={user.trust_points} size="lg" showProgress />
        </div>
      </div>

      {/* Trust Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="card text-center">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2', stat.color)}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary-500" />
          {t('profile.title')}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            {t('profile.display_name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input"
            placeholder={t('profile.display_name')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            {t('profile.language')}
          </label>
          <select value={lang} onChange={e => setLang(e.target.value as 'ar' | 'en')} className="input">
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            {t('profile.region')}
          </label>
          <select value={regionId} onChange={e => setRegionId(e.target.value)} className="input">
            <option value="">{t('region.select')}</option>
            {regions.map(r => (
              <option key={r.id} value={r.id}>
                {isAr ? r.name_ar : r.name_en} {r.active ? '' : `(${t('region.coming_soon')})`}
              </option>
            ))}
          </select>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 text-success-600 text-sm font-medium animate-scale-in">
            <CheckCircle2 className="w-4 h-4" />
            {t('profile.saved')}
          </div>
        )}

        <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full">
          {isSaving ? t('common.loading') : t('profile.save')}
        </button>
      </div>

      {/* My Alerts */}
      {alerts.length > 0 && (
        <div className="card space-y-3 mt-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-warning-500" />
            {t('alerts.my_alerts', 'My Alerts')}
          </h2>
          {alerts.map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isAr ? alert.products?.name_ar : alert.products?.name_en}
                </p>
                <p className="text-xs text-gray-400">
                  {t('alerts.target_price')}: {Number(alert.target_price).toFixed(2)} {t('price.egp')}
                </p>
              </div>
              <button onClick={() => deleteAlert(alert.id)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Admin Panel Link */}
      {isAdmin && (
        <Link
          to="/admin"
          className="btn-ghost w-full mt-4 text-primary-600 hover:bg-primary-50 flex items-center justify-center gap-2 font-medium"
        >
          <Shield className="w-4 h-4" />
          {t('nav.admin')}
        </Link>
      )}

      {/* Logout */}
      <button
        onClick={signOut}
        className="btn-ghost w-full mt-4 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        {t('nav.logout')}
      </button>
    </div>
  );
}
