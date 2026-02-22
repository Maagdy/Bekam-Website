import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Palette, X, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

export default function ThemeSwitcher() {
  const { i18n } = useTranslation();
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const isAr = i18n.language === 'ar';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost p-2 relative"
        title={isAr ? 'تغيير اللون' : 'Change theme'}
      >
        <Palette className="w-5 h-5" />
        <span
          className="absolute bottom-1 end-1 w-2.5 h-2.5 rounded-full border-2 border-white"
          style={{ backgroundColor: themes.find(t => t.id === theme)?.color }}
        />
      </button>

      {/* Portal to body so it escapes navbar stacking context */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isAr ? 'اختر ثيم' : 'Choose Theme'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isAr ? 'اختر لون التطبيق المفضل لك' : 'Pick your favorite app color'}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme grid */}
            <div className="px-6 pb-8 pt-2">
              <div className="grid grid-cols-3 gap-3">
                {themes.map(t => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setOpen(false); }}
                      className={cn(
                        'relative flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all active:scale-[0.96]',
                        isSelected
                          ? 'bg-gray-900 shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      {/* Color circle with gradient */}
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform',
                          isSelected && 'scale-110'
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${t.color} 0%, ${t.colorDark} 100%)`,
                          boxShadow: isSelected ? `0 4px 14px ${t.color}60` : `0 2px 8px ${t.color}30`,
                        }}
                      >
                        {isSelected && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                      </div>

                      {/* Theme name */}
                      <span className={cn(
                        'text-xs font-semibold',
                        isSelected ? 'text-white' : 'text-gray-700'
                      )}>
                        {isAr ? t.name_ar : t.name_en}
                      </span>

                      {/* Preview bars */}
                      <div className="flex gap-1 w-full">
                        <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: t.color, opacity: isSelected ? 1 : 0.6 }} />
                        <div className="h-1 flex-[0.6] rounded-full" style={{ backgroundColor: t.colorDark, opacity: isSelected ? 1 : 0.4 }} />
                        <div className="h-1 flex-[0.3] rounded-full" style={{ backgroundColor: t.color, opacity: isSelected ? 0.6 : 0.2 }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
