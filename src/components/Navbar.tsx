import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Search, User, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import RegionSelector from './RegionSelector';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  return (
    <>
      <nav className="glass sticky top-0 z-50 border-b border-gray-200/50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold gradient-text font-cairo">
                {t('app.name')}
              </span>
            </Link>

            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('home.search_placeholder')}
                  className="input ps-10 bg-surface-100 border-transparent focus:bg-white focus:border-primary-500"
                />
              </div>
            </form>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <RegionSelector />
              <ThemeSwitcher />
              <LanguageSwitcher />

              {user ? (
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <Link to="/admin" className="btn-ghost p-2" title={t('nav.admin')}>
                      <Shield className="w-5 h-5" />
                    </Link>
                  )}
                  <Link to="/submit" className="btn-primary text-sm ms-2">
                    {t('nav.submit')}
                  </Link>
                  <Link to="/profile" className="btn-ghost p-2" title={t('nav.profile')}>
                    <User className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="btn-primary text-sm ms-2">
                  {t('nav.login')}
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-1">
              <ThemeSwitcher />
              <LanguageSwitcher />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn-ghost p-2"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-3 animate-slide-down">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('home.search_placeholder')}
                  className="input ps-10"
                />
              </div>
            </form>

            <RegionSelector />

            <div className="space-y-1">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2.5 rounded-xl hover:bg-gray-50 font-medium" onClick={() => setMobileOpen(false)}>
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="block w-full text-start px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="btn-primary w-full"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
