"use client";

import React, { useCallback } from "react";
import { History, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function RequestHistory({ onLoadRequest }: RequestHistoryProps) {
  const { requests, deleteRequest, clearHistory } = useLocalStorage();

  const handleLoadRequest = useCallback(
    (request: SavedRequest) => {
      onLoadRequest({
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      });
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <History className="w-4 h-4 mr-2" />
          History ({requests.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="start">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Request History</span>
          {requests.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-red-600 hover:text-red-700 text-xs h-auto p-1"
            >
              Clear All
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {requests.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No saved requests
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {requests.map((request) => (
              <div key={request.id} className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-mono rounded ${getMethodColor(
                        request.method
                      )}`}
                    >
                      {request.method}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(request.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLoadRequest(request)}
                      className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRequest(request.id)}
                      className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-foreground truncate font-mono">
                  {request.url}
                </div>
                {requests.indexOf(request) < requests.length - 1 && (
                  <DropdownMenuSeparator className="mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
