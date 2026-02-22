import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useRegion } from '../hooks/useRegion';

interface PriceAlertButtonProps {
  productId: string;
}

export default function PriceAlertButton({ productId }: PriceAlertButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { selectedRegion } = useRegion();
  const [showInput, setShowInput] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user || !selectedRegion) return null;

  async function handleCreate() {
    if (!targetPrice || Number(targetPrice) <= 0) return;
    setLoading(true);
    try {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      await api.post('/alerts', {
        product_id: productId,
        region_id: selectedRegion!.id,
        target_price: Number(targetPrice),
      });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowInput(false); setTargetPrice(''); }, 2000);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-sm text-success-600 font-medium flex items-center gap-1">
        <Bell className="w-4 h-4" />
        {t('alerts.created', 'Alert set!')}
      </div>
    );
  }

  if (showInput) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder={t('alerts.target_price', 'Target price')}
          className="input text-sm py-1.5 w-28"
          dir="ltr"
          min="0.01"
          step="0.01"
        />
        <button
          onClick={handleCreate}
          disabled={loading || !targetPrice}
          className="btn-primary text-xs px-3 py-1.5"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : t('common.save')}
        </button>
        <button onClick={() => setShowInput(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium"
    >
      <Bell className="w-3.5 h-3.5" />
      {t('alerts.set_alert', 'Alert me when price drops')}
    </button>
  );
}
