import { useState, useEffect } from 'react';
import api from '../lib/api';

interface Price {
  id: string;
  product_id: string;
  store_id: string;
  user_id: string;
  price: number;
  image_url: string | null;
  location_note_ar: string | null;
  location_note_en: string | null;
  upvotes: number;
  downvotes: number;
  status: string;
  created_at: string;
  stores?: Record<string, unknown>;
  users?: Record<string, unknown>;
}

export function useProductPrices(productId: string | undefined, regionId?: string) {
  const [prices, setPrices] = useState<Price[]>([]);
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPrices() {
    if (!productId) return;
    setIsLoading(true);
    try {
      const params = regionId ? { region_id: regionId } : {};
      const { data } = await api.get(`/products/${productId}/prices`, { params });
      setProduct(data.product);
      setPrices(data.prices);
      setError(null);
    } catch {
      setError('Failed to load prices');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();
  }, [productId, regionId]);

  return { product, prices, isLoading, error, refetch: fetchPrices };
}

export function useSubmitPrice() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitPrice(data: {
    product_id: string;
    store_id: string;
    price: number;
    image_url?: string;
    location_note_ar?: string;
    location_note_en?: string;
  }) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.post('/prices', data);
      return result.data;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || 'Failed to submit price';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submitPrice, isSubmitting, error };
}

export function useVotePrice() {
  const [isVoting, setIsVoting] = useState(false);

  async function vote(priceId: string, voteType: 'up' | 'down') {
    setIsVoting(true);
    try {
      const { data } = await api.post(`/prices/${priceId}/vote`, { vote_type: voteType });
      return data;
    } finally {
      setIsVoting(false);
    }
  }

  return { vote, isVoting };
}
