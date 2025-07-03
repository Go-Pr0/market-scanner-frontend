// Hook to manage browser-based TrendSpider EMA configurations

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'trendspiderLocalConfigs';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export default function useLocalConfigs() {
  const [configs, setConfigs] = useState(() => readStorage());

  // Save config
  const saveConfig = useCallback((name, payload) => {
    setConfigs(prev => {
      const filtered = prev.filter(c => c.name !== name);
      const newArr = [{ name, payload, savedAt: Date.now() }, ...filtered];
      writeStorage(newArr);
      return newArr;
    });
  }, []);

  // Delete config
  const deleteConfig = useCallback((name) => {
    setConfigs(prev => {
      const newArr = prev.filter(c => c.name !== name);
      writeStorage(newArr);
      return newArr;
    });
  }, []);

  // Rename config
  const renameConfig = useCallback((oldName, newName) => {
    setConfigs(prev => {
      const newArr = prev.map(c => (c.name === oldName ? { ...c, name: newName } : c));
      writeStorage(newArr);
      return newArr;
    });
  }, []);

  // Sync changes from other tabs
  useEffect(() => {
    const handler = () => setConfigs(readStorage());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { configs, saveConfig, deleteConfig, renameConfig };
} 