"use client";

import { useState } from "react";
import {
  Send,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Save,
} from "lucide-react";
import RequestHistory from "@/components/request-history";
import ExampleApis from "@/components/example-apis";

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

export default function ApiTester() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState(
    "https://jsonplaceholder.typicode.com/posts/1"
  );
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json" },
  ]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const saveRequest = () => {
    const requestData = {
      method,
      url,
      headers,
      body,
    };

    const saved = localStorage.getItem("api-tester-history");
    const savedRequests = saved ? JSON.parse(saved) : [];

    const newRequest = {
      ...requestData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updated = [newRequest, ...savedRequests.slice(0, 9)];
    localStorage.setItem("api-tester-history", JSON.stringify(updated));
  };

  const loadRequest = (request: {
    method: string;
    url: string;
    headers: Array<{ key: string; value: string }>;
    body: string;
  }) => {
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers);
    setBody(request.body);
  };

  const selectExampleApi = (api: { method: string; url: string }) => {
    setMethod(api.method);
    setUrl(api.url);

    // Set sample body for POST/PUT requests
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
  };

  // Keyboard shortcut for sending request (Ctrl/Cmd + Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      sendRequest();
    }
  };

  const httpMethods = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
  ];

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const updateHeader = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const validateJson = (jsonString: string): boolean => {
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
  };

  const convertHtmlToJson = () => {
    try {
      // Parse the current JSON to get the structure
      const currentJson = body ? JSON.parse(body) : {};

      // Update with the HTML content
      const updatedJson = {
        ...currentJson,
        "body-type": "html",
        body: htmlContent,
      };

      // Convert back to formatted JSON
      setBody(JSON.stringify(updatedJson, null, 2));
      setJsonError(null);
      setShowHtmlEditor(false);
    } catch (error) {
      setJsonError("Failed to convert HTML to JSON");
    }
  };

  const processTripleBackticks = (jsonString: string): string => {
    // Find content wrapped in triple backticks and convert to JSON string
    return jsonString.replace(/```([\s\S]*?)```/g, (match, content) => {
      // Escape quotes and newlines for JSON
      const escaped = content
        .replace(/\\/g, "\\\\") // Escape backslashes first
        .replace(/"/g, '\\"') // Escape quotes
        .replace(/\n/g, "\\n") // Escape newlines
        .replace(/\r/g, "\\r") // Escape carriage returns
        .replace(/\t/g, "\\t"); // Escape tabs

      return `"${escaped}"`;
    });
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const sendRequest = async () => {
    // Process triple backticks if present
    let processedBody = body;
    if (body && body.includes("```")) {
      processedBody = processTripleBackticks(body);
      setBody(processedBody);
    }

    // Validate JSON if body is present
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
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400 && status < 500) return "text-yellow-600";
    if (status >= 500) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            API Tester
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test your APIs with a clean, Postman-like interface
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            💡 Tip: Use Ctrl/Cmd + Enter to send requests quickly • Wrap HTML
            content with \`\`\` for automatic escaping
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <RequestHistory onLoadRequest={loadRequest} />
                <ExampleApis onSelectApi={selectExampleApi} />
              </div>
              <button
                onClick={saveRequest}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
            </div>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Request
              </h2>

              {/* Method and URL */}
              <div className="flex gap-2 mb-4">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {httpMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter URL"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendRequest}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md flex items-center gap-2 transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </button>
              </div>

              {/* Headers */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Headers
                  </h3>
                  <button
                    onClick={addHeader}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    + Add Header
                  </button>
                </div>
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) =>
                          updateHeader(index, "key", e.target.value)
                        }
                        placeholder="Header name"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) =>
                          updateHeader(index, "value", e.target.value)
                        }
                        placeholder="Header value"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="px-2 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Body */}
              {["POST", "PUT", "PATCH"].includes(method) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Body
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowHtmlEditor(false)}
                        className={`text-xs px-2 py-1 rounded ${
                          !showHtmlEditor
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => setShowHtmlEditor(true)}
                        className={`text-xs px-2 py-1 rounded ${
                          showHtmlEditor
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        HTML Editor
                      </button>
                    </div>
                  </div>

                  {!showHtmlEditor ? (
                    // JSON Editor
                    <div>
                      <textarea
                        value={body}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBody(value);

                          // Process triple backticks for validation
                          let processedValue = value;
                          if (value.includes("```")) {
                            processedValue = processTripleBackticks(value);
                          }
                          validateJson(processedValue);
                        }}
                        placeholder="Enter request body (JSON) - Use ``` to wrap HTML content"
                        rows={6}
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          jsonError
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      />
                      {jsonError && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                          <strong>JSON Error:</strong> {jsonError}
                        </div>
                      )}
                      {body.includes("```") && !jsonError && (
                        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                          💡 Triple backticks detected - will be automatically
                          processed when sending
                        </div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            try {
                              const formatted = JSON.stringify(
                                JSON.parse(body),
                                null,
                                2
                              );
                              setBody(formatted);
                              setJsonError(null);
                            } catch (error) {
                              // JSON is invalid, can't format
                            }
                          }}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Format JSON
                        </button>
                        <button
                          onClick={() => {
                            setBody(`{
  "from": "Om Shejul <om@arthkin.com>",
  "to": "Om Shejul <contact@omshejul.com>",
  "subject": "Test Email",
  "body-type": "html",
  "body": \`\`\`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
    <title>Test Email</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #f0f0f0; padding: 20px; }
        .content { padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hello World!</h1>
    </div>
    <div class="content">
        <p>This is a test email with <strong>HTML content</strong>.</p>
        <p>You can write any HTML here with quotes and DOCTYPE declarations!</p>
    </div>
</body>
</html>\`\`\`
}`);
                            setJsonError(null);
                          }}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          Load Triple Backtick Example
                        </button>
                      </div>
                    </div>
                  ) : (
                    // HTML Editor
                    <div>
                      <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          💡 <strong>HTML Editor Mode:</strong> Write clean HTML
                          here. It will be automatically converted to properly
                          escaped JSON when you click "Convert to JSON".
                        </p>
                      </div>
                      <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder="Write your HTML content here (no need to escape quotes)..."
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={convertHtmlToJson}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                        >
                          Convert to JSON
                        </button>
                        <button
                          onClick={() => {
                            setHtmlContent(`<!DOCTYPE html>
<html>
<head>
    <title>Test Email</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #f0f0f0; padding: 20px; }
        .content { padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hello World!</h1>
    </div>
    <div class="content">
        <p>This is a test email with <strong>HTML content</strong>.</p>
        <p>You can write any HTML here without worrying about escaping quotes!</p>
    </div>
</body>
</html>`);
                          }}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          Load HTML Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Response Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Response
              </h2>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Sending request...
                  </span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="mt-1 text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </p>
                </div>
              )}

              {response && (
                <div className="space-y-4">
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
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{response.time}ms</span>
                    </div>
                  </div>

                  {/* Response Headers */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Response Headers
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 max-h-32 overflow-y-auto">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="text-sm font-mono">
                          <span className="text-gray-600 dark:text-gray-400">
                            {key}:
                          </span>{" "}
                          <span className="text-gray-900 dark:text-white">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response Body */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Response Body
                    </h3>
                    <pre className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm font-mono text-gray-900 dark:text-white overflow-x-auto max-h-96 overflow-y-auto">
                      {typeof response.data === "object"
                        ? JSON.stringify(response.data, null, 2)
                        : response.data}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
