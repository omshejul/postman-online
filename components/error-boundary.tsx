"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home, Bug, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  copied: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  showDetails?: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log error for monitoring (in production, send to error tracking service)
    this.logError(error, errorInfo);

    // Auto-retry for certain types of errors
    this.scheduleAutoRetry(error);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
    };

    console.error("Error Boundary caught an error:", errorReport);

    // In production, send to error tracking service like Sentry
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  private scheduleAutoRetry = (error: Error) => {
    const { maxRetries = MAX_RETRIES } = this.props;
    
    // Auto-retry for certain recoverable errors
    const isRecoverable = this.isRecoverableError(error);
    
    if (isRecoverable && this.state.retryCount < maxRetries) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, RETRY_DELAY * (this.state.retryCount + 1)); // Exponential backoff
    }
  };

  private isRecoverableError = (error: Error): boolean => {
    // Define which errors are recoverable and should auto-retry
    const recoverablePatterns = [
      /ChunkLoadError/i,
      /Loading chunk \d+ failed/i,
      /NetworkError/i,
      /fetch/i,
    ];

    return recoverablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      copied: false,
    }));
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      copied: false,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const errorDetails = `
Error: ${error.message}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo?.componentStack}

Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  private renderErrorDetails = () => {
    const { error, errorInfo } = this.state;
    const { showDetails = false } = this.props;

    if (!showDetails || !error) return null;

    return (
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Technical Details
        </summary>
        <div className="mt-2 p-3 bg-muted rounded-md overflow-auto max-h-40">
          <p className="font-semibold">Error Message:</p>
          <p className="mb-2 text-red-600">{error.message}</p>
          
          <p className="font-semibold">Stack Trace:</p>
          <pre className="text-xs whitespace-pre-wrap break-all">
            {error.stack}
          </pre>
          
          {errorInfo && (
            <>
              <p className="font-semibold mt-2">Component Stack:</p>
              <pre className="text-xs whitespace-pre-wrap break-all">
                {errorInfo.componentStack}
              </pre>
            </>
          )}
        </div>
      </details>
    );
  };

  render() {
    const { hasError, error, retryCount, copied } = this.state;
    const { children, fallback, maxRetries = MAX_RETRIES } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const canRetry = retryCount < maxRetries;
      const isAutoRetrying = this.retryTimeoutId !== null;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto mb-4"
                  >
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                  </motion.div>
                  <CardTitle className="text-xl">Something went wrong</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    {error?.message || "An unexpected error occurred while rendering this page."}
                  </p>

                  {retryCount > 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                      Retry attempt: {retryCount}/{maxRetries}
                    </div>
                  )}

                  {isAutoRetrying && (
                    <div className="text-center text-sm text-blue-600">
                      Auto-retrying in a moment...
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {canRetry && (
                      <Button 
                        onClick={this.handleRetry}
                        className="w-full"
                        disabled={isAutoRetrying}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    )}
                    
                    <Button 
                      onClick={this.handleReset}
                      variant="outline"
                      className="w-full"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Reset Application
                    </Button>
                    
                    <Button 
                      onClick={this.handleGoHome}
                      variant="secondary"
                      className="w-full"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Go to Homepage
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={this.copyErrorDetails}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copy Error Details
                        </>
                      )}
                    </Button>
                  </div>

                  {this.renderErrorDetails()}

                  <div className="text-center text-xs text-muted-foreground">
                    If this problem persists, please refresh the page or contact support.
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }

    return children;
  }
}

// Hook for programmatic error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Captured error:', error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}
