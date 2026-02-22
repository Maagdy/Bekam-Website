import { useState, useCallback } from 'react';
import api from '../lib/api';

export type VoicePhase = 'idle' | 'recording' | 'processing' | 'results' | 'confirming';

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  brand_ar: string | null;
  brand_en: string | null;
  unit_ar: string;
  unit_en: string;
  unit_size: string | null;
  score: number;
}

interface StoreMatch {
  id: string;
  name: string;
  address_ar: string | null;
  address_en: string | null;
  score: number;
}

interface VoiceResult {
  transcript: string;
  parsed: {
    product_query: string | null;
    store_query: string | null;
    price: number | null;
    raw_price_text: string | null;
  };
  matches: {
    products: Product[];
    stores: StoreMatch[];
  };
}

interface UseVoiceSubmitReturn {
  phase: VoicePhase;
  setPhase: (phase: VoicePhase) => void;
  result: VoiceResult | null;
  error: string | null;
  selectedProduct: Product | null;
  selectedStore: StoreMatch | null;
  price: string;
  setSelectedProduct: (p: Product | null) => void;
  setSelectedStore: (s: StoreMatch | null) => void;
  setPrice: (p: string) => void;
  processAudio: (audioBase64: string, language: 'ar' | 'en', regionId?: string, mimeType?: string) => Promise<void>;
  reset: () => void;
}

export function useVoiceSubmit(): UseVoiceSubmitReturn {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreMatch | null>(null);
  const [price, setPrice] = useState('');

  const processAudio = useCallback(
    async (audioBase64: string, language: 'ar' | 'en', regionId?: string, mimeType?: string) => {
      setPhase('processing');
      setError(null);
      setResult(null);
      setSelectedProduct(null);
      setSelectedStore(null);
      setPrice('');

      try {
        const { data } = await api.post('/voice/process', {
          audio_base64: audioBase64,
          language,
          region_id: regionId,
          mime_type: mimeType,
        });

        const voiceResult = data as VoiceResult;
        setResult(voiceResult);

        if (!voiceResult.transcript.trim()) {
          setError('empty_transcript');
          setPhase('idle');
          return;
        }

        // Auto-select product if 1 match with score > 0.6
        if (voiceResult.matches.products.length === 1 && voiceResult.matches.products[0].score > 0.6) {
          setSelectedProduct(voiceResult.matches.products[0]);
        }

        // Auto-select store if 1 match with score > 0.6
        if (voiceResult.matches.stores.length === 1 && voiceResult.matches.stores[0].score > 0.6) {
          setSelectedStore(voiceResult.matches.stores[0]);
        }

        // Pre-fill price
        if (voiceResult.parsed.price !== null) {
          setPrice(String(voiceResult.parsed.price));
        }

        setPhase('results');
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
            ?.error?.message || 'voice_processing_failed';
        setError(message);
        setPhase('idle');
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setPhase('idle');
    setResult(null);
    setError(null);
    setSelectedProduct(null);
    setSelectedStore(null);
    setPrice('');
  }, []);

  return {
    phase,
    setPhase,
    result,
    error,
    selectedProduct,
    selectedStore,
    price,
    setSelectedProduct,
    setSelectedStore,
    setPrice,
    processAudio,
    reset,
  };
}
