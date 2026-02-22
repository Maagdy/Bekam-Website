import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export default function InstallPrompt() {
  const { i18n } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isAr = i18n.language === 'ar';

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) {
        return;
      }
      localStorage.removeItem(DISMISS_KEY);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowBanner(false);
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }, 300);
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`
        fixed bottom-16 md:bottom-4 left-4 right-4 z-50
        max-w-md mx-auto
        bg-white rounded-2xl shadow-2xl
        border border-gray-100 p-4
        transition-all duration-300 ease-out
        ${isAnimating
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'
        }
      `}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 end-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label={isAr ? 'إغلاق' : 'Close'}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
          <Download className="w-6 h-6 text-primary-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {isAr ? 'تثبيت التطبيق' : 'Install App'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isAr
              ? 'أضف بكام إلى شاشتك الرئيسية للوصول السريع'
              : 'Add Bekam to your home screen for quick access'}
          </p>
        </div>

        <button
          onClick={handleInstall}
          className="btn-primary flex-shrink-0 px-4 py-2 text-sm min-h-0"
        >
          {isAr ? 'تثبيت' : 'Install'}
        </button>
      </div>
    </div>
  );
}
