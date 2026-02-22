import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { useRegion } from '../hooks/useRegion';
import { cn } from '../lib/utils';

export default function RegionSelector() {
  const { t, i18n } = useTranslation();
  const { regions, selectedRegion, setSelectedRegion } = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === 'ar';

  const activeRegions = regions.filter(r => r.active);
  const inactiveRegions = regions.filter(r => !r.active);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost p-2 text-sm font-medium flex items-center gap-1.5"
      >
        <MapPin className="w-4 h-4" />
        <span>{selectedRegion ? (isAr ? selectedRegion.name_ar : selectedRegion.name_en) : t('region.select')}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 end-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-80 overflow-y-auto">
          {/* Active regions */}
          {activeRegions.map(region => (
            <button
              key={region.id}
              onClick={() => { setSelectedRegion(region); setOpen(false); }}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50',
                selectedRegion?.id === region.id && 'bg-primary-50 text-primary-600'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success-500" />
                {isAr ? region.name_ar : region.name_en}
              </span>
              {selectedRegion?.id === region.id && <Check className="w-4 h-4" />}
            </button>
          ))}

          {/* Divider */}
          {activeRegions.length > 0 && inactiveRegions.length > 0 && (
            <div className="border-t border-gray-100 my-1 px-3 py-1">
              <span className="text-xs text-gray-400">{t('region.coming_soon')}</span>
            </div>
          )}

          {/* Inactive regions — disabled */}
          {inactiveRegions.map(region => (
            <div
              key={region.id}
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                {isAr ? region.name_ar : region.name_en}
              </span>
              <span className="text-xs">{t('region.coming_soon')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
