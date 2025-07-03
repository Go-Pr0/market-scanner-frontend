import { getHealthStatus } from '../api';
import useFetch from './useFetch';

export default function useHealthStatus() {
  return useFetch(getHealthStatus);
} 