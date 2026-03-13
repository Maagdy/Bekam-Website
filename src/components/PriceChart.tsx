import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PriceEntry {
  price: number;
  created_at: string;
  stores?: Record<string, unknown>;
}

interface PriceChartProps {
  prices: PriceEntry[];
}

const COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export default function PriceChart({ prices }: PriceChartProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { chartData, storeNames } = useMemo(() => {
    if (prices.length === 0) return { chartData: [], storeNames: [] };

    // Group prices by date and store
    const storeSet = new Set<string>();
    const dateMap = new Map<string, Record<string, number>>();

    // Sort by date ascending
    const sorted = [...prices].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (const p of sorted) {
      const storeName = (p.stores?.name as string) || t('price.unknown_store');
      storeSet.add(storeName);

      const date = new Date(p.created_at).toLocaleDateString(
        isAr ? 'ar-EG' : 'en-US',
        { month: 'short', day: 'numeric' }
      );

      if (!dateMap.has(date)) {
        dateMap.set(date, {});
      }
      const entry = dateMap.get(date)!;
      // Keep the latest price per store per date
      entry[storeName] = p.price;
    }

    const names = Array.from(storeSet);
    const data = Array.from(dateMap.entries()).map(([date, storePrices]) => ({
      date,
      ...storePrices,
    }));

    return { chartData: data, storeNames: names };
  }, [prices, isAr, t]);

  if (chartData.length < 2) return null;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {t('price.chart_title')}
      </h3>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                fontSize: 12,
                direction: isAr ? 'rtl' : 'ltr',
              }}
              formatter={(value) => value != null ? [`${Number(value).toFixed(2)} ${t('price.egp')}`] : []}
            />
            {storeNames.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              />
            )}
            {storeNames.map((store, i) => (
              <Line
                key={store}
                type="monotone"
                dataKey={store}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
