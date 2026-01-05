'use client';

import React from "react";
import { UsersTable } from "./(componentsTwo)/users-table";
import { SearchInput } from "./(componentsTwo)/search-input";

export default function UsersPage() {
  return (
    <div className="space-y-6 w-full ">
      <div
        className="flex justify-between items-center"
      >
        <h1
          className="text-3xl font-bold text-gray-900 dark:text-gray-100"
        >
          Users
        </h1>
        <SearchInput />
      </div>
      <UsersTable />
    </div>
  );
}
