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
import {
  Loader2,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";

const BrandCampaigns = ({ campaigns }) => {
  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const router = useRouter();

  const getStatus = (startDate, endDate, isPaused) => {
    if (isPaused) {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-gray-700/50 text-gray-400 rounded-md border border-gray-600/30">
          Paused
        </div>
      );
    }

    const currentDate = new Date().setHours(0, 0, 0, 0);
    const start = new Date(startDate.seconds * 1000).setHours(0, 0, 0, 0);
    const end = new Date(endDate.seconds * 1000).setHours(0, 0, 0, 0);

    if (currentDate < start) {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/30">
          <Calendar className="w-3 h-3" />
          Upcoming
        </div>
      );
    } else if (currentDate > end) {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-gray-700/50 text-gray-400 rounded-md border border-gray-600/30">
          Closed
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Active
        </div>
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "campaignName",
        header: <div className="text-left font-semibold text-gray-300">Campaign Name</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex-shrink-0 ring-2 ring-gray-700 shadow-md">
              {row.original?.adCreativeImages?.[0] ? (
                <Image
                  src={row.original.adCreativeImages[0]}
                  width={48}
                  height={48}
                  alt={row.getValue("campaignName") || "Campaign"}
                  className="object-cover w-12 h-12"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-6 h-6" />
                </div>
              )}
            </div>
            <span className="font-medium text-gray-200">
              {row.getValue("campaignName") || "N/A"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: <div className="text-center font-semibold text-gray-300">Engagements</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg font-semibold text-sm border border-indigo-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              {row.getValue("ipAddress")?.length || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: <div className="text-center font-semibold text-gray-300">Created At</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm text-gray-400">
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
        header: <div className="text-center font-semibold text-gray-300">Start Date</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm text-gray-400">
            {moment.unix(row.getValue("startDate")?.seconds).format("DD/MM/YY")}
          </div>
        ),
      },
      {
        accessorKey: "endDate",
        header: <div className="text-center font-semibold text-gray-300">End Date</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm text-gray-400">
            {moment.unix(row.getValue("endDate")?.seconds).format("DD/MM/YY")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: <div className="text-right font-semibold text-gray-300">Status</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            {getStatus(
              row.getValue("startDate"),
              row.getValue("endDate"),
              row.original?.isPaused
            )}
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={() => {
                router.push(
                  `/campaigns/campaign-details?campaignId=${row.original.id}`
                );
              }}
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
    state: {
      sorting,
    },
  });

  const toggleCreatedAtSorting = () => {
    setSorting((state) => {
      const currentSorting = state.find((sort) => sort.id === "createdAt");
      if (currentSorting) {
        return currentSorting.desc
          ? [{ id: "createdAt", desc: false }]
          : [{ id: "createdAt", desc: true }];
      }
      return [{ id: "createdAt", desc: true }];
    });
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl w-full p-2 md:p-5 shadow-2xl border border-gray-700">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Campaigns List</h1>
            <p className="text-gray-400 text-sm">
              Manage and monitor all your campaigns
            </p>
          </div>
        </div>

        {/* Sort Button */}
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-2 border-gray-700 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200 font-medium text-sm text-gray-200"
          onClick={toggleCreatedAtSorting}
        >
          {table.getState().sorting.find(({ id }) => id === "createdAt")?.desc ? (
            <>
              <ArrowDown className="w-4 h-4 text-indigo-400" />
              <span>Newest First</span>
            </>
          ) : (
            <>
              <ArrowUp className="w-4 h-4 text-indigo-400" />
              <span>Oldest First</span>
            </>
          )}
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl h-96">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
            <p className="text-gray-400 font-medium">Loading campaigns...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 border-b-2 border-gray-700 text-xs uppercase tracking-wider text-gray-300"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-800">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandCampaigns;