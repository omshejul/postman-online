"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, X, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Header {
  key: string;
  value: string;
}

interface RequestPanelProps {
  method: string;
  setMethod: (method: string) => void;
  url: string;
  setUrl: (url: string) => void;
  headers: Header[];
  setHeaders: (headers: Header[]) => void;
  body: string;
  setBody: (body: string) => void;
  loading: boolean;
  onSendRequest: () => void;
  onSaveRequest: () => void;
  jsonError: string | null;
  showHtmlEditor: boolean;
  setShowHtmlEditor: (show: boolean) => void;
  htmlContent: string;
  setHtmlContent: (content: string) => void;
  onConvertHtmlToJson: () => void;
}

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"];

export const RequestPanel = React.memo(function RequestPanel({
  method,
  setMethod,
  url,
  setUrl,
  headers,
  setHeaders,
  body,
  setBody,
  loading,
  onSendRequest,
  onSaveRequest,
  jsonError,
  showHtmlEditor,
  setShowHtmlEditor,
  htmlContent,
  setHtmlContent,
  onConvertHtmlToJson,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState<'json' | 'html'>('json');

  const hasBodySection = useMemo(() => 
    METHODS_WITH_BODY.includes(method), 
    [method]
  );

  const addHeader = useCallback(() => {
    setHeaders([...headers, { key: "", value: "" }]);
  }, [headers, setHeaders]);

  const updateHeader = useCallback(
    (index: number, field: "key" | "value", value: string) => {
      const newHeaders = [...headers];
      newHeaders[index][field] = value;
      setHeaders(newHeaders);
    },
    [headers, setHeaders]
  );

  const removeHeader = useCallback(
    (index: number) => {
      setHeaders(headers.filter((_, i) => i !== index));
    },
    [headers, setHeaders]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSendRequest();
    }
  }, [onSendRequest]);

  const formatJson = useCallback(() => {
    try {
      const formatted = JSON.stringify(JSON.parse(body), null, 2);
      setBody(formatted);
    } catch (error) {
      // JSON is invalid, can't format
    }
  }, [body, setBody]);

  const loadExample = useCallback(() => {
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
  }, [setBody]);

  const loadHtmlTemplate = useCallback(() => {
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
  }, [setHtmlContent]);

  return (
    <Card className="w-full bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-lg font-semibold">Request</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveRequest}
          className="text-gray-600 dark:text-gray-400"
        >
          Save
        </Button>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Method and URL */}
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[100px]"
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL"
            className="flex-1"
          />
          <Button
            variant="blue"
            onClick={onSendRequest}
            loading={loading}
            className="min-w-[80px]"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </motion.div>

        {/* Headers Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Headers
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={addHeader}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Header
            </Button>
          </div>
          
          <AnimatePresence>
            <div className="space-y-2">
              {headers.map((header, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2"
                >
                  <Input
                    value={header.key}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                    placeholder="Header name"
                    className="flex-1"
                  />
                  <Input
                    value={header.value}
                    onChange={(e) => updateHeader(index, "value", e.target.value)}
                    placeholder="Header value"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHeader(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>

        {/* Request Body */}
        {hasBodySection && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Body
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'json' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('json');
                    setShowHtmlEditor(false);
                  }}
                >
                  <Code className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant={activeTab === 'html' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('html');
                    setShowHtmlEditor(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  HTML Editor
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!showHtmlEditor ? (
                <motion.div
                  key="json-editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter request body (JSON) - Use ``` to wrap HTML content"
                    rows={8}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                      jsonError
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  />
                  {jsonError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      <strong>JSON Error:</strong> {jsonError}
                    </motion.div>
                  )}
                  
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={formatJson}>
                      Format JSON
                    </Button>
                    <Button variant="ghost" size="sm" onClick={loadExample}>
                      Load Example
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="html-editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>HTML Editor Mode:</strong> Write clean HTML here. 
                      It will be automatically converted to properly escaped JSON.
                    </p>
                  </div>
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="Write your HTML content here (no need to escape quotes)..."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="mt-3 flex gap-2">
                    <Button variant="green" size="sm" onClick={onConvertHtmlToJson}>
                      Convert to JSON
                    </Button>
                    <Button variant="ghost" size="sm" onClick={loadHtmlTemplate}>
                      Load Template
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
});