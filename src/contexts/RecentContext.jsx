import React, { createContext, useState, useContext, useEffect } from 'react';

const RecentContext = createContext();

export function RecentProvider({ children }) {
  const [recentPages, setRecentPages] = useState(() => {
    try {
      const stored = localStorage.getItem('recentPages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('recentPages', JSON.stringify(recentPages));
  }, [recentPages]);

  const addPage = (page) => {
    setRecentPages((prev) => {
      const withoutDuplicate = prev.filter((p) => p.path !== page.path);
      return [{ ...page, visitedAt: Date.now() }, ...withoutDuplicate].slice(0, 5);
    });
  };

  return (
    <RecentContext.Provider value={{ recentPages, addPage }}>
      {children}
    </RecentContext.Provider>
  );
}

export function useRecent() {
  const context = useContext(RecentContext);
  if (!context) {
    throw new Error('useRecent must be used within RecentProvider');
  }
  return context;
} 