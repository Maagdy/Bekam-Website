import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  brand_ar: string | null;
  brand_en: string | null;
  category_id: string;
  image_url: string | null;
  unit_ar: string;
  unit_en: string;
  unit_size: string | null;
}

interface SearchResult {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useSearch(debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<SearchResult>('/products/search', {
          params: { q: query, page: pagination.page },
        });
        setResults(data.data);
        setPagination(data.pagination);
      } catch {
        setError('Search failed');
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, debounceMs]);

  async function searchPage(page: number) {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await api.get<SearchResult>('/products/search', {
        params: { q: query, page },
      });
      setResults(data.data);
      setPagination(data.pagination);
    } catch {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  }

  return { query, setQuery, results, pagination, isLoading, error, searchPage };
}
