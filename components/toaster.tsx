"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as any}
      toastOptions={{
        style: {
          backgroundColor: "var(--accent)",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  );
}
