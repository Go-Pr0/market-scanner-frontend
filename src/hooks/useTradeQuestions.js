import { useState, useCallback, useEffect } from 'react';
import { generateTradeQuestions, saveQuestionnaire, getQuestionnaire } from '../api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to manage trade planning questions and answers lifecycle.
 */
export default function useTradeQuestions() {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadQuestionnaire = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const response = await getQuestionnaire();
      if (response.data?.has_questionnaire && response.data?.questions?.length > 0) {
        setState({ questions: response.data.questions });
      } else {
        setState(null);
      }
    } catch (err) {
      console.error('Failed to load questionnaire:', err);
      setState(null);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Load questionnaire from database when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadQuestionnaire();
    } else {
      setState(null);
      setInitialLoading(false);
    }
  }, [isAuthenticated, loadQuestionnaire]);

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

  // Save all questions and answers to database
  const saveAllQuestions = useCallback(async (questions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await saveQuestionnaire(questions);
      if (response.data?.success) {
        const payload = { questions };
        setState(payload);
        return true;
      } else {
        throw new Error('Failed to save questionnaire');
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Failed to save questionnaire';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearQuestions = useCallback(async () => {
    // For clearing, we could implement a delete endpoint, but for now just reload
    setState(null);
  }, []);

  return {
    questions: state?.questions || null,
    loading,
    error,
    initialLoading,
    fetchAdditionalQuestions,
    saveAllQuestions,
    clearQuestions,
    loadQuestionnaire
  };
} 