"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequestPanel } from "@/components/request-panel";
import { ResponsePanel } from "@/components/response-panel";
import RequestHistory from "@/components/request-history";
import ExampleApis from "@/components/example-apis";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRequestState } from "@/hooks/use-request-state";
import { useServiceWorker, useNetworkStatus } from "@/hooks/use-service-worker";
import { validateRequest, RateLimiter } from "@/lib/security";
import { Wifi, WifiOff, Circle, CheckCircle, AlertCircle, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
}

// Network status indicator component
function NetworkStatusIndicator({ 
  url, 
  method, 
  headers, 
  body 
}: { 
  url: string; 
  method: string; 
  headers: Array<{ key: string; value: string }>; 
  body: string; 
}) {
  const { isOnline, wasOffline, connectionType } = useNetworkStatus();
  const { isRegistered, updateAvailable, updateServiceWorker } = useServiceWorker();

  // Check security status
  const validation = validateRequest(url, method, headers, body);
  const hasWarnings = validation.warnings.length > 0;
  const hasErrors = validation.errors.length > 0;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <AnimatePresence>
        {/* Service Worker Update Available */}
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <Button
              size="sm"
              onClick={updateServiceWorker}
              className="text-xs"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Update Available
            </Button>
          </motion.div>
                  )}

          {/* Security Status */}
          {(hasErrors || hasWarnings) && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                hasErrors 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
              }`}
              title={hasErrors ? validation.errors.join(', ') : validation.warnings.join(', ')}
            >
              {hasErrors ? (
                <ShieldAlert className="w-3 h-3" />
              ) : (
                <Shield className="w-3 h-3" />
              )}
              <span>{hasErrors ? 'Security Error' : 'Warning'}</span>
            </motion.div>
          )}

          {/* Offline/Online Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isOnline 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span>
            {isOnline ? (wasOffline ? 'Back Online' : 'Online') : 'Offline'}
          </span>
          
          {/* Service Worker Status */}
          <div className="ml-1">
            {isRegistered ? (
              <Circle className="w-2 h-2 fill-current text-green-500" />
            ) : (
              <AlertCircle className="w-2 h-2 text-amber-500" />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function ApiTester() {
  // Request state managed in cookies
  const {
    method,
    url,
    headers,
    body,
    setMethod,
    setUrl,
    setHeaders,
    setBody,
    loadRequest: loadRequestState,
    clearState,
    isLoaded,
  } = useRequestState();

  // Local UI state
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  const { saveRequest } = useLocalStorage();
  const { isOnline } = useNetworkStatus();
  const { showNotification } = useServiceWorker();

  // Rate limiter for security
  const rateLimiter = new RateLimiter(30, 60000); // 30 requests per minute

  const processTripleBackticks = useCallback((jsonString: string): string => {
    return jsonString.replace(/```([\s\S]*?)```/g, (match, content) => {
      const escaped = content
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");

      return `"${escaped}"`;
    });
  }, []);

  const validateUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const validateJson = useCallback((jsonString: string): boolean => {
    if (!jsonString.trim()) return true;

    try {
      const processed = processTripleBackticks(jsonString);
      JSON.parse(processed);
      return true;
    } catch {
      return false;
    }
  }, [processTripleBackticks]);

  const convertHtmlToJson = useCallback(() => {
    if (!htmlContent.trim()) {
      toast.error("No HTML content to convert");
      return;
    }

    try {
      const emailPayload = {
        to: ["recipient@example.com"],
        subject: "Your Subject Here",
        html: htmlContent,
        from: "sender@example.com",
      };

      setBody(JSON.stringify(emailPayload, null, 2));
      setShowHtmlEditor(false);
      
      toast.success("HTML converted to JSON", {
        description: "Email payload generated successfully"
      });
    } catch (error) {
      toast.error("Failed to convert HTML", {
        description: "Please check your HTML content"
      });
    }
  }, [htmlContent, setBody]);

  const handleSaveRequest = useCallback(() => {
    if (!url.trim()) {
      toast.error("Cannot save request", {
        description: "URL is required"
      });
      return;
    }

    const saved = saveRequest({
      method,
      url,
      headers,
      body,
    });

    toast.success("Request saved", {
      description: `${method} ${url}`
    });
  }, [method, url, headers, body, saveRequest]);

  const sendRequest = useCallback(async () => {
    // Security validation
    const validation = validateRequest(url, method, headers, body);
    
    if (!validation.isValid) {
      setError(`Security validation failed: ${validation.errors.join(', ')}`);
      setJsonError(null);
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        toast.warning("Security Warning", {
          description: warning,
          icon: <ShieldAlert className="w-4 h-4" />
        });
      });
    }

    // Rate limiting check
    const clientId = 'api-tester-client'; // In a real app, this could be based on IP or user ID
    if (!rateLimiter.isAllowed(clientId)) {
      const remaining = rateLimiter.getRemainingRequests(clientId);
      const resetTime = new Date(rateLimiter.getResetTime(clientId));
      setError(`Rate limit exceeded. Try again at ${resetTime.toLocaleTimeString()}`);
      toast.error("Rate limit exceeded", {
        description: `You can make ${remaining} more requests. Limit resets at ${resetTime.toLocaleTimeString()}`,
      });
      return;
    }

    setError(null);
    setJsonError(null);
    setLoading(true);
    setRequestSuccess(false);

    const startTime = performance.now();

    try {
      const requestOptions: RequestInit = {
        method,
        headers: headers.reduce(
          (acc, header) => {
            if (header.key && header.value) {
              acc[header.key] = header.value;
            }
            return acc;
          },
          {} as Record<string, string>
        ),
      };

      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        const processedBody = processTripleBackticks(body);
        requestOptions.body = processedBody;
      }

      // Add timeout and better error handling
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 30000); // 30s timeout

      requestOptions.signal = timeoutController.signal;

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData: unknown;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else if (contentType?.includes("text/")) {
        responseData = await response.text();
      } else {
        responseData = `Binary data (${contentType || "unknown type"})`;
      }

      const apiResponse: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        time: responseTime,
      };

      setResponse(apiResponse);
      setRequestSuccess(true);
      
      // Show notification for completed requests when offline/online
      if (!isOnline) {
        showNotification?.('Request completed', {
          body: `${method} ${url} - ${response.status} ${response.statusText}`,
          tag: 'api-request'
        });
      }

      // Save successful request to history
      saveRequest({
        method,
        url,
        headers,
        body,
      });

      // Show success toast
      toast.success(`Request completed in ${responseTime}ms`, {
        description: `${method} ${url} - ${response.status} ${response.statusText}`
      });

    } catch (err) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      let errorMessage = "Request failed";
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = "Request timed out (30s)";
        } else if (err.message.includes('fetch')) {
          errorMessage = isOnline ? "Network error" : "You're offline - check your connection";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      
      // Show error notification
      showNotification?.('Request failed', {
        body: errorMessage,
        tag: 'api-error'
      });

      toast.error("Request failed", {
        description: errorMessage
      });

      console.error("Request failed:", err);
    } finally {
      setLoading(false);
    }
  }, [method, url, headers, body, saveRequest, isOnline, showNotification, validateUrl, validateJson, processTripleBackticks]);

  const loadRequest = useCallback(
    (request: {
      method: string;
      url: string;
      headers: Array<{ key: string; value: string }>;
      body: string;
    }) => {
      loadRequestState(request);
    },
    [loadRequestState]
  );

  const selectExampleApi = useCallback(
    (api: { name: string; method: string; url: string }) => {
      console.log("selectExampleApi called with:", api);

      setMethod(api.method);
      setUrl(api.url);

      // Reset headers to default for the new request
      setHeaders([{ key: "Content-Type", value: "application/json" }]);

      if (["POST", "PUT", "PATCH"].includes(api.method)) {
        if (api.url.includes("jsonplaceholder")) {
          setBody(
            JSON.stringify(
              {
                title: "Sample Post",
                body: "This is a sample post body",
                userId: 1,
              },
              null,
              2
            )
          );
        } else if (api.url.includes("httpbin")) {
          setBody(
            JSON.stringify(
              {
                message: "Hello from API Tester",
                timestamp: new Date().toISOString(),
              },
              null,
              2
            )
          );
        } else if (api.url.includes("email") || api.url.includes("mail")) {
          setBody(
            JSON.stringify(
              {
                from: "John Doe <sender@example.com>",
                to: "Jane Smith <recipient@example.com>",
                subject: "Test Email",
                "body-type": "html",
                body: "<!DOCTYPE html><html><head><title>Test Email</title></head><body><h1>Hello World!</h1><p>This is a test email with <strong>HTML content</strong>.</p></body></html>",
              },
              null,
              2
            )
          );
        } else {
          // For GET requests or other APIs, clear the body
          setBody("");
        }
      } else {
        // For GET requests, clear the body
        setBody("");
      }

      console.log("State should be updated to:", {
        method: api.method,
        url: api.url,
        headers: [{ key: "Content-Type", value: "application/json" }],
      });
    },
    [setMethod, setUrl, setHeaders, setBody]
  );

  const handleBodyChange = useCallback(
    (newBody: string) => {
      setBody(newBody);
      let processedValue = newBody;
      if (newBody.includes("```")) {
        processedValue = processTripleBackticks(newBody);
      }
      validateJson(processedValue);
    },
    [processTripleBackticks, validateJson, setBody]
  );

  // Don't render until state is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

      return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <NetworkStatusIndicator 
          url={url}
          method={method}
          headers={headers}
          body={body}
        />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                API Tester
              </h1>
              <p className="text-muted-foreground mt-2">
                Modern Postman alternative built with Next.js
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <RequestPanel
                method={method}
                setMethod={setMethod}
                url={url}
                setUrl={setUrl}
                headers={headers}
                setHeaders={setHeaders}
                body={body}
                setBody={setBody}
                loading={loading}
                onSendRequest={sendRequest}
                onSaveRequest={handleSaveRequest}
                onClearState={clearState}
                jsonError={jsonError}
                showHtmlEditor={showHtmlEditor}
                setShowHtmlEditor={setShowHtmlEditor}
                htmlContent={htmlContent}
                setHtmlContent={setHtmlContent}
                onConvertHtmlToJson={convertHtmlToJson}
                requestSuccess={requestSuccess}
                requestError={error}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ResponsePanel
                response={response}
                loading={loading}
                error={error}
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <RequestHistory onLoadRequest={loadRequestState} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ExampleApis onLoadRequest={loadRequestState} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
