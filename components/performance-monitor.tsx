"use client";

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  CLS: number;
  FID: number;
  FCP: number;
  LCP: number;
  TTFB: number;
}

interface PerformanceMonitorProps {
  onMetric?: (metric: { name: string; value: number; rating: 'good' | 'needs-improvement' | 'poor' }) => void;
  debug?: boolean;
}

export function PerformanceMonitor({ onMetric, debug = false }: PerformanceMonitorProps) {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric = {
          name: entry.name || entry.entryType,
          value: entry.value || entry.duration,
          rating: getRating(entry.name || entry.entryType, entry.value || entry.duration)
        };

        // Store metric
        metricsRef.current[entry.name as keyof PerformanceMetrics] = metric.value;

        // Report metric
        onMetric?.(metric);

        if (debug) {
          console.log('Performance Metric:', metric);
        }
      }
    });

    // Observe different performance entry types
    try {
      observer.observe({ entryTypes: ['navigation', 'measure', 'paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    // Web Vitals - CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          const metric = {
            name: 'CLS',
            value: clsValue,
            rating: getRating('CLS', clsValue)
          };
          onMetric?.(metric);
          if (debug) console.log('CLS:', metric);
        }
      }
    });

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }

    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric = {
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: getRating('FID', entry.processingStart - entry.startTime)
        };
        onMetric?.(metric);
        if (debug) console.log('FID:', metric);
      }
    });

    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Resources taking > 1s
          console.warn('Slow resource:', entry.name, entry.duration + 'ms');
        }
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }

    return () => {
      observer.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
      resourceObserver.disconnect();
    };
  }, [onMetric, debug]);

  // Report initial page load metrics
  useEffect(() => {
    const reportInitialMetrics = () => {
      if (typeof window === 'undefined') return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const metrics = {
          TTFB: navigation.responseStart - navigation.fetchStart,
          DOMLoad: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          WindowLoad: navigation.loadEventEnd - navigation.fetchStart,
        };

        Object.entries(metrics).forEach(([name, value]) => {
          const metric = {
            name,
            value,
            rating: getRating(name, value)
          };
          onMetric?.(metric);
          if (debug) console.log(`${name}:`, metric);
        });
      }

      // Paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        const metric = {
          name: entry.name,
          value: entry.startTime,
          rating: getRating(entry.name, entry.startTime)
        };
        onMetric?.(metric);
        if (debug) console.log(`${entry.name}:`, metric);
      });
    };

    // Wait for page to load completely
    if (document.readyState === 'complete') {
      setTimeout(reportInitialMetrics, 100);
    } else {
      window.addEventListener('load', () => setTimeout(reportInitialMetrics, 100));
    }
  }, [onMetric, debug]);

  return null; // This is a utility component with no UI
}

function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    'CLS': [0.1, 0.25],
    'FID': [100, 300],
    'FCP': [1800, 3000],
    'first-contentful-paint': [1800, 3000],
    'LCP': [2500, 4000],
    'largest-contentful-paint': [2500, 4000],
    'TTFB': [800, 1800],
    'DOMLoad': [2000, 4000],
    'WindowLoad': [3000, 6000],
  };

  const [good, poor] = thresholds[metricName] || [1000, 2000];
  
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

// Hook for using performance metrics
export function usePerformanceMetrics() {
  const metricsRef = useRef<Array<{ name: string; value: number; rating: string; timestamp: number }>>([]);

  const addMetric = (metric: { name: string; value: number; rating: string }) => {
    metricsRef.current.push({
      ...metric,
      timestamp: Date.now()
    });
  };

  const getMetrics = () => metricsRef.current;
  
  const getAverageMetric = (metricName: string) => {
    const metrics = metricsRef.current.filter(m => m.name === metricName);
    if (metrics.length === 0) return null;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  };

  return {
    addMetric,
    getMetrics,
    getAverageMetric
  };
}