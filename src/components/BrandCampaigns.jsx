"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import moment from "moment";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Filter,
  Loader2,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Calendar,
  TrendingUp,
  X,
} from "lucide-react";
import TablePagination from "@/components/ui/TablePagination";

const BrandCampaigns = ({ campaigns }) => {
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [status, setStatus] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [performance, setPerformance] = useState("");
  const [type, setType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const getStatuss = (startDate, endDate, isPaused) => {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const start = new Date(startDate.seconds * 1000).setHours(0, 0, 0, 0);
    const end = new Date(endDate.seconds * 1000).setHours(0, 0, 0, 0);

    if (isPaused) {
      return "Paused";
    } else if (currentDate < start) {
      return "Upcoming";
    } else if (currentDate > end) {
      return "Closed";
    } else {
      return "Active";
    }
  };

  useEffect(() => {
    if (campaigns.length > 0) {
      setFilteredCampaigns(campaigns);
    }
  }, [campaigns]);

  useEffect(() => {
    const filtered = campaigns.filter((campaign) => {
      const campaignStatus = getStatuss(
        campaign.startDate,
        campaign.endDate,
        campaign.isPaused
      );

      const matchesStatus = status === "" || campaignStatus === status;
      const matchesTimeline = timeline === "" || campaignStatus === timeline;
      const matchesBudget =
        budget === "High"
          ? campaign.campaignBudget >= 10000
          : budget === "Low"
            ? campaign.campaignBudget < 10000
            : true;
      const matchesType = type === "" || campaign.campaignFormat === type;
      const matchesPerformance =
        performance === "High"
          ? campaign.ipAddreess?.lenght >= 100
          : performance === "Low"
            ? campaign.campaignBudget < 100
            : true;
      return (
        matchesStatus &&
        matchesTimeline &&
        matchesBudget &&
        matchesType &&
        matchesPerformance
      );
    });

    setFilteredCampaigns(filtered);
  }, [status, timeline, budget, campaigns]);

  const getStatus = (startDate, endDate) => {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const start = new Date(startDate.seconds * 1000).setHours(0, 0, 0, 0);
    const end = new Date(endDate.seconds * 1000).setHours(0, 0, 0, 0);

    if (currentDate < start) {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-amber-100 text-amber-700 rounded-full">
          <Calendar className="w-3 h-3" />
          Upcoming
        </div>
      );
    } else if (currentDate > end) {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-gray-200 text-gray-700 rounded-full">
          Closed
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-emerald-100 text-emerald-700 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Active
        </div>
      );
    }
  };

  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const [pageSize, setPageSize] = useState(5);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const columns = [
    {
      accessorKey: "id",
      header: <div className="text-left font-semibold">Campaign ID</div>,
    },
    {
      accessorKey: "campaignName",
      header: <div className="text-left font-semibold">Campaign Name</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0 ring-2 ring-white shadow-md">
            <Image
              src={row.original?.adCreativeImages[0] || ""}
              width={1000}
              height={1000}
              alt="campaign"
              className="object-cover"
            />
          </div>
          <span className="font-medium text-gray-800">
            {row.getValue("campaignName") || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: <div className="text-center font-semibold">Engagements</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold text-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            {row.getValue("ipAddress")?.length || 0}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: <div className="text-center font-semibold">Created At</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-gray-600">
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
      header: <div className="text-center font-semibold">Start Date</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-gray-600">
          {moment.unix(row.getValue("startDate")?.seconds).format("DD/MM/YY")}
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: <div className="text-center font-semibold">End Date</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-gray-600">
          {moment.unix(row.getValue("endDate")?.seconds).format("DD/MM/YY")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: <div className="text-right font-semibold">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          {row.original?.isPaused ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase py-1.5 px-3 bg-gray-200 text-gray-700 rounded-full">
              Paused
            </div>
          ) : (
            getStatus(row.getValue("startDate"), row.getValue("endDate"))
          )}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const [open, setOpen] = useState(false);
        return (
          <div className="flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:scale-105 transition-all duration-200"
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
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredCampaigns,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination,
      sorting,
    },
  });

  const toggleCreatedAtSorting = () => {
    table.setSorting((state) => {
      const currentSorting = state.find((sort) => sort.id === "createdAt");
      if (currentSorting) {
        return currentSorting.desc
          ? [{ id: "createdAt", desc: false }]
          : [{ id: "createdAt", desc: true }];
      } else {
        return [{ id: "createdAt", desc: true }];
      }
    });
  };

  const activeFiltersCount = [status, timeline, budget, type, performance].filter(
    (f) => f !== ""
  ).length;

  return (
    <div className="bg-white rounded-xl w-full  p-2 md:p-5">
      {/* Header Section */}
      <div className="flex items-center gap-4 w-full ">
        <div className="">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Campaigns</h1>
          </div>
          <p className="text-gray-600 mb-1 ml-13">
            Manage and monitor all your campaigns
          </p>
        </div>

        {/* Action Bar */}
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Button */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
              onClick={toggleCreatedAtSorting}
            >
              {table.getState().sorting.find(({ id }) => id === "createdAt")
                ?.desc ? (
                <>
                  <ArrowDown className="w-4 h-4 text-blue-600" />
                  <span>Newest First</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4 text-blue-600" />
                  <span>Oldest First</span>
                </>
              )}
            </button>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 font-medium text-sm"
              >
                <Filter className="w-4 h-4 text-purple-600" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-purple-600 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Filter Dropdown */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 z-30 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-white" />
                        <h3 className="text-lg font-bold text-white">Filters</h3>
                      </div>
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="">All Status</option>
                          <option value="Active">Active</option>
                          <option value="Paused">Paused</option>
                          <option value="Closed">Closed</option>
                          <option value="Upcoming">Upcoming</option>
                        </select>
                      </div>

                      {/* Timeline Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Timeline
                        </label>
                        <select
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                        >
                          <option value="">All Timeline</option>
                          <option value="Closed">Recently Ended</option>
                          <option value="Upcoming">Upcoming</option>
                        </select>
                      </div>

                      {/* Budget Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Budget
                        </label>
                        <select
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                        >
                          <option value="">All Budget</option>
                          <option value="High">High Budget</option>
                          <option value="Low">Low Budget</option>
                        </select>
                      </div>

                      {/* Type Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                        >
                          <option value="">All Type</option>
                          <option value="Video">Video</option>
                          <option value="Interactive">Interactive</option>
                          <option value="Quiz Ads">Quiz Ads</option>
                          <option value="Lead Generation">Lead Generation</option>
                        </select>
                      </div>

                      {/* Performance Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Performance
                        </label>
                        <select
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={performance}
                          onChange={(e) => setPerformance(e.target.value)}
                        >
                          <option value="">All Performance</option>
                          <option value="High">High Scans</option>
                          <option value="Low">Low Scans</option>
                        </select>
                      </div>

                      {/* Clear Filters */}
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={() => {
                            setStatus("");
                            setTimeline("");
                            setBudget("");
                            setType("");
                            setPerformance("");
                          }}
                          className="w-full mt-4 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600 font-medium">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
                </span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {campaigns.length == 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl h-96">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500 font-medium">Loading campaigns...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 border-b-2 border-gray-200 text-xs uppercase tracking-wider text-gray-700"
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
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/50 transition-colors duration-150"
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
            <div className="border-t p-3 border-gray-100">
              <TablePagination
                table={table}
                pagination={pagination}
                setPagination={setPagination}
                pageSize={pageSize}
                setPageSize={setPageSize}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandCampaigns;