"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusColor } from "@/lib/utils";

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

interface ResponsePanelProps {
  response: ApiResponse | null;
  loading: boolean;
  error: string | null;
}

export const ResponsePanel = React.memo(function ResponsePanel({
  response,
  loading,
  error,
}: ResponsePanelProps) {
  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) {
      return <CheckCircle className="w-5 h-5" />;
    } else {
      return <XCircle className="w-5 h-5" />;
    }
  };

  const formatResponseData = (data: any) => {
    if (typeof data === "object") {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg font-semibold">Response</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <span className="text-gray-600 dark:text-gray-400">
                  Sending request...
                </span>
              </div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </p>
            </motion.div>
          )}

          {response && !loading && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4"
              >
                <div className={`flex items-center gap-2 ${getStatusColor(response.status)}`}>
                  {getStatusIcon(response.status)}
                  <span className="font-mono font-semibold text-lg">
                    {response.status} {response.statusText}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{response.time}ms</span>
                </div>
              </motion.div>

              {/* Response Headers */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Response Headers
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-1">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm font-mono break-all"
                      >
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {key}:
                        </span>{" "}
                        <span className="text-gray-900 dark:text-white">
                          {value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Response Body */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Response Body
                </h3>
                <div className="relative">
                  <pre className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm font-mono text-gray-900 dark:text-white overflow-x-auto max-h-96 overflow-y-auto border">
                    {formatResponseData(response.data)}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400 border">
                      {typeof response.data === "object" ? "JSON" : "Text"}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {!response && !loading && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500 dark:text-gray-400"
            >
              <div className="text-4xl mb-4">🚀</div>
              <p>Send a request to see the response here</p>
              <p className="text-sm mt-2">Use Ctrl/Cmd + Enter to send quickly</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});