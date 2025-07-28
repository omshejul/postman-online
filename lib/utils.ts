import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function getStatusColor(status: number, theme?: string): string {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (status >= 200 && status < 300) {
    return isDark ? "text-green-400" : "text-green-600";
  }
  if (status >= 400 && status < 500) {
    return isDark ? "text-yellow-400" : "text-yellow-600";
  }
  if (status >= 500) {
    return "text-destructive";
  }
  return "text-muted-foreground";
}
