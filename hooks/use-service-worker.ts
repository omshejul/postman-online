"use client";

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  isOnline: boolean;
  error: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    registration: null,
    updateAvailable: false,
    isOnline: true,
    error: null,
  });

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Service Workers not supported in this browser'
      }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('Service Worker registered successfully:', registration);

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
          error: null
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        // Handle controlling service worker changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        // Check for immediate updates
        await registration.update();

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setState(prev => ({
          ...prev,
          error: `Service Worker registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }));
      }
    };

    registerSW();

    // Listen for online/offline status
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setState(prev => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to update the service worker
  const updateServiceWorker = async () => {
    if (!state.registration) return;

    const waitingWorker = state.registration.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setState(prev => ({ ...prev, updateAvailable: false }));
    }
  };

  // Function to unregister service worker
  const unregisterServiceWorker = async () => {
    if (!state.registration) return;

    try {
      await state.registration.unregister();
      setState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
        updateAvailable: false
      }));
      console.log('Service Worker unregistered successfully');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  };

  // Function to clean up cache
  const cleanupCache = () => {
    if (!state.registration) return;

    const messageChannel = new MessageChannel();
    state.registration.active?.postMessage(
      { type: 'CLEANUP_CACHE' },
      [messageChannel.port2]
    );
  };

  // Function to show notification (if permission granted)
  const showNotification = async (title: string, options?: NotificationOptions) => {
    if (!state.registration) return;

    if (Notification.permission === 'granted') {
      await state.registration.showNotification(title, {
        icon: '/favicon-192x192.png',
        badge: '/favicon-192x192.png',
        ...options
      });
    }
  };

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return {
    ...state,
    updateServiceWorker,
    unregisterServiceWorker,
    cleanupCache,
    showNotification,
    requestNotificationPermission,
  };
}

// Hook for handling offline/online status with UI feedback
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show a brief "back online" message
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    downlink: (navigator as any).connection?.downlink || 0,
  };
}