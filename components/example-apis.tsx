"use client";

import { useState } from "react";
import { Zap, ChevronDown, ChevronRight } from "lucide-react";

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

export default function ExampleApis({ onSelectApi }: ExampleApisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const categories = [...new Set(exampleApis.map((api) => api.category))];

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectApi = (api: ExampleApi) => {
    onSelectApi({
      name: api.name,
      method: api.method,
      url: api.url,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm">Examples</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Example APIs
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Click to load example requests
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {categories.map((category) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {category}
                  </span>
                  {expandedCategories.includes(category) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {expandedCategories.includes(category) && (
                  <div className="bg-gray-50 dark:bg-gray-700">
                    {exampleApis
                      .filter((api) => api.category === category)
                      .map((api, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectApi(api)}
                          className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 text-xs font-mono rounded ${
                                api.method === "GET"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : api.method === "POST"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : api.method === "PUT"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : api.method === "DELETE"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              }`}
                            >
                              {api.method}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {api.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {api.url}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {api.description}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
