import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";
import { PerformanceMonitor } from "@/components/performance-monitor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "API Tester - Modern Postman Alternative",
  description:
    "Test your APIs with a clean, modern interface. Built with Next.js, React, and Tailwind CSS.",
  keywords: ["API", "testing", "Postman", "REST", "HTTP", "developer tools"],
  authors: [{ name: "Om Shejul" }],
  creator: "Om Shejul",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-128x128.png", sizes: "128x128", type: "image/png" },
    ],
  },
  openGraph: {
    title: "API Tester - Modern Postman Alternative",
    description: "Test your APIs with a clean, modern interface",
    type: "website",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

function handlePerformanceMetric(metric: { name: string; value: number; rating: string }) {
  // Log poor performance metrics for monitoring
  if (metric.rating === 'poor') {
    console.warn(`Poor performance detected: ${metric.name} = ${metric.value}ms`);
  }
  
  // In production, you could send metrics to analytics
  // Example: analytics.track('performance_metric', metric);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for common API endpoints */}
        <link rel="dns-prefetch" href="https://jsonplaceholder.typicode.com" />
        <link rel="dns-prefetch" href="https://httpbin.org" />
        <link rel="dns-prefetch" href="https://reqres.in" />
        
        {/* Critical CSS for faster rendering */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { margin: 0; padding: 0; }
            .loading-skeleton { 
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary 
            showDetails={process.env.NODE_ENV === 'development'}
            onError={(error, errorInfo) => {
              // In production, send to error tracking service
              console.error('Application Error:', { error, errorInfo });
            }}
          >
            {children}
            <PerformanceMonitor 
              onMetric={handlePerformanceMetric}
              debug={process.env.NODE_ENV === 'development'}
            />
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
