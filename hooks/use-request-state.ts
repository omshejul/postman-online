"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { generateId } from "@/lib/utils";

interface Header {
  id: string;
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
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  sameSite: "strict" as const,
  secure:
    typeof window !== "undefined" && window.location.protocol === "https:",
};

const DEFAULT_STATE: RequestState = {
  method: "GET",
  url: "",
  headers: [
    { id: generateId(), key: "Content-Type", value: "application/json" },
  ],
  body: "",
};

export function useRequestState() {
  const [state, setState] = useState<RequestState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Save state to cookies whenever it changes
  const saveState = useCallback((newState: RequestState) => {
    try {
      setState(newState);
      Cookies.set(COOKIE_NAME, JSON.stringify(newState), COOKIE_OPTIONS);
    } catch (error) {
      console.warn("Failed to save request state to cookies:", error);
    }
  }, []);

  // Individual setters that automatically save
  const setMethod = useCallback(
    (method: string) => {
      console.log("setMethod called with:", method, "current state:", state);
      setState((prevState) => {
        const newState = { ...prevState, method };
        try {
          Cookies.set(COOKIE_NAME, JSON.stringify(newState), COOKIE_OPTIONS);
        } catch (error) {
          console.warn("Failed to save request state to cookies:", error);
        }
        return newState;
      });
    },
    [state]
  );

  const setUrl = useCallback(
    (url: string) => {
      console.log("setUrl called with:", url, "current state:", state);
      setState((prevState) => {
        const newState = { ...prevState, url };
        try {
          Cookies.set(COOKIE_NAME, JSON.stringify(newState), COOKIE_OPTIONS);
        } catch (error) {
          console.warn("Failed to save request state to cookies:", error);
        }
        return newState;
      });
    },
    [state]
  );

  const setHeaders = useCallback(
    (headers: Header[]) => {
      console.log("setHeaders called with:", headers, "current state:", state);
      setState((prevState) => {
        const newState = { ...prevState, headers };
        try {
          Cookies.set(COOKIE_NAME, JSON.stringify(newState), COOKIE_OPTIONS);
        } catch (error) {
          console.warn("Failed to save request state to cookies:", error);
        }
        return newState;
      });
    },
    [state]
  );

  const setBody = useCallback(
    (body: string) => {
      console.log("setBody called with:", body, "current state:", state);
      setState((prevState) => {
        const newState = { ...prevState, body };
        try {
          Cookies.set(COOKIE_NAME, JSON.stringify(newState), COOKIE_OPTIONS);
        } catch (error) {
          console.warn("Failed to save request state to cookies:", error);
        }
        return newState;
      });
    },
    [state]
  );

  // Load a complete request (from history or examples)
  const loadRequest = useCallback(
    (request: Omit<RequestState, "timestamp" | "id">) => {
      const newState: RequestState = {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      };
      saveState(newState);
    },
    [saveState]
  );

  // Clear state and reset to default
  const clearState = useCallback(() => {
    saveState(DEFAULT_STATE);
  }, [saveState]);

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
