import { useState, useEffect, useCallback, useRef } from 'react';

export interface SavedRequest {
  id: string;
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
  timestamp: number;
}

interface StorageData {
  version: number;
  requests: SavedRequest[];
}

const STORAGE_KEY = 'api-tester-history';
const STORAGE_VERSION = 1;
const MAX_REQUESTS = 50; // Increased from 10 for better UX
const SAVE_DEBOUNCE_MS = 300;

// Simple compression for localStorage
function compress(data: string): string {
  try {
    // Basic compression by removing unnecessary whitespace from JSON
    return JSON.stringify(JSON.parse(data));
  } catch {
    return data;
  }
}

function decompress(data: string): string {
  return data; // In a real scenario, you might use LZ-string or similar
}

export function useLocalStorage() {
  const [requests, setRequests] = useState<SavedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load requests from localStorage with error handling and migration
  useEffect(() => {
    const loadRequests = () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          setIsLoading(false);
          return;
        }

        const decompressed = decompress(saved);
        let parsedData: StorageData;

        try {
          // Try parsing as new format with version
          parsedData = JSON.parse(decompressed) as StorageData;
          
          // Handle old format migration
          if (!parsedData.version && Array.isArray(parsedData)) {
            parsedData = {
              version: STORAGE_VERSION,
              requests: parsedData as SavedRequest[]
            };
          }
        } catch {
          // Handle very old format or corrupted data
          const legacyData = JSON.parse(decompressed);
          if (Array.isArray(legacyData)) {
            parsedData = {
              version: STORAGE_VERSION,
              requests: legacyData
            };
          } else {
            throw new Error('Invalid data format');
          }
        }

        // Validate and clean data
        const validRequests = parsedData.requests
          .filter((req): req is SavedRequest => 
            req &&
            typeof req.id === 'string' &&
            typeof req.method === 'string' &&
            typeof req.url === 'string' &&
            Array.isArray(req.headers) &&
            typeof req.body === 'string' &&
            typeof req.timestamp === 'number'
          )
          .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
          .slice(0, MAX_REQUESTS); // Limit to max requests

        setRequests(validRequests);

        // If data was cleaned up or migrated, save it back
        if (validRequests.length !== parsedData.requests.length || parsedData.version !== STORAGE_VERSION) {
          const newData: StorageData = {
            version: STORAGE_VERSION,
            requests: validRequests
          };
          const compressed = compress(JSON.stringify(newData));
          localStorage.setItem(STORAGE_KEY, compressed);
        }

      } catch (error) {
        console.error('Failed to load saved requests:', error);
        setError('Failed to load request history. Starting fresh.');
        
        // Clear corrupted data
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // localStorage might be unavailable
        }
        
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  // Debounced save function
  const saveToStorage = useCallback((requestsToSave: SavedRequest[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const data: StorageData = {
          version: STORAGE_VERSION,
          requests: requestsToSave
        };
        const compressed = compress(JSON.stringify(data));
        localStorage.setItem(STORAGE_KEY, compressed);
        setError(null);
      } catch (error) {
        console.error('Failed to save requests to localStorage:', error);
        setError('Failed to save request history.');
      }
    }, SAVE_DEBOUNCE_MS);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveRequest = useCallback((requestData: Omit<SavedRequest, 'id' | 'timestamp'>) => {
    const newRequest: SavedRequest = {
      ...requestData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      timestamp: Date.now(),
    };

    setRequests(prevRequests => {
      // Remove any existing request with same URL and method to avoid duplicates
      const filtered = prevRequests.filter(
        req => !(req.url === newRequest.url && req.method === newRequest.method)
      );
      
      const updated = [newRequest, ...filtered].slice(0, MAX_REQUESTS);
      saveToStorage(updated);
      return updated;
    });

    return newRequest;
  }, [saveToStorage]);

  const deleteRequest = useCallback((id: string) => {
    setRequests(prevRequests => {
      const updated = prevRequests.filter(req => req.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearHistory = useCallback(() => {
    setRequests([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      setError(null);
    } catch (error) {
      console.error('Failed to clear request history:', error);
      setError('Failed to clear request history.');
    }
  }, []);

  const exportHistory = useCallback(() => {
    try {
      const data: StorageData = {
        version: STORAGE_VERSION,
        requests
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export history:', error);
      throw new Error('Failed to export request history');
    }
  }, [requests]);

  const importHistory = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData) as StorageData;
      
      // Validate imported data
      if (!Array.isArray(data.requests)) {
        throw new Error('Invalid import format');
      }

      const validRequests = data.requests
        .filter((req): req is SavedRequest => 
          req &&
          typeof req.id === 'string' &&
          typeof req.method === 'string' &&
          typeof req.url === 'string' &&
          Array.isArray(req.headers) &&
          typeof req.body === 'string' &&
          typeof req.timestamp === 'number'
        )
        .slice(0, MAX_REQUESTS);

      setRequests(validRequests);
      saveToStorage(validRequests);
      setError(null);
      
      return validRequests.length;
    } catch (error) {
      console.error('Failed to import history:', error);
      throw new Error('Failed to import request history. Please check the file format.');
    }
  }, [saveToStorage]);

  // Get storage usage info
  const getStorageInfo = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const sizeInBytes = data ? new Blob([data]).size : 0;
      const sizeInKB = Math.round(sizeInBytes / 1024 * 100) / 100;
      
      return {
        requestCount: requests.length,
        sizeInBytes,
        sizeInKB,
        maxRequests: MAX_REQUESTS
      };
    } catch {
      return {
        requestCount: requests.length,
        sizeInBytes: 0,
        sizeInKB: 0,
        maxRequests: MAX_REQUESTS
      };
    }
  }, [requests.length]);

  return {
    requests,
    isLoading,
    error,
    saveRequest,
    deleteRequest,
    clearHistory,
    exportHistory,
    importHistory,
    getStorageInfo,
  };
}