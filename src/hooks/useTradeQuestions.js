import { useState, useCallback } from 'react';
import { generateTradeQuestions } from '../api';

// Key used for localStorage
const STORAGE_KEY = 'tradePlannerQuestions';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

/**
 * Hook to manage trade planning questions and answers lifecycle.
 */
export default function useTradeQuestions() {
  const [state, setState] = useState(() => readStorage());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch additional questions from the backend
  const fetchAdditionalQuestions = useCallback(async (answered) => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateTradeQuestions(answered);
      return response.data?.additional_questions || [];
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Failed to fetch additional questions';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cache all questions and answers to localStorage
  const cacheAllQuestions = useCallback((questions) => {
    const payload = { questions };
    writeStorage(payload);
    setState(payload);
  }, []);

  const clearQuestions = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(null);
  }, []);

  return {
    questions: state?.questions || null,
    loading,
    error,
    fetchAdditionalQuestions,
    cacheAllQuestions,
    clearQuestions
  };
} 