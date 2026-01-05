'use client';

import React from "react";
import { Input } from "@/components/users/uiTwo/input";
import { SearchIcon } from "lucide-react";

export function SearchInput() {
  return (
    <div className="relative">
      <SearchIcon
        className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
      />
      <Input
        className="pl-8 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        placeholder="Search"
        type="search"
      />
    </div>
  );
}
