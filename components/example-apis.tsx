"use client";

import React, { useCallback } from "react";
import {
  Zap,
  ChevronRight,
  Globe,
  Cloud,
  Database,
  TestTube,
  Mail,
  MapPin,
  Currency,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

interface ExampleApi {
  name: string;
  method: string;
  url: string;
  description: string;
  category: string;
  subcategory?: string;
}

interface ExampleApisProps {
  onSelectApi: (
    api: Omit<ExampleApi, "description" | "category" | "subcategory">
  ) => void;
}

const exampleApis: ExampleApi[] = [
  // JSONPlaceholder - REST API Examples
  {
    name: "Get All Posts",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts",
    description: "Fetch all posts",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },
  {
    name: "Get Single Post",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Fetch a single post by ID",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },
  {
    name: "Get Post Comments",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1/comments",
    description: "Get comments for a specific post",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },
  {
    name: "Create Post",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    description: "Create a new post",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },
  {
    name: "Update Post",
    method: "PUT",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Update an existing post",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },
  {
    name: "Patch Post",
    method: "PATCH",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Partially update a post",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },
  {
    name: "Delete Post",
    method: "DELETE",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Delete a post",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },
  {
    name: "Get Users",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/users",
    description: "Fetch all users",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },
  {
    name: "Get User Albums",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/users/1/albums",
    description: "Get albums for a specific user",
    category: "REST APIs",
    subcategory: "JSONPlaceholder",
  },

  // RandomUser API
  {
    name: "Random User",
    method: "GET",
    url: "https://randomuser.me/api/",
    description: "Get random user data",
    category: "User Data",
    subcategory: "RandomUser",
  },
  {
    name: "Multiple Users",
    method: "GET",
    url: "https://randomuser.me/api/?results=5",
    description: "Get multiple random users",
    category: "User Data",
    subcategory: "RandomUser",
  },
  {
    name: "User with Nationality",
    method: "GET",
    url: "https://randomuser.me/api/?nat=us,gb,ca",
    description: "Get user from specific countries",
    category: "User Data",
    subcategory: "RandomUser",
  },
  {
    name: "Female Users Only",
    method: "GET",
    url: "https://randomuser.me/api/?gender=female&results=3",
    description: "Get only female users",
    category: "User Data",
    subcategory: "RandomUser",
  },

  // HTTP Testing APIs
  {
    name: "HTTP Status 200",
    method: "GET",
    url: "https://httpstat.us/200",
    description: "Test successful response",
    category: "HTTP Testing",
    subcategory: "HTTPStat",
  },
  {
    name: "HTTP Status 404",
    method: "GET",
    url: "https://httpstat.us/404",
    description: "Test not found response",
    category: "HTTP Testing",
    subcategory: "HTTPStat",
  },
  {
    name: "HTTP Status 500",
    method: "GET",
    url: "https://httpstat.us/500",
    description: "Test server error response",
    category: "HTTP Testing",
    subcategory: "HTTPStat",
  },
  {
    name: "Delayed Response",
    method: "GET",
    url: "https://httpstat.us/200?sleep=2000",
    description: "Test with 2 second delay",
    category: "HTTP Testing",
    subcategory: "HTTPStat",
  },
  {
    name: "Custom Status",
    method: "GET",
    url: "https://httpstat.us/418",
    description: "I'm a teapot status code",
    category: "HTTP Testing",
    subcategory: "HTTPStat",
  },

  // HTTPBin - Request Inspection
  {
    name: "Echo Request",
    method: "POST",
    url: "https://httpbin.org/post",
    description: "Echo back the request data",
    category: "Request Inspection",
    subcategory: "HTTPBin",
  },
  {
    name: "IP Address",
    method: "GET",
    url: "https://httpbin.org/ip",
    description: "Get your IP address",
    category: "Request Inspection",
    subcategory: "HTTPBin",
  },
  {
    name: "User Agent",
    method: "GET",
    url: "https://httpbin.org/user-agent",
    description: "Get user agent info",
    category: "Request Inspection",
    subcategory: "HTTPBin",
  },
  {
    name: "Headers",
    method: "GET",
    url: "https://httpbin.org/headers",
    description: "Get request headers",
    category: "Request Inspection",
    subcategory: "HTTPBin",
  },
  {
    name: "Cookies",
    method: "GET",
    url: "https://httpbin.org/cookies",
    description: "Get request cookies",
    category: "Request Inspection",
    subcategory: "HTTPBin",
  },
  {
    name: "Delay Response",
    method: "GET",
    url: "https://httpbin.org/delay/3",
    description: "Delay response by 3 seconds",
    category: "Request Inspection",
    subcategory: "HTTPBin",
  },
  {
    name: "Stream Response",
    method: "GET",
    url: "https://httpbin.org/stream/5",
    description: "Stream 5 JSON objects",
    category: "Request Inspection",
    subcategory: "HTTPBin",
  },

  // Weather APIs
  {
    name: "OpenWeather Current",
    method: "GET",
    url: "https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo",
    description: "Get current weather (demo key)",
    category: "Weather",
    subcategory: "OpenWeather",
  },
  {
    name: "Weather Forecast",
    method: "GET",
    url: "https://api.openweathermap.org/data/2.5/forecast?q=London&appid=demo",
    description: "Get 5-day forecast (demo key)",
    category: "Weather",
    subcategory: "OpenWeather",
  },

  // Public APIs
  {
    name: "Dog Images",
    method: "GET",
    url: "https://dog.ceo/api/breeds/image/random",
    description: "Get random dog image",
    category: "Public APIs",
    subcategory: "Animals",
  },
  {
    name: "Cat Facts",
    method: "GET",
    url: "https://catfact.ninja/fact",
    description: "Get random cat fact",
    category: "Public APIs",
    subcategory: "Animals",
  },
  {
    name: "Joke API",
    method: "GET",
    url: "https://official-joke-api.appspot.com/random_joke",
    description: "Get random joke",
    category: "Public APIs",
    subcategory: "Entertainment",
  },
  {
    name: "Quote API",
    method: "GET",
    url: "https://api.quotable.io/random",
    description: "Get random quote",
    category: "Public APIs",
    subcategory: "Entertainment",
  },
  {
    name: "Pokemon List",
    method: "GET",
    url: "https://pokeapi.co/api/v2/pokemon?limit=20",
    description: "Get list of Pokemon",
    category: "Public APIs",
    subcategory: "Games",
  },
  {
    name: "Pokemon Details",
    method: "GET",
    url: "https://pokeapi.co/api/v2/pokemon/pikachu",
    description: "Get Pikachu details",
    category: "Public APIs",
    subcategory: "Games",
  },

  // Currency & Finance
  {
    name: "Exchange Rates",
    method: "GET",
    url: "https://api.exchangerate-api.com/v4/latest/USD",
    description: "Get USD exchange rates",
    category: "Finance",
    subcategory: "Currency",
  },
  {
    name: "Crypto Prices",
    method: "GET",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
    description: "Get Bitcoin and Ethereum prices",
    category: "Finance",
    subcategory: "Cryptocurrency",
  },

  // News & Media
  {
    name: "News Headlines",
    method: "GET",
    url: "https://newsapi.org/v2/top-headlines?country=us&apiKey=demo",
    description: "Get US news headlines (demo key)",
    category: "News",
    subcategory: "NewsAPI",
  },

  // Development Tools
  {
    name: "GitHub User",
    method: "GET",
    url: "https://api.github.com/users/octocat",
    description: "Get GitHub user profile",
    category: "Development",
    subcategory: "GitHub",
  },
  {
    name: "GitHub Repos",
    method: "GET",
    url: "https://api.github.com/users/octocat/repos",
    description: "Get user repositories",
    category: "Development",
    subcategory: "GitHub",
  },
  {
    name: "NPM Package",
    method: "GET",
    url: "https://registry.npmjs.org/react",
    description: "Get NPM package info",
    category: "Development",
    subcategory: "NPM",
  },

  // Testing & Mock APIs
  {
    name: "JSON Server",
    method: "GET",
    url: "https://my-json-server.typicode.com/typicode/demo/posts",
    description: "Mock REST API server",
    category: "Testing",
    subcategory: "Mock APIs",
  },
  {
    name: "ReqRes Users",
    method: "GET",
    url: "https://reqres.in/api/users?page=1",
    description: "Mock user API",
    category: "Testing",
    subcategory: "Mock APIs",
  },
  {
    name: "ReqRes Create User",
    method: "POST",
    url: "https://reqres.in/api/users",
    description: "Create mock user",
    category: "Testing",
    subcategory: "Mock APIs",
  },
];

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800";
    case "POST":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
    case "PUT":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
    case "PATCH":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
    case "DELETE":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-800";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "REST APIs":
      return <Database className="w-4 h-4" />;
    case "User Data":
      return <Globe className="w-4 h-4" />;
    case "HTTP Testing":
      return <TestTube className="w-4 h-4" />;
    case "Request Inspection":
      return <TestTube className="w-4 h-4" />;
    case "Weather":
      return <Cloud className="w-4 h-4" />;
    case "Public APIs":
      return <Globe className="w-4 h-4" />;
    case "Finance":
      return <Currency className="w-4 h-4" />;
    case "News":
      return <Globe className="w-4 h-4" />;
    case "Development":
      return <Database className="w-4 h-4" />;
    case "Testing":
      return <TestTube className="w-4 h-4" />;
    default:
      return <Zap className="w-4 h-4" />;
  }
};

export default function ExampleApis({ onSelectApi }: ExampleApisProps) {
  const handleSelectApi = useCallback(
    (api: ExampleApi) => {
      console.log("Example API selected:", api);
      onSelectApi({
        name: api.name,
        method: api.method,
        url: api.url,
      });
    },
    [onSelectApi]
  );

  // Group APIs by category and subcategory
  const groupedApis = exampleApis.reduce((acc, api) => {
    if (!acc[api.category]) {
      acc[api.category] = {};
    }
    if (!acc[api.category][api.subcategory || "default"]) {
      acc[api.category][api.subcategory || "default"] = [];
    }
    acc[api.category][api.subcategory || "default"].push(api);
    return acc;
  }, {} as Record<string, Record<string, ExampleApi[]>>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground transition-colors [&>svg:last-child]:hidden"
        >
          <Zap className="w-4 h-4 mr-2" />
          Examples
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className=" max-h-[70vh] overflow-y-auto p-1"
        align="start"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-2 py-1.5">
          <div className="space-y-0.5">
            <div className="font-semibold text-sm">Example APIs</div>
            <div className="text-xs text-muted-foreground font-normal">
              Click to load example requests
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        <div className="space-y-0.5">
          {Object.entries(groupedApis).map(([category, subcategories]) => (
            <DropdownMenuSub key={category}>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent data-[state=open]:bg-accent transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-center w-4 h-4 text-muted-foreground transition-colors">
                  {getCategoryIcon(category)}
                </div>
                <span className="font-medium text-sm">{category}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  className="max-h-[60vh] overflow-y-auto p-1"
                  sideOffset={2}
                >
                  {Object.entries(subcategories).map(
                    ([subcategory, apis], subIndex) => (
                      <div key={subcategory} className="space-y-0.5">
                        {Object.keys(subcategories).length > 1 && (
                          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wide">
                            {subcategory}
                          </DropdownMenuLabel>
                        )}
                        {apis.map((api, index) => (
                          <DropdownMenuItem
                            key={`${subcategory}-${index}`}
                            onClick={() => handleSelectApi(api)}
                            className="flex flex-col items-start p-2 cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground transition-colors space-y-1"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span
                                className={`px-1.5 py-0.5 text-xs font-mono rounded font-medium ${getMethodColor(
                                  api.method
                                )}`}
                              >
                                {api.method}
                              </span>
                              <span className="font-medium text-sm text-foreground truncate">
                                {api.name}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono w-full truncate pl-0.5">
                              {api.url}
                            </div>
                            <div className="text-xs text-muted-foreground pl-0.5">
                              {api.description}
                            </div>
                          </DropdownMenuItem>
                        ))}
                        {Object.keys(subcategories).length > 1 &&
                          subIndex < Object.keys(subcategories).length - 1 && (
                            <DropdownMenuSeparator className="my-1" />
                          )}
                      </div>
                    )
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
