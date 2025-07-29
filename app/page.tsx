"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RequestPanel } from "@/components/request-panel";
import { ResponsePanel } from "@/components/response-panel";
import RequestHistory from "@/components/request-history";
import ExampleApis from "@/components/example-apis";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRequestState } from "@/hooks/use-request-state";
import { generateId } from "@/lib/utils";

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
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

  const validateJson = useCallback(
    (jsonString: string): boolean => {
      if (!jsonString.trim()) return true;

      let processedString = jsonString;
      if (jsonString.includes("```")) {
        processedString = processTripleBackticks(jsonString);
      }

      try {
        JSON.parse(processedString);
        setJsonError(null);
        return true;
      } catch (error) {
        setJsonError(error instanceof Error ? error.message : "Invalid JSON");
        return false;
      }
    },
    [processTripleBackticks]
  );

  const convertHtmlToJson = useCallback(() => {
    try {
      const currentJson = body ? JSON.parse(body) : {};
      const updatedJson = {
        ...currentJson,
        "body-type": "html",
        body: htmlContent,
      };
      setBody(JSON.stringify(updatedJson, null, 2));
      setJsonError(null);
      setShowHtmlEditor(false);
    } catch {
      setJsonError("Failed to convert HTML to JSON");
    }
  }, [body, htmlContent, setBody]);

  const handleSaveRequest = useCallback(() => {
    const savedRequest = saveRequest({
      method,
      url,
      headers,
      body,
    });

    if (savedRequest) {
      // Show success feedback if needed
      console.log("Request saved successfully");
    }
  }, [method, url, headers, body, saveRequest]);

  const sendRequest = useCallback(async () => {
    // Validate URL
    if (!url.trim()) {
      setError("Please enter a valid URL");
      // Auto-clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if URL has a protocol
    let validUrl = url.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = `https://${validUrl}`;
    }

    // Basic URL validation
    try {
      new URL(validUrl);
    } catch {
      setError("Please enter a valid URL");
      // Auto-clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
      return;
    }

    let processedBody = body;
    if (body && body.includes("```")) {
      processedBody = processTripleBackticks(body);
      setBody(processedBody);
    }

    if (processedBody && !validateJson(processedBody)) {
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setRequestSuccess(false);

    try {
      const startTime = Date.now();

      const headerObj: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.key && header.value) {
          // For GET requests, skip Content-Type header as it can cause CORS issues
          if (method === "GET" && header.key.toLowerCase() === "content-type") {
            return;
          }
          headerObj[header.key] = header.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: headerObj,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && processedBody) {
        options.body = processedBody;
      }

      const res = await fetch(validUrl, options);
      const endTime = Date.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData;
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data: responseData,
        time: endTime - startTime,
      });
      setRequestSuccess(true);
    } catch (err) {
      let errorMessage = "Request failed";

      if (err instanceof TypeError && err.message === "Failed to fetch") {
        // Check if it's likely a CORS issue
        if (
          validUrl.startsWith("http://") &&
          window.location.protocol === "https:"
        ) {
          errorMessage =
            "Mixed content error: Cannot make HTTP request from HTTPS page";
        } else if (
          !validUrl.startsWith("http://") &&
          !validUrl.startsWith("https://")
        ) {
          errorMessage = "Invalid URL: Must start with http:// or https://";
        } else {
          errorMessage = `Cannot connect to ${
            new URL(validUrl).hostname
          } - Server unreachable or CORS blocked`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    method,
    url,
    headers,
    body,
    processTripleBackticks,
    validateJson,
    setBody,
  ]);

  const loadRequest = useCallback(
    (request: {
      method: string;
      url: string;
      headers: Array<{ key: string; value: string }>;
      body: string;
    }) => {
      const requestWithIds = {
        ...request,
        headers: request.headers.map((header) => ({
          ...header,
          id: generateId(),
        })),
      };
      loadRequestState(requestWithIds);
    },
    [loadRequestState]
  );

  const selectExampleApi = useCallback(
    (api: { name: string; method: string; url: string }) => {
      console.log("selectExampleApi called with:", api);

      setMethod(api.method);
      setUrl(api.url);
      // Reset headers to default for the new request
      setHeaders([
        {
          key: "Content-Type",
          value: "application/json",
          id: generateId(),
        },
      ]);

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

  // Don't render until cookie state is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-border border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="container mx-auto p-4 sm:p-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="mb-8"
        >
          <div className="flex flex-col items-start sm:items-center justify-between mb-4 sm:gap-0">
            <div className="flex items-center mb-2 gap-2">
              <Image
                src="/logo.svg"
                alt="API Tester Logo"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden"
              />
              <h1 className="text-3xl sm:text-4xl font-bold">API Tester</h1>
            </div>
            <div className="flex flex-wrap w-full justify-between items-center gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <RequestHistory onLoadRequest={loadRequest} />
                <ExampleApis onSelectApi={selectExampleApi} />
              </div>
              <ThemeToggle />
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="text-xs leading-6 sm:text-sm text-muted-foreground bg-muted px-3 sm:px-4 py-2 rounded-lg border border-border"
          >
            💡 Tip: Use{" "}
            <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-background rounded text-xs border border-border">
              Ctrl/Cmd + Enter
            </kbd>{" "}
            <span className="hidden sm:inline">
              to send requests quickly • Your work is automatically saved and
              restored • Wrap HTML content with{" "}
            </span>
            <span className="inline sm:hidden">
              to send • Auto-saves • Wrap HTML with{" "}
            </span>
            <code className="px-1 bg-background rounded border border-border">
              ```
            </code>{" "}
            <span className="hidden sm:inline">for automatic escaping</span>
            <span className="inline sm:hidden">to escape</span>
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <RequestPanel
              method={method}
              setMethod={setMethod}
              url={url}
              setUrl={setUrl}
              headers={headers}
              setHeaders={setHeaders}
              body={body}
              setBody={handleBodyChange}
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
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <ResponsePanel
              response={response}
              loading={loading}
              error={error}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
