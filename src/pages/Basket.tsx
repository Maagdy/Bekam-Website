import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Plus, Trash2, Calculator, Search, Loader2, X } from 'lucide-react';
import api from '../lib/api';
import { useRegion } from '../hooks/useRegion';

interface BasketItem {
  id: string;
  name: string;
  product_ids: string[];
  created_at: string;
}

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
}

interface StoreResult {
  store_id: string;
  store_name: string;
  total: number;
  products_found: number;
  products_total: number;
}

export default function Basket() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { selectedRegion } = useRegion();

  const [baskets, setBaskets] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [creating, setCreating] = useState(false);
  const [calculating, setCalculating] = useState<string | null>(null);
  const [calcResults, setCalcResults] = useState<StoreResult[] | null>(null);

  useEffect(() => {
    fetchBaskets();
  }, []);

  useEffect(() => {
    if (!productSearch.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get('/products/search', { params: { q: productSearch, limit: 5 } });
        setSearchResults(data.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timeout);
  }, [productSearch]);

  async function fetchBaskets() {
    try {
      const { data } = await api.get('/baskets');
      setBaskets(data.data || []);
    } catch {} finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!newName.trim() || selectedProducts.length === 0) return;
    setCreating(true);
    try {
      await api.post('/baskets', {
        name: newName.trim(),
        product_ids: selectedProducts.map(p => p.id),
      });
      setShowCreate(false);
      setNewName('');
      setSelectedProducts([]);
      fetchBaskets();
    } catch {} finally { setCreating(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/baskets/${id}`);
      setBaskets(baskets.filter(b => b.id !== id));
    } catch {}
  }

  async function handleCalculate(basket: BasketItem) {
    setCalculating(basket.id);
    setCalcResults(null);
    try {
      const params: any = {};
      if (selectedRegion) params.region_id = selectedRegion.id;
      const { data } = await api.get(`/baskets/${basket.id}/calculate`, { params });
      setCalcResults(data.data?.stores || []);
    } catch {} finally { setCalculating(null); }
  }

  function addProduct(product: Product) {
    if (selectedProducts.some(p => p.id === product.id)) return;
    setSelectedProducts([...selectedProducts, product]);
    setProductSearch('');
    setSearchResults([]);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary-500" />
          {t('basket.title', 'My Baskets')}
        </h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" />
          {t('basket.create', 'New Basket')}
        </button>
      </div>

      {showCreate && (
        <div className="card space-y-3 border-2 border-primary-200">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('basket.name_placeholder', 'Basket name (e.g. Weekly groceries)')}
            className="input"
          />

          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder={t('basket.search_products', 'Search products to add...')}
              className="input ps-9 text-sm"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {searchResults.map(p => (
                <button key={p.id} onClick={() => addProduct(p)}
                  className="w-full text-start text-sm p-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Plus className="w-3 h-3 text-primary-500" />
                  {isAr ? p.name_ar : p.name_en}
                </button>
              ))}
            </div>
          )}

          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map(p => (
                <span key={p.id} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">
                  {isAr ? p.name_ar : p.name_en}
                  <button onClick={() => setSelectedProducts(selectedProducts.filter(sp => sp.id !== p.id))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim() || selectedProducts.length === 0}
            className="btn-primary w-full"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : t('basket.create', 'New Basket')}
          </button>
        </div>
      )}

      {baskets.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">{t('basket.empty', 'No baskets yet. Create one to compare store prices!')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {baskets.map(basket => (
            <div key={basket.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{basket.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCalculate(basket)}
                    disabled={calculating === basket.id}
                    className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                  >
                    {calculating === basket.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Calculator className="w-3 h-3" />}
                    {t('basket.calculate', 'Calculate')}
                  </button>
                  <button onClick={() => handleDelete(basket.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {basket.product_ids.length} {t('basket.items', 'items')}
              </p>

              {calcResults && calculating === null && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-700">{t('basket.cheapest_stores', 'Cheapest Stores')}</h4>
                  {calcResults.length === 0 ? (
                    <p className="text-xs text-gray-400">{t('basket.no_results', 'No prices found for this basket')}</p>
                  ) : (
                    calcResults.slice(0, 5).map((store, i) => (
                      <div key={store.store_id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          <span className="font-medium">{i + 1}.</span> {store.store_name}
                          <span className="text-xs text-gray-400 ms-1">({store.products_found}/{store.products_total})</span>
                        </span>
                        <span className="font-bold text-primary-600">{store.total.toFixed(2)} {t('price.egp')}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
