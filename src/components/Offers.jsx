"use client";

import { useContext, useEffect, useState } from "react";
import { MyContext } from "@/context/MyContext";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import TablePagination from "./ui/TablePagination";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-hot-toast"; // Add this import (or sonner/react-toastify)

const Offers = () => {
  const context = useContext(MyContext);
  const { user, offers, setOffers } = context || {};
  const router = useRouter();

  // Local state fallback if context doesn't provide offers
  const [localOffers, setLocalOffers] = useState([]);
  const currentOffers = offers || localOffers;
  const currentSetOffers = setOffers || setLocalOffers;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/getOffers");

        if (!res.ok) {
          throw new Error("Failed to fetch offers");
        }

        const offersData = await res.json();

        const brandOffer = offersData.filter(
          (offer) => offer.brandId === user.brandId
        );

        setOffers(brandOffer);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setError(error.message);
        toast.error("Failed to load offers");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.brandId) {
      fetchOffers();
    }
  }, [user?.brandId, setOffers]);

  const handleDelete = async () => {
    if (offerToDelete) {
      try {
        setIsDeleting(true);
        await deleteDoc(doc(db, "offers", offerToDelete));
        setOffers((prev) =>
          prev.filter((offer) => offer.offerId !== offerToDelete)
        );
        toast.success("Offer deleted successfully!");
      } catch (error) {
        console.error("Error deleting offer: ", error);
        toast.error("Failed to delete offer.");
      } finally {
        setDeleteModalOpen(false);
        setOfferToDelete(null);
        setIsDeleting(false);
      }
    }
  };

  const openDeleteModal = (offerId) => {
    setOfferToDelete(offerId);
    setDeleteModalOpen(true);
  };

  const columns = [
    {
      accessorKey: "offerId", // Changed from "id" to "offerId"
      header: <div className="text-left">offer id</div>
    },
    {
      accessorKey: "offerTitle",
      header: <div className="text-left">title</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image
            src={row.original?.offerImage || "/placeholder.png"}
            width={1000}
            height={1000}
            alt="img"
            className="size-12 rounded-full object-cover"
          />
          {row.getValue("offerTitle") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "offerCategory",
      header: "category",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("offerCategory") || "N/A"}</div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "start Date",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("startDate")}</div>
      ),
    },
    {
      accessorKey: "endDate",
      header: "end Date",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("endDate")}</div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-x-2">
          <button
            onClick={() =>
              router.push(`/offers/view-offer/${row.original.offerId}`)
            }
            className="rounded-md border cursor-pointer border-green-200 py-1 px-2 hover:bg-green-50 transition-colors"
            aria-label="View offer"
          >
            <FaEye />
          </button>
          <button
            onClick={() =>
              router.push(`/offers/edit-offer/${row.original.offerId}`)
            }
            className="rounded-md border cursor-pointer border-blue-200 py-1 px-2 hover:bg-blue-50 transition-colors"
            aria-label="Edit offer"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => openDeleteModal(row.original.offerId)}
            className="rounded-md border cursor-pointer border-red-200 py-1 px-2 hover:bg-red-50 transition-colors"
            aria-label="Delete offer"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const [pageSize, setPageSize] = useState(4);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const table = useReactTable({
    data: offers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  const OfferCard = ({ offer }) => (
    <div className="bg-white shadow rounded-lg p-4 m-2">
      <div className="flex justify-center">
        <Image
          src={offer.offerImage || "/placeholder.png"}
          width={300}
          height={300}
          alt={offer.offerTitle}
          className="rounded-lg h-52 w-full object-cover"
        />
      </div>
      <div className="mt-2">
        <h3 className="text-xl font-bold text-oohpoint-grey-500">
          {offer.offerTitle || "N/A"}
        </h3>
        <p className="text-center text-oohpoint-tertiary-2">
          Category: {offer.offerCategory || "N/A"}
        </p>
        <p className="text-center">Start Date: {offer.startDate}</p>
        <p className="text-center">End Date: {offer.endDate}</p>
      </div>
      <div className="flex justify-around mt-2">
        <Button
          onClick={() => router.push(`/offers/view-offer/${offer.offerId}`)}
          variant="outlined"
          size="small"
        >
          <FaEye />
        </Button>
        <Button
          onClick={() => router.push(`/offers/edit-offer/${offer.offerId}`)}
          variant="outlined"
          size="small"
          color="success"
        >
          <FaEdit />
        </Button>
        <Button
          onClick={() => openDeleteModal(offer.offerId)}
          variant="outlined"
          size="small"
          color="error"
        >
          <FaTrash />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-oohpoint-grey-200 flex flex-col p-4 md:p-6 gap-4 md:gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:items-center md:flex-row md:justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-oohpoint-grey-500 font-bold text-4xl">Offers</h1>
          <p className="text-oohpoint-tertiary-2">
            All you need to know about offers!
          </p>
        </div>
        <button
          className="py-2 px-4 bg-oohpoint-primary-2 hover:bg-oohpoint-primary-3 hover:scale-95 transition-all text-white rounded-md"
          onClick={() => router.push("/offers/add-offer")}
        >
          Add Offer
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-md h-48 bg-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="mt-2 text-neutral-600">Loading offers...</p>
        </div>
      ) : error ? (
        <div className="col-span-full h-48 bg-white flex flex-col justify-center items-center rounded-lg">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-500 underline"
          >
            Try again
          </button>
        </div>
      ) : offers?.length === 0 ? (
        <div className="col-span-full h-48 bg-white flex flex-col justify-center items-center rounded-lg">
          <p className="text-neutral-600">No offers available</p>
          <button
            className="mt-4 py-2 px-4 bg-oohpoint-primary-2 text-white rounded-md"
            onClick={() => router.push("/offers/add-offer")}
          >
            Create your first offer
          </button>
        </div>
      ) : isMobile ? (
        <div className="flex flex-col gap-4">
          {offers.map((offer) => (
            <OfferCard key={offer.offerId} offer={offer} />
          ))}
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-lg">
            <table className="bg-white rounded-lg shadow-sm w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="uppercase p-4 border-b font-medium text-neutral-700"
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
              <tbody className="divide-y">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-8">
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

          {/* Pagination for desktop */}
          {offers.length > 0 && (
            <TablePagination table={table} setPageSize={setPageSize} />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const DeleteConfirmationModal = ({ open, isDeleting, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Offer</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this offer? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          disabled={isDeleting}
          onClick={onConfirm}
          color="error"
          variant="contained"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Offers;