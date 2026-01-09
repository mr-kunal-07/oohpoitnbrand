"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import moment from "moment";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, ArrowUp, ArrowDown, BarChart3, Calendar, TrendingUp } from "lucide-react";

const StatusBadge = ({ startDate, endDate, isPaused }) => {
  if (isPaused) {
    return (
      <span className="inline-flex items-center text-xs font-semibold uppercase py-1.5 px-3 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
        Paused
      </span>
    );
  }

  const currentDate = new Date().setHours(0, 0, 0, 0);
  const start = new Date(startDate.seconds * 1000).setHours(0, 0, 0, 0);
  const end = new Date(endDate.seconds * 1000).setHours(0, 0, 0, 0);

  if (currentDate < start) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
        <Calendar className="w-3 h-3" />
        Upcoming
      </span>
    );
  }

  if (currentDate > end) {
    return (
      <span className="inline-flex items-center text-xs font-semibold uppercase py-1.5 px-3 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
        Closed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-green-50 text-green-700 rounded-md border border-green-200">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      Active
    </span>
  );
};

const BrandCampaigns = ({ campaigns = [] }) => {
  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const router = useRouter();

  const columns = useMemo(
    () => [
      {
        accessorKey: "campaignName",
        header: () => <div className="text-left font-semibold text-slate-700">Campaign Name</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex-shrink-0 border border-slate-200">
              {row.original?.adCreativeImages?.[0] ? (
                <Image
                  src={row.original.adCreativeImages[0]}
                  width={48}
                  height={48}
                  alt={row.getValue("campaignName") || "Campaign"}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
              )}
            </div>
            <span className="font-medium text-slate-900">
              {row.getValue("campaignName") || "N/A"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: () => <div className="text-center font-semibold text-slate-700">Engagements</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-semibold text-sm border border-purple-200">
              <TrendingUp className="w-3.5 h-3.5" />
              {row.getValue("ipAddress")?.length || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="text-center font-semibold text-slate-700">Created At</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm text-slate-600">
            {moment.unix(row.getValue("createdAt")?.seconds).format("DD/MM/YY")}
          </div>
        ),
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.createdAt?.seconds || 0;
          const dateB = rowB.original.createdAt?.seconds || 0;
          return dateA - dateB;
        },
      },
      {
        accessorKey: "startDate",
        header: () => <div className="text-center font-semibold text-slate-700">Start Date</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm text-slate-600">
            {moment.unix(row.getValue("startDate")?.seconds).format("DD/MM/YY")}
          </div>
        ),
      },
      {
        accessorKey: "endDate",
        header: () => <div className="text-center font-semibold text-slate-700">End Date</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm text-slate-600">
            {moment.unix(row.getValue("endDate")?.seconds).format("DD/MM/YY")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="text-right font-semibold text-slate-700">Status</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <StatusBadge
              startDate={row.getValue("startDate")}
              endDate={row.getValue("endDate")}
              isPaused={row.original?.isPaused}
            />
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                router.push(`/campaigns/campaign-details?campaignId=${row.original.id}`)
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Insights
            </button>
          </div>
        ),
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: campaigns,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  const toggleSorting = () => {
    setSorting((state) => {
      const current = state.find((sort) => sort.id === "createdAt");
      return current?.desc
        ? [{ id: "createdAt", desc: false }]
        : [{ id: "createdAt", desc: true }];
    });
  };

  const isNewestFirst = table.getState().sorting.find(({ id }) => id === "createdAt")?.desc;

  return (
    <div className="bg-white rounded-2xl w-full p-4 md:p-6 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Campaigns List</h1>
            <p className="text-slate-500 text-sm">Manage and monitor all campaigns</p>
          </div>
        </div>

        {/* Sort Button */}
        <button
          type="button"
          onClick={toggleSorting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm text-slate-700"
        >
          {isNewestFirst ? (
            <>
              <ArrowDown className="w-4 h-4 text-purple-600" />
              <span>Newest First</span>
            </>
          ) : (
            <>
              <ArrowUp className="w-4 h-4 text-purple-600" />
              <span>Oldest First</span>
            </>
          )}
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <p className="text-slate-600 font-medium">Loading campaigns...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 sm:px-6 py-4 border-b border-slate-200 text-xs uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 sm:px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Scroll Hint */}
      {campaigns.length > 0 && (
        <p className="text-xs text-slate-500 text-center mt-3 sm:hidden">
          Swipe left to see more →
        </p>
      )}
    </div>
  );
};

export default BrandCampaigns;