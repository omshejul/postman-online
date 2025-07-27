"use client";

import React, { useCallback, useMemo } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function ExampleApis({ onSelectApi }: ExampleApisProps) {
  const categories = useMemo(
    () => [...new Set(exampleApis.map((api) => api.category))],
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

  const handleSelectApi = useCallback(
    (api: ExampleApi) => {
      onSelectApi({
        name: api.name,
        method: api.method,
        url: api.url,
      });
    },
    [onSelectApi]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Zap className="w-4 h-4 mr-2" />
          Examples
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel>
          <div>
            <div className="font-medium">Example APIs</div>
            <div className="text-sm text-muted-foreground font-normal">
              Click to load example requests
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {categories.map((category) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger className="flex items-center">
              <span className="font-medium">{category}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-72">
              {categorizedApis[category].map((api, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleSelectApi(api)}
                  className="flex flex-col items-start p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1 w-full">
                    <span
                      className={`px-2 py-1 text-xs font-mono rounded ${getMethodColor(
                        api.method
                      )}`}
                    >
                      {api.method}
                    </span>
                    <span className="font-medium text-foreground">
                      {api.name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate font-mono w-full">
                    {api.url}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {api.description}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
