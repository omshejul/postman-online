"use client";

import { useState, useEffect } from "react";
import { History, Trash2, Play } from "lucide-react";

interface SavedRequest {
  id: string;
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
  timestamp: number;
}

interface RequestHistoryProps {
  onLoadRequest: (request: Omit<SavedRequest, "id" | "timestamp">) => void;
}

export default function RequestHistory({ onLoadRequest }: RequestHistoryProps) {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("api-tester-history");
    if (saved) {
      try {
        setSavedRequests(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse saved requests:", error);
      }
    }
  }, []);

  const saveCurrentRequest = (
    request: Omit<SavedRequest, "id" | "timestamp">
  ) => {
    const newRequest: SavedRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updated = [newRequest, ...savedRequests.slice(0, 9)]; // Keep only last 10
    setSavedRequests(updated);
    localStorage.setItem("api-tester-history", JSON.stringify(updated));
  };

  const deleteRequest = (id: string) => {
    const updated = savedRequests.filter((req) => req.id !== id);
    setSavedRequests(updated);
    localStorage.setItem("api-tester-history", JSON.stringify(updated));
  };

  const loadRequest = (request: SavedRequest) => {
    onLoadRequest({
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
    });
    setIsOpen(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <History className="w-4 h-4" />
        <span className="text-sm">History</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Request History
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {savedRequests.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No saved requests
              </div>
            ) : (
              savedRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-mono rounded ${
                          request.method === "GET"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : request.method === "POST"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : request.method === "PUT"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : request.method === "DELETE"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {request.method}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(request.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => loadRequest(request)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteRequest(request.id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white truncate">
                    {request.url}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
