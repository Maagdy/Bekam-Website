import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Package, Store, DollarSign, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
  { path: '/admin/products', icon: Package, labelKey: 'admin.products' },
  { path: '/admin/stores', icon: Store, labelKey: 'admin.stores' },
  { path: '/admin/prices', icon: DollarSign, labelKey: 'admin.prices' },
  { path: '/admin/regions', icon: MapPin, labelKey: 'admin.regions' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* Mobile top tabs */}
      <div className="md:hidden border-b border-gray-200 bg-white overflow-x-auto scrollbar-hide">
        <div className="flex px-2 py-2 gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[36px]',
                location.pathname === item.path
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <item.icon className="w-4 h-4" />
              {t(item.labelKey)}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-e border-gray-200 p-4 hidden md:block flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">{t('admin.dashboard')}</h2>
        <nav className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</div>
    </div>
  );
}
