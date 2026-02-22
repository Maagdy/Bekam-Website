import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, X, Package } from 'lucide-react';
import api from '../../lib/api';

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  brand_ar: string | null;
  brand_en: string | null;
  category_id: string;
  unit_ar: string;
  unit_en: string;
  unit_size: string | null;
  active: boolean;
  categories?: { name_ar: string; name_en: string; icon: string };
}

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  icon: string;
}

export default function AdminProducts() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name_ar: '', name_en: '', brand_ar: '', brand_en: '',
    category_id: '', unit_ar: 'قطعة', unit_en: 'piece', unit_size: '',
  });

  async function fetchAll() {
    setIsLoading(true);
    try {
      const [productsRes, catsRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/products/categories'),
      ]);
      setProducts(productsRes.data.data);
      setCategories(catsRes.data.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchAll(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name_ar: '', name_en: '', brand_ar: '', brand_en: '', category_id: categories[0]?.id || '', unit_ar: 'قطعة', unit_en: 'piece', unit_size: '' });
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name_ar: p.name_ar, name_en: p.name_en,
      brand_ar: p.brand_ar || '', brand_en: p.brand_en || '',
      category_id: p.category_id,
      unit_ar: p.unit_ar, unit_en: p.unit_en, unit_size: p.unit_size || '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    try {
      const body = {
        ...form,
        brand_ar: form.brand_ar || undefined,
        brand_en: form.brand_en || undefined,
        unit_size: form.unit_size || undefined,
      };

      if (editing) {
        await api.put(`/admin/products/${editing.id}`, body);
      } else {
        await api.post('/admin/products', body);
      }
      setShowModal(false);
      fetchAll();
    } catch { /* ignore */ }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/admin/products/${id}`);
      fetchAll();
    } catch { /* ignore */ }
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 skeleton w-40" />
          <div className="h-10 skeleton w-28 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-4 skeleton flex-1" />
                <div className="h-4 skeleton w-20" />
                <div className="h-4 skeleton w-24" />
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.products')}</h1>
        <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> {t('admin.add_new')}
        </button>
      </div>

      {/* Mobile: Card layout / Desktop: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-start">
              <th className="py-3 px-3 font-semibold text-gray-500 text-xs uppercase">{isAr ? 'الاسم' : 'Name'}</th>
              <th className="py-3 px-3 font-semibold text-gray-500 text-xs uppercase">{isAr ? 'الماركة' : 'Brand'}</th>
              <th className="py-3 px-3 font-semibold text-gray-500 text-xs uppercase">{isAr ? 'التصنيف' : 'Category'}</th>
              <th className="py-3 px-3 font-semibold text-gray-500 text-xs uppercase">{isAr ? 'الوحدة' : 'Unit'}</th>
              <th className="py-3 px-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-surface-50 transition-colors">
                <td className="py-3 px-3">
                  <p className="font-semibold text-gray-900">{isAr ? p.name_ar : p.name_en}</p>
                  <p className="text-xs text-gray-400">{isAr ? p.name_en : p.name_ar}</p>
                </td>
                <td className="py-3 px-3 text-gray-600">{isAr ? p.brand_ar : p.brand_en}</td>
                <td className="py-3 px-3">
                  {p.categories && (
                    <span className="text-sm">{p.categories.icon} {isAr ? p.categories.name_ar : p.categories.name_en}</span>
                  )}
                </td>
                <td className="py-3 px-3 text-gray-600 text-sm">{p.unit_size} {isAr ? p.unit_ar : p.unit_en}</td>
                <td className="py-3 px-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="btn-ghost p-2 rounded-lg" title={t('admin.edit')}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn-ghost p-2 rounded-lg text-red-500" title={t('admin.delete')}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="sm:hidden space-y-3">
        {products.map(p => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{isAr ? p.name_ar : p.name_en}</p>
                <p className="text-xs text-gray-400 truncate">{isAr ? p.name_en : p.name_ar}</p>
                {p.categories && (
                  <p className="text-xs text-gray-500 mt-1">{p.categories.icon} {isAr ? p.categories.name_ar : p.categories.name_en}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{p.unit_size} {isAr ? p.unit_ar : p.unit_en}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0 ms-2">
                <button onClick={() => openEdit(p)} className="btn-ghost p-2 rounded-lg" title={t('admin.edit')}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="btn-ghost p-2 rounded-lg text-red-500" title={t('admin.delete')}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="card text-center py-12">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">{t('common.no_results')}</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editing ? t('admin.edit') : t('admin.add_new')}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className="input" placeholder="الاسم بالعربي" />
              <input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} className="input" placeholder="Name in English" dir="ltr" />
              <input value={form.brand_ar} onChange={e => setForm({ ...form, brand_ar: e.target.value })} className="input" placeholder="الماركة بالعربي" />
              <input value={form.brand_en} onChange={e => setForm({ ...form, brand_en: e.target.value })} className="input" placeholder="Brand in English" dir="ltr" />
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input">
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {isAr ? c.name_ar : c.name_en}</option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <input value={form.unit_ar} onChange={e => setForm({ ...form, unit_ar: e.target.value })} className="input" placeholder="وحدة" />
                <input value={form.unit_en} onChange={e => setForm({ ...form, unit_en: e.target.value })} className="input" placeholder="Unit" dir="ltr" />
                <input value={form.unit_size} onChange={e => setForm({ ...form, unit_size: e.target.value })} className="input" placeholder="Size" dir="ltr" />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleSave} className="btn-primary flex-1">{t('admin.save')}</button>
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
