import { createContext, useEffect, useState, type ReactNode } from 'react';
import api from '../lib/api';

interface Region {
  id: string;
  name_ar: string;
  name_en: string;
  active: boolean;
  price_count: number;
  user_count: number;
  auto_activate_threshold: number;
}

interface RegionContextType {
  regions: Region[];
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region) => void;
  isLoading: boolean;
}

export const RegionContext = createContext<RegionContextType | null>(null);

const REGION_STORAGE_KEY = 'bekam_selected_region';

export function RegionProvider({ children }: { children: ReactNode }) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegionState] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        const { data } = await api.get('/regions');
        const regionsList: Region[] = data.data;
        setRegions(regionsList);

        // Restore from localStorage or default to first active
        const savedId = localStorage.getItem(REGION_STORAGE_KEY);
        const saved = savedId ? regionsList.find(r => r.id === savedId) : null;

        if (saved) {
          setSelectedRegionState(saved);
        } else {
          const firstActive = regionsList.find(r => r.active);
          if (firstActive) {
            setSelectedRegionState(firstActive);
            localStorage.setItem(REGION_STORAGE_KEY, firstActive.id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch regions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRegions();
  }, []);

  function setSelectedRegion(region: Region) {
    setSelectedRegionState(region);
    localStorage.setItem(REGION_STORAGE_KEY, region.id);
  }

  return (
    <RegionContext.Provider value={{ regions, selectedRegion, setSelectedRegion, isLoading }}>
      {children}
    </RegionContext.Provider>
  );
}
