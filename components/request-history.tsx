"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Play, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalStorage, type SavedRequest } from "@/hooks/use-local-storage";
import { formatTime } from "@/lib/utils";

interface RequestHistoryProps {
  onLoadRequest: (request: Omit<SavedRequest, "id" | "timestamp">) => void;
}

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "POST":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "PUT":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "DELETE":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const RequestHistoryItem = React.memo(function RequestHistoryItem({
  request,
  onLoad,
  onDelete,
}: {
  request: SavedRequest;
  onLoad: (request: SavedRequest) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-mono rounded ${getMethodColor(request.method)}`}>
            {request.method}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(request.timestamp)}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLoad(request)}
            className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Play className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(request.id)}
            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-gray-900 dark:text-white truncate font-mono">
        {request.url}
      </div>
    </motion.div>
  );
});

export default function RequestHistory({ onLoadRequest }: RequestHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { requests, deleteRequest, clearHistory } = useLocalStorage();

  const handleLoadRequest = useCallback(
    (request: SavedRequest) => {
      onLoadRequest({
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      });
      setIsOpen(false);
    },
    [onLoadRequest]
  );

  const handleDeleteRequest = useCallback(
    (id: string) => {
      deleteRequest(id);
    },
    [deleteRequest]
  );

  const handleClearHistory = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <History className="w-4 h-4 mr-2" />
        History ({requests.length})
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-96 z-20"
          >
            <Card className="shadow-lg">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Request History
                  </h3>
                  {requests.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearHistory}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {requests.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm"
                    >
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No saved requests
                    </motion.div>
                  ) : (
                    requests.map((request) => (
                      <RequestHistoryItem
                        key={request.id}
                        request={request}
                        onLoad={handleLoadRequest}
                        onDelete={handleDeleteRequest}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
