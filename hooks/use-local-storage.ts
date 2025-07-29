import { useState, useEffect, useCallback } from 'react';

export interface SavedRequest {
  id: string;
  method: string;
  url: string;
  headers: Array<{ id: string; key: string; value: string }>;
  body: string;
  timestamp: number;
}

export function useLocalStorage() {
  const [requests, setRequests] = useState<SavedRequest[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('api-tester-history');
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved requests:', error);
      }
    }
  }, []);

  const saveRequest = useCallback((requestData: Omit<SavedRequest, 'id' | 'timestamp'>) => {
    const newRequest: SavedRequest = {
      ...requestData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updated = [newRequest, ...requests.slice(0, 9)]; // Keep only last 10
    setRequests(updated);
    localStorage.setItem('api-tester-history', JSON.stringify(updated));
    return newRequest;
  }, [requests]);

  const deleteRequest = useCallback((id: string) => {
    const updated = requests.filter(req => req.id !== id);
    setRequests(updated);
    localStorage.setItem('api-tester-history', JSON.stringify(updated));
  }, [requests]);

  const clearHistory = useCallback(() => {
    setRequests([]);
    localStorage.removeItem('api-tester-history');
  }, []);

  return {
    requests,
    saveRequest,
    deleteRequest,
    clearHistory,
  };
}