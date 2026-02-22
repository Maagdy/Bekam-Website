import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, X, Check } from 'lucide-react';
import api from '../lib/api';

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  icon: string;
}

interface InlineAddProductProps {
  prefillName?: string;
  prefillBarcode?: string;
  prefillBrand?: string;
  onCreated: (product: {
    id: string;
    name_ar: string;
    name_en: string;
    brand_ar: string | null;
    brand_en: string | null;
    unit_ar: string;
    unit_en: string;
    unit_size: string | null;
  }) => void;
  onCancel: () => void;
}

export default function InlineAddProduct({ prefillName, prefillBarcode, prefillBrand, onCreated, onCancel }: InlineAddProductProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [nameAr, setNameAr] = useState(isAr && prefillName ? prefillName : '');
  const [nameEn, setNameEn] = useState(!isAr && prefillName ? prefillName : '');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState(prefillBrand || '');
  const [barcode, setBarcode] = useState(prefillBarcode || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => {
      setCategories(data.data || []);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim() || !categoryId) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/products', {
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
        category_id: categoryId,
        ...(brand.trim() && isAr ? { brand_ar: brand.trim() } : {}),
        ...(brand.trim() && !isAr ? { brand_en: brand.trim() } : {}),
        ...(barcode.trim() ? { barcode: barcode.trim() } : {}),
      });

      onCreated({
        id: data.data.id,
        name_ar: data.data.name_ar,
        name_en: data.data.name_en,
        brand_ar: data.data.brand_ar,
        brand_en: data.data.brand_en,
        unit_ar: data.data.unit_ar,
        unit_en: data.data.unit_en,
        unit_size: data.data.unit_size,
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
        <h4 className="text-sm font-semibold text-primary-700">{t('voice.add_product_title')}</h4>
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
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          placeholder={t('voice.product_name_ar')}
          className="input text-sm py-2"
          dir="rtl"
          required
        />
        <input
          type="text"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder={t('voice.product_name_en')}
          className="input text-sm py-2"
          dir="ltr"
          required
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input text-sm py-2"
          required
        >
          <option value="">{t('voice.select_category')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {isAr ? c.name_ar : c.name_en}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder={t('voice.brand')}
          className="input text-sm py-2"
        />
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder={t('barcode.barcode_field', 'Barcode (optional)')}
          className="input text-sm py-2"
          dir="ltr"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !nameAr.trim() || !nameEn.trim() || !categoryId}
        className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-1.5"
      >
        {loading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('voice.adding')}</>
        ) : (
          <><Check className="w-3.5 h-3.5" /> {t('voice.add_product')}</>
        )}
      </button>
    </form>
  );
}
