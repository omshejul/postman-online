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
  ArrowRight,
  AlertTriangle,
  Lock,
  Ban,
  Search,
  Timer,
  Server,
  Wifi,
  Wrench,
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

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300)
      return "text-green-600 dark:text-green-400";
    if (status >= 400 && status < 500)
      return "text-yellow-600 dark:text-yellow-400";
    if (status >= 500) return "text-destructive";
    return "text-muted-foreground";
  };

  function getStatusText(status: number): string {
    switch (status) {
      case 200:
        return "OK";
      case 201:
        return "Created";
      case 204:
        return "No Content";
      case 301:
        return "Moved Permanently";
      case 302:
        return "Found";
      case 304:
        return "Not Modified";
      case 307:
        return "Temporary Redirect";
      case 308:
        return "Permanent Redirect";
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Not Found";
      case 405:
        return "Method Not Allowed";
      case 408:
        return "Request Timeout";
      case 409:
        return "Conflict";
      case 422:
        return "Unprocessable Entity";
      case 429:
        return "Too Many Requests";
      case 500:
        return "Internal Server Error";
      case 502:
        return "Bad Gateway";
      case 503:
        return "Service Unavailable";
      case 504:
        return "Gateway Timeout";
      default:
        return "";
    }
  }

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
    } catch {
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
            className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6"
          >
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-1 text-destructive/80 text-sm">{error}</p>

            {/* Show additional help for CORS errors */}
            {error.includes("CORS") && (
              <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  CORS Error Help:
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>
                    • The server doesn&apos;t allow requests from your domain
                  </li>
                  <li>
                    • Try removing custom headers (especially Content-Type for
                    GET requests)
                  </li>
                  <li>• Some APIs require specific CORS headers to be set</li>
                  <li>
                    • Consider using a CORS proxy or testing with a different
                    API
                  </li>
                </ul>
              </div>
            )}

            {/* Show additional help for network errors */}
            {error.includes("Network Error") && (
              <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Network Error Help:
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Verify the URL is correct and accessible</li>
                  <li>• The server might be down or unreachable</li>
                  <li>• Try again in a few moments</li>
                </ul>
              </div>
            )}
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(
                  response.status
                )}`}
              >
                {response.status === 200 && <CheckCircle className="w-4 h-4" />}
                {response.status === 201 && <CheckCircle className="w-4 h-4" />}
                {response.status === 204 && <CheckCircle className="w-4 h-4" />}
                {response.status === 301 && <ArrowRight className="w-4 h-4" />}
                {response.status === 302 && <ArrowRight className="w-4 h-4" />}
                {response.status === 304 && <ArrowRight className="w-4 h-4" />}
                {response.status === 307 && <ArrowRight className="w-4 h-4" />}
                {response.status === 308 && <ArrowRight className="w-4 h-4" />}
                {response.status === 400 && (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {response.status === 401 && <Lock className="w-4 h-4" />}
                {response.status === 403 && <Ban className="w-4 h-4" />}
                {response.status === 404 && <Search className="w-4 h-4" />}
                {response.status === 405 && <Ban className="w-4 h-4" />}
                {response.status === 408 && <Timer className="w-4 h-4" />}
                {response.status === 409 && (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {response.status === 422 && (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {response.status === 429 && <Timer className="w-4 h-4" />}
                {response.status === 500 && <Server className="w-4 h-4" />}
                {response.status === 502 && <Wifi className="w-4 h-4" />}
                {response.status === 503 && <Wrench className="w-4 h-4" />}
                {response.status === 504 && <Timer className="w-4 h-4" />}
                <span className="flex items-baseline gap-1 font-mono text-sm">
                  <span className="font-bold">{response.status}</span>
                  <span className="font-extrabold font-sans">
                    {response.statusText || getStatusText(response.status)}
                  </span>
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
