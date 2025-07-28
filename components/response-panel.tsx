"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Code,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "./ui/button";
import { JsonViewer } from "./json-viewer";
import { toast } from "sonner";

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
  const [copied, setCopied] = React.useState(false);
  const [isRawView, setIsRawView] = React.useState(false);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return "text-green-600 dark:text-green-400";
    if (status >= 400 && status < 500)
      return "text-yellow-600 dark:text-yellow-400";
    if (status >= 500) return "text-destructive";
    return "text-muted-foreground";
  };

  const handleCopy = async () => {
    if (!response) return;

    try {
      const text =
        typeof response.data === "object"
          ? JSON.stringify(response.data, null, 2)
          : String(response.data);

      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        description: "Response data has been copied to your clipboard",
        duration: 2000,
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy", {
        description: "Unable to copy to clipboard",
      });
    }
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
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
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
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Response Body
              </h3>
              <Card className="rounded-md relative overflow-hidden">
                <div className="relative">
                  <div className="text-sm overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-3 pt-6 pb-6">
                    {typeof response.data === "object" ? (
                      <JsonViewer
                        data={response.data}
                        className="text-sm"
                        isRawView={isRawView}
                        onToggleView={setIsRawView}
                      />
                    ) : (
                      <pre className="font-mono">{String(response.data)}</pre>
                    )}
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  {typeof response.data === "object" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 hover:bg-accent gap-1.5"
                      onClick={() => setIsRawView(!isRawView)}
                    >
                      {isRawView ? (
                        <>
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">Pretty</span>
                        </>
                      ) : (
                        <>
                          <Code className="h-4 w-4" />
                          <span className="text-xs">Raw</span>
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 hover:bg-accent gap-1.5"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-xs">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                {/* Top gradient */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent pointer-events-none" />
                {/* Bottom gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
