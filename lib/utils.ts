import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-green-600";
  if (status >= 400 && status < 500) return "text-yellow-600";
  if (status >= 500) return "text-red-600";
  return "text-gray-600";
}
