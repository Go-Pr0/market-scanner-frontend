import { getFullyDilutedSymbols } from '../api';
import useFetch from './useFetch';
import { useCallback } from 'react';

export default function useFullyDilutedSymbols(threshold = 85) {
  // Generate request function only when threshold changes
  const requestFn = useCallback(() => getFullyDilutedSymbols(threshold), [threshold]);
  return useFetch(requestFn);
} 