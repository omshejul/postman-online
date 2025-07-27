"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RequestPanel } from "@/components/request-panel";
import { ResponsePanel } from "@/components/response-panel";
import RequestHistory from "@/components/request-history";
import ExampleApis from "@/components/example-apis";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
}

interface Header {
  key: string;
  value: string;
}

export default function ApiTester() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState(
    "https://jsonplaceholder.typicode.com/posts/1"
  );
  const [headers, setHeaders] = useState<Header[]>([
    { key: "Content-Type", value: "application/json" },
  ]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

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
  }, [body, htmlContent]);

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

    try {
      const startTime = Date.now();

      const headerObj: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.key && header.value) {
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

      const res = await fetch(url, options);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [method, url, headers, body, processTripleBackticks, validateJson]);

  const loadRequest = useCallback(
    (request: {
      method: string;
      url: string;
      headers: Array<{ key: string; value: string }>;
      body: string;
    }) => {
      setMethod(request.method);
      setUrl(request.url);
      setHeaders(request.headers);
      setBody(request.body);
    },
    []
  );

  const selectExampleApi = useCallback(
    (api: { method: string; url: string }) => {
      setMethod(api.method);
      setUrl(api.url);

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
                from: "Om Shejul <om@arthkin.com>",
                to: "Om Shejul <contact@omshejul.com>",
                subject: "Test Email",
                "body-type": "html",
                body: "<!DOCTYPE html><html><head><title>Test Email</title></head><body><h1>Hello World!</h1><p>This is a test email with <strong>HTML content</strong>.</p></body></html>",
              },
              null,
              2
            )
          );
        }
      }
    },
    []
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
    [processTripleBackticks, validateJson]
  );

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="container mx-auto p-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">API Tester</h1>
              <p className="text-muted-foreground">
                Test your APIs with a clean, modern interface
              </p>
            </div>
            <div className="flex items-center gap-3">
              <RequestHistory onLoadRequest={loadRequest} />
              <ExampleApis onSelectApi={selectExampleApi} />
              <ThemeToggle />
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg border border-border"
          >
            💡 Tip: Use{" "}
            <kbd className="px-2 py-1 bg-background rounded text-xs border border-border">
              Ctrl/Cmd + Enter
            </kbd>{" "}
            to send requests quickly • Wrap HTML content with{" "}
            <code className="px-1 bg-background rounded border border-border">
              ```
            </code>{" "}
            for automatic escaping
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
              jsonError={jsonError}
              showHtmlEditor={showHtmlEditor}
              setShowHtmlEditor={setShowHtmlEditor}
              htmlContent={htmlContent}
              setHtmlContent={setHtmlContent}
              onConvertHtmlToJson={convertHtmlToJson}
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
