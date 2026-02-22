import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, X, Check } from 'lucide-react';
import { useRegion } from '../hooks/useRegion';
import api from '../lib/api';

interface InlineAddStoreProps {
  prefillName?: string;
  onCreated: (store: {
    id: string;
    name: string;
    address_ar: string | null;
    address_en: string | null;
  }) => void;
  onCancel: () => void;
}

export default function InlineAddStore({ prefillName, onCreated, onCancel }: InlineAddStoreProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { selectedRegion } = useRegion();

  const [name, setName] = useState(prefillName || '');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selectedRegion) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/stores', {
        name: name.trim(),
        region_id: selectedRegion.id,
        ...(address.trim() && isAr ? { address_ar: address.trim() } : {}),
        ...(address.trim() && !isAr ? { address_en: address.trim() } : {}),
      });

      onCreated({
        id: data.data.id,
        name: data.data.name,
        address_ar: data.data.address_ar,
        address_en: data.data.address_en,
      });
    } catch {
      setError(t('voice.add_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-primary-50/50 border border-primary-200 rounded-xl p-4 space-y-3 animate-scale-in">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-primary-700">{t('voice.add_store_title')}</h4>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-xs font-medium">{error}</p>
      )}

      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('voice.store_name')}
          className="input text-sm py-2"
          required
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('voice.store_address')}
          className="input text-sm py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim() || !selectedRegion}
        className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-1.5"
      >
        {loading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('voice.adding')}</>
        ) : (
          <><Check className="w-3.5 h-3.5" /> {t('voice.add_store')}</>
        )}
      </button>
    </form>
  );
}
