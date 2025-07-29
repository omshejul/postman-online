"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  Delete,
  Code,
  Eye,
  Check,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, generateId } from "@/lib/utils";

interface Header {
  id: string;
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
  onClearState?: () => void;
  jsonError: string | null;
  showHtmlEditor: boolean;
  setShowHtmlEditor: (show: boolean) => void;
  htmlContent: string;
  setHtmlContent: (content: string) => void;
  onConvertHtmlToJson: () => void;
  requestSuccess?: boolean;
  requestError?: string | null;
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
  onClearState,
  jsonError,
  showHtmlEditor,
  setShowHtmlEditor,
  htmlContent,
  setHtmlContent,
  onConvertHtmlToJson,
  requestSuccess = false,
  requestError = null,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState<"json" | "html">("json");
  const [buttonState, setButtonState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const hasBodySection = useMemo(
    () => METHODS_WITH_BODY.includes(method),
    [method]
  );

  const addHeader = useCallback(() => {
    setHeaders([...headers, { id: generateId(), key: "", value: "" }]);
  }, [headers, setHeaders]);

  const updateHeader = useCallback(
    (id: string, field: "key" | "value", value: string) => {
      const newHeaders = headers.map((header) =>
        header.id === id ? { ...header, [field]: value } : header
      );
      setHeaders(newHeaders);
    },
    [headers, setHeaders]
  );

  const removeHeader = useCallback(
    (id: string) => {
      setHeaders(headers.filter((header) => header.id !== id));
    },
    [headers, setHeaders]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSendRequest();
      }
    },
    [onSendRequest]
  );

  const formatJson = useCallback(() => {
    try {
      const formatted = JSON.stringify(JSON.parse(body), null, 2);
      setBody(formatted);
    } catch {
      // JSON is invalid, can't format
    }
  }, [body, setBody]);

  const loadExample = useCallback(() => {
    setBody(`{
  "from": "John Doe <sender@example.com>",
  "to": "Jane Smith <recipient@example.com>",
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

  const handleSendRequest = useCallback(() => {
    onSendRequest();
  }, [onSendRequest]);

  // Reset button state when loading changes
  React.useEffect(() => {
    if (loading) {
      setButtonState("loading");
    } else {
      if (requestSuccess) {
        setButtonState("success");
        setTimeout(() => setButtonState("idle"), 2000);
      } else if (requestError) {
        setButtonState("error");
        setTimeout(() => setButtonState("idle"), 3000);
      } else {
        setButtonState("idle");
      }
    }
  }, [loading, requestSuccess, requestError]);

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full"
            />
            Sending...
          </>
        );
      case "success":
        return (
          <>
            <Check className="w-4 h-4 mr-2" />
            Sent!
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Error
          </>
        );
      default:
        return (
          <>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Send className="w-4 h-4 mr-2" />
            </motion.div>
            Send
          </>
        );
    }
  };

  const getButtonVariant = () => {
    switch (buttonState) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
        <CardTitle className="text-lg font-semibold">Request</CardTitle>
        <div className="flex items-center gap-2">
          {onClearState && (
            <Button variant="ghost" size="sm" onClick={onClearState}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Method and URL */}
        <motion.div
          className="flex gap-2 flex-wrap md:flex-nowrap"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Tooltip
            open={
              requestError
                ? requestError.includes("Please enter a valid URL")
                : false
            }
          >
            <TooltipTrigger asChild>
              <div className="flex gap-2 w-full flex-wrap">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent max-w-[15ch]"
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
                  className="flex-1 min-w-[25ch]"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Enter a URL
              </div>
            </TooltipContent>
          </Tooltip>
          <motion.div
            layout
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            whileTap={{ scale: 0.98 }}
            whileFocus={{
              scale: 1.01,
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17,
              layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
            className="w-full md:w-auto"
          >
            <Button
              onClick={handleSendRequest}
              disabled={loading || buttonState === "loading"}
              variant={getButtonVariant()}
              className={cn(
                "relative overflow-hidden transition-all duration-300 ease-out w-full md:w-auto",
                buttonState === "success" && "bg-green-600 hover:bg-green-700",
                buttonState === "error" && "bg-red-600 hover:bg-red-700"
              )}
              style={{
                width: "100%",

                transition:
                  "width 0.3s ease-out, background-color 0.3s ease-out",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={buttonState}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.05,
                    ease: [0.4, 0, 0.2, 1],
                    scale: { duration: 0.15 },
                  }}
                  className="flex items-center justify-center w-full"
                >
                  {getButtonContent()}
                </motion.div>
              </AnimatePresence>

              {/* Success ripple effect */}
              {buttonState === "success" && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 bg-green-400 rounded-md"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                      repeat: 2,
                    }}
                    className="absolute inset-0 bg-green-300 rounded-md blur-sm"
                  />
                </>
              )}

              {/* Error shake effect */}
              {buttonState === "error" && (
                <motion.div
                  animate={{
                    x: [-2, 2, -2, 2, -2, 2, 0],
                    rotate: [-1, 1, -1, 1, -1, 1, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                />
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Headers Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Headers</h3>
            <Button variant="ghost" size="sm" onClick={addHeader}>
              <Plus className="w-4 h-4 mr-1" />
              Add Header
            </Button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {headers.map((header, index) => (
                <motion.div
                  key={header.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="grid grid-cols-[1fr_auto] gap-2 sm:items-center"
                >
                  <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <Input
                      value={header.key}
                      onChange={(e) =>
                        updateHeader(header.id, "key", e.target.value)
                      }
                      placeholder="Header name"
                      className="flex-1"
                    />
                    <Input
                      value={header.value}
                      onChange={(e) =>
                        updateHeader(header.id, "value", e.target.value)
                      }
                      placeholder="Header value"
                      className="flex-1"
                    />
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeHeader(header.id)}
                        className="text-destructive hover:text-destructive h-full border-destructive/30 bg-destructive/5"
                      >
                        <Delete className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove header</p>
                    </TooltipContent>
                  </Tooltip>
                  {index < headers.length - 1 && (
                    <div className="sm:hidden mb-2">
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Request Body */}
        {hasBodySection && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Body</h3>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "json" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("json");
                    setShowHtmlEditor(false);
                  }}
                >
                  <Code className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant={activeTab === "html" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("html");
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
                      "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-mono text-sm focus:ring-2 focus:ring-ring focus:border-transparent resize-none",
                      jsonError
                        ? "border-destructive focus:border-destructive"
                        : "border-input"
                    )}
                  />
                  {jsonError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="mt-2 text-sm text-destructive"
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
                  <div className="mb-3 p-3 bg-muted border border-border rounded-md">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>HTML Editor Mode:</strong> Write clean HTML
                      here. It will be automatically converted to properly
                      escaped JSON.
                    </p>
                  </div>
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="Write your HTML content here (no need to escape quotes)..."
                    rows={10}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-mono text-sm focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  />
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onConvertHtmlToJson}
                    >
                      Convert to JSON
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadHtmlTemplate}
                    >
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
