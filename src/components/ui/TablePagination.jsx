"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";

const TablePagination = ({ table }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
      {/* Left Section: Rows Info & Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4">


        {/* Rows Per Page Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Rows:</span>
          <select
            className="px-3 py-2 pr-8 border-2 border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 cursor-pointer"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Section: Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page Button */}
        <button
          className="p-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page Button */}
        <button
          className="p-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Display */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
          <span className="text-sm font-semibold text-white">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
        </div>

        {/* Next Page Button */}
        <button
          className="p-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button */}
        <button
          className="p-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default TablePagination;
