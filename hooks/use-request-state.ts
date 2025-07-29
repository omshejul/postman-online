"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Cookies from "js-cookie";

interface Header {
  key: string;
  value: string;
}

interface RequestState {
  method: string;
  url: string;
  headers: Header[];
  body: string;
}

const COOKIE_NAME = "api-tester-state";
const DEBOUNCE_DELAY = 500; // 500ms debounce
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  sameSite: "strict" as const,
  secure:
    typeof window !== "undefined" && window.location.protocol === "https:",
};

const DEFAULT_STATE: RequestState = {
  method: "GET",
  url: "https://jsonplaceholder.typicode.com/posts/1",
  headers: [{ key: "Content-Type", value: "application/json" }],
  body: "",
};

export function useRequestState() {
  const [state, setState] = useState<RequestState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedStateRef = useRef<string>("");

  // Debounced save function
  const debouncedSave = useCallback((newState: RequestState) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const stateString = JSON.stringify(newState);
        
        // Only save if state has actually changed
        if (stateString !== lastSavedStateRef.current) {
          Cookies.set(COOKIE_NAME, stateString, COOKIE_OPTIONS);
          lastSavedStateRef.current = stateString;
        }
      } catch (error) {
        console.warn("Failed to save request state to cookies:", error);
      }
    }, DEBOUNCE_DELAY);
  }, []);

  // Load state from cookies on mount
  useEffect(() => {
    try {
      const savedState = Cookies.get(COOKIE_NAME);
      if (savedState) {
        const parsedState = JSON.parse(savedState) as RequestState;

        // Validate the structure
        if (
          parsedState &&
          typeof parsedState.method === "string" &&
          typeof parsedState.url === "string" &&
          Array.isArray(parsedState.headers) &&
          typeof parsedState.body === "string"
        ) {
          setState(parsedState);
          lastSavedStateRef.current = savedState;
        }
      }
    } catch (error) {
      console.warn("Failed to load request state from cookies:", error);
      // Reset to default if corrupted
      Cookies.remove(COOKIE_NAME);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Optimized state updater
  const updateState = useCallback((updater: (prevState: RequestState) => RequestState) => {
    setState((prevState) => {
      const newState = updater(prevState);
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  // Individual setters that use the optimized updater
  const setMethod = useCallback(
    (method: string) => {
      updateState((prevState) => ({ ...prevState, method }));
    },
    [updateState]
  );

  const setUrl = useCallback(
    (url: string) => {
      updateState((prevState) => ({ ...prevState, url }));
    },
    [updateState]
  );

  const setHeaders = useCallback(
    (headers: Header[]) => {
      updateState((prevState) => ({ ...prevState, headers }));
    },
    [updateState]
  );

  const setBody = useCallback(
    (body: string) => {
      updateState((prevState) => ({ ...prevState, body }));
    },
    [updateState]
  );

  // Immediate save function (for complete request loads)
  const saveStateImmediately = useCallback((newState: RequestState) => {
    try {
      setState(newState);
      const stateString = JSON.stringify(newState);
      Cookies.set(COOKIE_NAME, stateString, COOKIE_OPTIONS);
      lastSavedStateRef.current = stateString;
    } catch (error) {
      console.warn("Failed to save request state to cookies:", error);
    }
  }, []);

  // Load a complete request (from history or examples)
  const loadRequest = useCallback(
    (request: Omit<RequestState, "timestamp" | "id">) => {
      const newState: RequestState = {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      };
      saveStateImmediately(newState);
    },
    [saveStateImmediately]
  );

  // Clear state and reset to default
  const clearState = useCallback(() => {
    saveStateImmediately(DEFAULT_STATE);
  }, [saveStateImmediately]);

  return {
    // State values
    method: state.method,
    url: state.url,
    headers: state.headers,
    body: state.body,
    isLoaded,

    // Setters
    setMethod,
    setUrl,
    setHeaders,
    setBody,
    loadRequest,
    clearState,
  };
}
