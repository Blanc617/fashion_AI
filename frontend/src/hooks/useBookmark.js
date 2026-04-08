import { useState, useCallback } from 'react';

const STORAGE_KEY = 'stylebook';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { celebrities: [], news: [], items: [] };
  } catch {
    return { celebrities: [], news: [], items: [] };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useBookmark() {
  const [bookmarks, setBookmarks] = useState(load);

  const toggle = useCallback((type, item) => {
    setBookmarks(prev => {
      const list = prev[type] || [];
      const exists = list.some(b => b.id === item.id);
      const next = exists
        ? list.filter(b => b.id !== item.id)
        : [{ ...item, savedAt: Date.now() }, ...list];
      const updated = { ...prev, [type]: next };
      save(updated);
      return updated;
    });
  }, []);

  const isBookmarked = useCallback((type, id) => {
    return (bookmarks[type] || []).some(b => b.id === id);
  }, [bookmarks]);

  const remove = useCallback((type, id) => {
    setBookmarks(prev => {
      const updated = { ...prev, [type]: prev[type].filter(b => b.id !== id) };
      save(updated);
      return updated;
    });
  }, []);

  return { bookmarks, toggle, isBookmarked, remove };
}
