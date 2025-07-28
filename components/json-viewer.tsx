"use client";

import React from "react";
import ReactJson from "react-json-view";
import { useTheme } from "next-themes";

interface JsonViewerProps {
  data: unknown;
  className?: string;
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
      base08: "#ff5555", // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
      base09: "#ff9500", // Integers, Boolean, Constants, XML Attributes, Markup Link Url (Numbers - Orange)
      base0A: "#f1fa8c", // Classes, Markup Bold, Search Text Background
      base0B: "#50fa7b", // Strings, Inherited Class, Markup Code, Diff Inserted (Strings - Green)
      base0C: "#8be9fd", // Support, Regular Expressions, Escape Characters, Markup Quotes
      base0D: "#bd93f9", // Functions, Methods, Attribute IDs, Headings
      base0E: "#ff79c6", // Keywords, Storage, Selector, Markup Italic, Diff Changed
      base0F: "#ffb86c", // Deprecated, Opening/Closing Embedded Language Tags
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
      base08: "#e45649", // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
      base09: "#d73a00", // Integers, Boolean, Constants, XML Attributes, Markup Link Url (Numbers - Dark Orange)
      base0A: "#c18401", // Classes, Markup Bold, Search Text Background
      base0B: "#50a14f", // Strings, Inherited Class, Markup Code, Diff Inserted (Strings - Green)
      base0C: "#0184bc", // Support, Regular Expressions, Escape Characters, Markup Quotes
      base0D: "#4078f2", // Functions, Methods, Attribute IDs, Headings
      base0E: "#a626a4", // Keywords, Storage, Selector, Markup Italic, Diff Changed
      base0F: "#986801", // Deprecated, Opening/Closing Embedded Language Tags
    },
  },
};

export function JsonViewer({
  data,
  className,
  isRawView = false,
}: JsonViewerProps) {
  const { theme, systemTheme } = useTheme();
  const isDark = theme === "system" ? systemTheme === "dark" : theme === "dark";

  return (
    <div className={className}>
      {isRawView ? (
        <pre className="font-mono text-sm">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <ReactJson
          src={data as object}
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
