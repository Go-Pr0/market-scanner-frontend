import { useEffect, useState, useCallback } from 'react';

/**
 * A generic data-fetching hook that automatically invokes the supplied `requestFn` on mount.
 *
 * @template T
 * @param {() => Promise<{ data: T }>} requestFn Function returning an axios-like promise.
 * @returns {{ data: T | null, loading: boolean, error: string | null, refresh: () => Promise<void> }}
 */
export default function useFetch(requestFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestFn();
      setData(response.data);
    } catch (err) {
      // Attempt to extract a useful message, fallback to generic string
      const message = err?.response?.data?.message || err.message || 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [requestFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
} 