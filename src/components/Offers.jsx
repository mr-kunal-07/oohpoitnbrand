"use client";

import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { MyContext } from "@/context/MyContext";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Eye, Edit2, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import TablePagination from "./ui/TablePagination";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-hot-toast";

const Offers = () => {
  const context = useContext(MyContext);
  const { user, offers = [], setOffers } = context || {};
  const router = useRouter();

  // State management
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 4,
  });

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      if (!user?.brandId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/getoffers");

        if (!res.ok) {
          throw new Error("Failed to fetch offers");
        }

        const offersData = await res.json();
        const brandOffers = offersData.filter(
          (offer) => offer.brandId === user.brandId
        );

        if (setOffers) {
          setOffers(brandOffers);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
        setError(error.message);
        toast.error("Failed to load offers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [user?.brandId, setOffers]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!offerToDelete) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "offers", offerToDelete));

      if (setOffers) {
        setOffers((prev) =>
          prev.filter((offer) => offer.offerId !== offerToDelete)
        );
      }

      toast.success("Offer deleted successfully!");
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer.");
    } finally {
      setDeleteModalOpen(false);
      setOfferToDelete(null);
      setIsDeleting(false);
    }
  }, [offerToDelete, setOffers]);

  const openDeleteModal = useCallback((offerId) => {
    setOfferToDelete(offerId);
    setDeleteModalOpen(true);
  }, []);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "offerId",
        header: () => <div className="text-left font-semibold">Offer ID</div>,
        cell: ({ row }) => (
          <div className="text-sm text-gray-700">{row.getValue("offerId")}</div>
        ),
      },
      {
        accessorKey: "offerTitle",
        header: () => <div className="text-left font-semibold">Title</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={row.original?.offerImage || "/placeholder.png"}
                fill
                alt={row.getValue("offerTitle") || "Offer"}
                className="object-cover"
              />
            </div>
            <span className="font-medium text-gray-900">
              {row.getValue("offerTitle") || "N/A"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "offerCategory",
        header: () => <div className="text-center font-semibold">Category</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {row.getValue("offerCategory") || "N/A"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "startDate",
        header: () => <div className="text-center font-semibold">Start Date</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm text-gray-600">
            {row.getValue("startDate")}
          </div>
        ),
      },
      {
        accessorKey: "endDate",
        header: () => <div className="text-center font-semibold">End Date</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm text-gray-600">
            {row.getValue("endDate")}
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row }) => (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() =>
                router.push(`/offers/view-offer/${row.original.offerId}`)
              }
              className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
              aria-label="View offer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                router.push(`/offers/edit-offer/${row.original.offerId}`)
              }
              className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Edit offer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original.offerId)}
              className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Delete offer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [router, openDeleteModal]
  );

  const table = useReactTable({
    data: offers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  // Mobile card component
  const OfferCard = ({ offer }) => (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
      <div className="relative w-full h-48">
        <Image
          src={offer.offerImage || "/placeholder.png"}
          fill
          alt={offer.offerTitle || "Offer"}
          className="object-cover"
        />
      </div>
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
          {offer.offerTitle || "N/A"}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {offer.offerCategory || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Start:</span>
            <span className="font-medium text-gray-900">{offer.startDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">End:</span>
            <span className="font-medium text-gray-900">{offer.endDate}</span>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => router.push(`/offers/view-offer/${offer.offerId}`)}
            className="flex-1 py-2 px-3 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => router.push(`/offers/edit-offer/${offer.offerId}`)}
            className="flex-1 py-2 px-3 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => openDeleteModal(offer.offerId)}
            className="py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Offers</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              All you need to know about offers!
            </p>
          </div>
          <button
            className="flex items-center justify-center gap-2 py-2.5 px-5 bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all text-white rounded-lg font-medium shadow-sm"
            onClick={() => router.push("/offers/add-offer")}
          >
            <Plus className="w-5 h-5" />
            Add Offer
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl h-64 bg-white border border-gray-200">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="mt-3 text-gray-600 font-medium">Loading offers...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center rounded-xl h-64 bg-white border border-gray-200">
            <p className="text-red-500 font-medium">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-purple-600 hover:text-purple-700 underline font-medium"
            >
              Try again
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col justify-center items-center rounded-xl h-64 bg-white border border-gray-200">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No offers available</p>
            <p className="text-sm text-gray-500 mb-4">Get started by creating your first offer</p>
            <button
              className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => router.push("/offers/add-offer")}
            >
              Create your first offer
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-4 text-xs uppercase tracking-wider text-gray-700"
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
                  <tbody className="divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-4">
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

              {/* Pagination */}
              {offers.length > pagination.pageSize && (
                <div className="border-t border-gray-200">
                  <TablePagination
                    table={table}
                    setPageSize={(size) =>
                      setPagination((prev) => ({ ...prev, pageSize: size }))
                    }
                  />
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <OfferCard key={offer.offerId} offer={offer} />
              ))}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteModalOpen}
          onClose={() => !isDeleting && setDeleteModalOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle className="font-bold text-gray-900">
            Delete Offer
          </DialogTitle>
          <DialogContent>
            <DialogContentText className="text-gray-600">
              Are you sure you want to delete this offer? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              className="text-gray-600"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              variant="contained"
              color="error"
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Offers;