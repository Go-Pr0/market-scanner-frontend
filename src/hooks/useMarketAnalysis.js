import { useEffect } from 'react';
import { getMarketAnalysis } from '../api';
import useFetch from './useFetch';

/**
 * Fetches market overview (top gainers, losers, most active) and optionally keeps it up-to-date.
 *
 * @param {number|false} refreshInterval   Milliseconds between automatic refreshes. Pass `false` to disable. Default 900_000 (15 min).
 */
export default function useMarketAnalysis(refreshInterval = 900_000) {
  const { data, loading, error, refresh } = useFetch(getMarketAnalysis);

  // Optional polling every `refreshInterval` ms
  useEffect(() => {
    if (!refreshInterval) return;
    const id = setInterval(refresh, refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval, refresh]);

  return { data, loading, error, refresh };
} 