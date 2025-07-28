"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
}

interface ResponsePanelProps {
  response: ApiResponse | null;
  loading: boolean;
  error: string | null;
}

export function ResponsePanel({
  response,
  loading,
  error,
}: ResponsePanelProps) {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return "text-green-600 dark:text-green-400";
    if (status >= 400 && status < 500)
      return "text-yellow-600 dark:text-yellow-400";
    if (status >= 500) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <Card className="shadow-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Response</h2>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center py-8"
          >
            <div className="w-8 h-8 border-4 border-border border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-muted-foreground">
              Sending request...
            </span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="bg-destructive/10 border border-destructive/20 rounded-md p-4"
          >
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-1 text-destructive/80 text-sm">{error}</p>
          </motion.div>
        )}

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-4"
          >
            {/* Status */}
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 ${getStatusColor(
                  response.status
                )}`}
              >
                {response.status >= 200 && response.status < 300 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="font-mono font-semibold">
                  {response.status} {response.statusText}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{response.time}ms</span>
              </div>
            </div>

            {/* Response Headers */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response Headers
              </h3>
              <Card className="rounded-md p-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="text-sm font-mono">
                    <span className="text-muted-foreground">{key}:</span>{" "}
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Response Body */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response Body
              </h3>
              <Card className="rounded-md p-3 text-sm font-mono text-foreground overflow-x-auto max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <pre
                  className="
                text-sm font-mono overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                >
                  {typeof response.data === "object"
                    ? JSON.stringify(response.data, null, 2)
                    : String(response.data)}
                </pre>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
