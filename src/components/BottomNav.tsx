import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, PlusCircle, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/search', icon: Search, labelKey: 'nav.search' },
  { path: '/submit', icon: PlusCircle, labelKey: 'nav.submit', requireAuth: true },
  { path: '/basket', icon: ShoppingCart, labelKey: 'basket.title', requireAuth: true },
  { path: '/profile', icon: User, labelKey: 'nav.profile', requireAuth: true },
];

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        if (item.requireAuth && !user) return null;
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn('bottom-nav-item', isActive && 'active')}
          >
            {item.path === '/submit' ? (
              <div className="w-10 h-10 -mt-4 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                <item.icon className="w-5 h-5" />
              </div>
            ) : (
              <item.icon className={cn('w-5 h-5', isActive && 'text-primary-500')} />
            )}
            <span className={cn('text-[10px]', isActive && 'text-primary-500 font-medium')}>
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
