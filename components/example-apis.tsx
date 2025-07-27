"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExampleApi {
  name: string;
  method: string;
  url: string;
  description: string;
  category: string;
}

interface ExampleApisProps {
  onSelectApi: (api: Omit<ExampleApi, "description" | "category">) => void;
}

const exampleApis: ExampleApi[] = [
  {
    name: "Get Posts",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts",
    description: "Fetch all posts",
    category: "JSONPlaceholder",
  },
  {
    name: "Get Single Post",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Fetch a single post by ID",
    category: "JSONPlaceholder",
  },
  {
    name: "Create Post",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    description: "Create a new post",
    category: "JSONPlaceholder",
  },
  {
    name: "Update Post",
    method: "PUT",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Update an existing post",
    category: "JSONPlaceholder",
  },
  {
    name: "Delete Post",
    method: "DELETE",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Delete a post",
    category: "JSONPlaceholder",
  },
  {
    name: "Random User",
    method: "GET",
    url: "https://randomuser.me/api/",
    description: "Get random user data",
    category: "RandomUser",
  },
  {
    name: "Multiple Users",
    method: "GET",
    url: "https://randomuser.me/api/?results=5",
    description: "Get multiple random users",
    category: "RandomUser",
  },
  {
    name: "HTTP Status",
    method: "GET",
    url: "https://httpstat.us/200",
    description: "Test HTTP status codes",
    category: "HTTPBin",
  },
  {
    name: "Delay Response",
    method: "GET",
    url: "https://httpstat.us/200?sleep=2000",
    description: "Test with 2 second delay",
    category: "HTTPBin",
  },
  {
    name: "Echo Request",
    method: "POST",
    url: "https://httpbin.org/post",
    description: "Echo back the request data",
    category: "HTTPBin",
  },
  {
    name: "IP Address",
    method: "GET",
    url: "https://httpbin.org/ip",
    description: "Get your IP address",
    category: "HTTPBin",
  },
  {
    name: "User Agent",
    method: "GET",
    url: "https://httpbin.org/user-agent",
    description: "Get user agent info",
    category: "HTTPBin",
  },
];

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "POST":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "PUT":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "DELETE":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const CategorySection = React.memo(function CategorySection({
  category,
  apis,
  isExpanded,
  onToggle,
  onSelectApi,
}: {
  category: string;
  apis: ExampleApi[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelectApi: (api: ExampleApi) => void;
}) {
  return (
    <div>
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700"
      >
        <span className="font-medium text-gray-900 dark:text-white">
          {category}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-gray-50 dark:bg-gray-700/30"
          >
            {apis.map((api, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectApi(api)}
                className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-600/50 border-b border-gray-200 dark:border-gray-600 last:border-b-0 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 text-xs font-mono rounded ${getMethodColor(api.method)}`}>
                    {api.method}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {api.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate font-mono">
                  {api.url}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {api.description}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function ExampleApis({ onSelectApi }: ExampleApisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const categories = useMemo(() => 
    [...new Set(exampleApis.map((api) => api.category))], 
    []
  );

  const categorizedApis = useMemo(() => {
    const grouped: Record<string, ExampleApi[]> = {};
    exampleApis.forEach((api) => {
      if (!grouped[api.category]) {
        grouped[api.category] = [];
      }
      grouped[api.category].push(api);
    });
    return grouped;
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleSelectApi = useCallback(
    (api: ExampleApi) => {
      onSelectApi({
        name: api.name,
        method: api.method,
        url: api.url,
      });
      setIsOpen(false);
    },
    [onSelectApi]
  );

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <Zap className="w-4 h-4 mr-2" />
        Examples
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-96 z-20"
          >
            <Card className="shadow-lg">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Example APIs
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Click to load example requests
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {categories.map((category) => (
                  <CategorySection
                    key={category}
                    category={category}
                    apis={categorizedApis[category]}
                    isExpanded={expandedCategories.includes(category)}
                    onToggle={() => toggleCategory(category)}
                    onSelectApi={handleSelectApi}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
