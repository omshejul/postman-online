"use client";

import React from "react";
import ReactJson from "react-json-view";
import { useTheme } from "next-themes";

interface JsonViewerProps {
  data: unknown;
  className?: string;
  onToggleView?: (isRaw: boolean) => void;
  isRawView?: boolean;
}

const jsonThemes = {
  dracula: {
    dark: {
      base00: "transparent",
      base01: "#2d2d2d",
      base02: "#393939",
      base03: "#777777",
      base04: "#999999",
      base05: "#cccccc",
      base06: "#e6e6e6",
      base07: "#ffffff",
      base08: "#ff5555", // red
      base09: "#ffb86c", // numbers
      base0A: "#f1fa8c", // boolean
      base0B: "#50fa7b", // string
      base0C: "#8be9fd", // date
      base0D: "#bd93f9", // property
      base0E: "#ff79c6", // null
      base0F: "#ffb86c", // undefined
    },
    light: {
      base00: "transparent",
      base01: "#f5f5f5",
      base02: "#e0e0e0",
      base03: "#999999",
      base04: "#666666",
      base05: "#333333",
      base06: "#222222",
      base07: "#111111",
      base08: "#e45649", // red
      base09: "#986801", // numbers
      base0A: "#c18401", // boolean
      base0B: "#50a14f", // string
      base0C: "#0184bc", // date
      base0D: "#4078f2", // property
      base0E: "#a626a4", // null
      base0F: "#986801", // undefined
    },
  },
};

export function JsonViewer({ data, className, onToggleView, isRawView = false }: JsonViewerProps) {
  const { theme, systemTheme } = useTheme();
  const isDark = theme === "system" ? systemTheme === "dark" : theme === "dark";

  const handleToggle = () => {
    const newValue = !isRawView;
    onToggleView?.(newValue);
  };

  return (
    <div className={className}>
      {isRawView ? (
        <pre className="font-mono text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <ReactJson
          src={data as any}
          theme={jsonThemes.dracula[isDark ? "dark" : "light"]}
          name={null}
          displayDataTypes={false}
          enableClipboard={false}
          style={{
            backgroundColor: "transparent",
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.875rem",
          }}
        />
      )}
    </div>
  );
}
