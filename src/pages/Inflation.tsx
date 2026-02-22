import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../lib/api';
import { useRegion } from '../hooks/useRegion';
import SEOHead from '../components/SEOHead';

interface TrendData {
  category_id: string;
  category_ar: string;
  category_en: string;
  period: string;
  avg_price: number;
  sample_size: number;
}

export default function Inflation() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { selectedRegion } = useRegion();

  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [days, selectedRegion]);

  async function fetchData() {
    setLoading(true);
    try {
      const params: any = { days };
      if (selectedRegion) params.region_id = selectedRegion.id;
      const { data: result } = await api.get('/products/inflation', { params });
      setData(result.data || []);
    } catch {} finally { setLoading(false); }
  }

  // Get unique categories
  const categories = Array.from(
    new Map(data.map(d => [d.category_id, { id: d.category_id, name: isAr ? d.category_ar : d.category_en }])).values()
  );

  // Filter by selected category
  const filtered = selectedCategory
    ? data.filter(d => d.category_id === selectedCategory)
    : data;

  // Transform for chart — group by period
  const chartData = Array.from(
    filtered.reduce((acc, item) => {
      const existing = acc.get(item.period) || { period: item.period };
      const catName = isAr ? item.category_ar : item.category_en;
      existing[catName] = item.avg_price;
      acc.set(item.period, existing);
      return acc;
    }, new Map<string, any>()).values()
  ).sort((a, b) => a.period.localeCompare(b.period));

  // Chart colors
  const COLORS = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#F4A261', '#264653', '#A8DADC', '#F28482', '#84A59D', '#F5CAC3'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SEOHead title={t('inflation.title', 'Price Trends')} description="Egyptian Grocery Inflation Tracker | متتبع تضخم أسعار البقالة" />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary-500" />
          {t('inflation.title', 'Price Trends')}
        </h1>
        <div className="flex gap-2">
          {[30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                days === d
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d}{t('inflation.days', 'd')}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
            !selectedCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {t('inflation.all_categories', 'All')}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">{t('inflation.no_data', 'Not enough data yet')}</p>
        </div>
      ) : (
        <div className="card">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {categories.slice(0, 10).map((cat, i) => (
                <Bar
                  key={cat.id}
                  dataKey={cat.name}
                  fill={COLORS[i % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
