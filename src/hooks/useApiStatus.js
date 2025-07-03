import { getApiStatus } from '../api';
import useFetch from './useFetch';
 
export default function useApiStatus() {
  return useFetch(getApiStatus);
} 