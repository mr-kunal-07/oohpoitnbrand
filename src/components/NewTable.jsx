"use client";
import React, { useState } from "react";
import QRCodeGenerator from "./QRCode";
import { IoEye } from "react-icons/io5";

const DynamicTable = ({
  headings = ["Name", "ID", "Phone Number", "Date", "Number of Campaigns"],
  data,
  rowsPerPage,
  pagination,
  functionn,
  view,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Get the data to display for the current page
  const paginatedData = [...data] // Create a shallow copy of the data
    .reverse() // Reverse the copied array
    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg min-w-[92vw] max-w-[92vw] overflow-x-scroll">
      {/* Table Headings */}

      <div className=" w-full">
        <div className="flex items-center justify-between w-full p-4 border-b border-gray-200">
          {headings.map((heading, index) => (
            <div
              key={index}
              className={`font-medium min-w-40 text-gray-700 uppercase ${
                index == 0
                  ? "text-left"
                  : index == headings.length - 2
                  ? "text-right"
                  : "text-center"
              }`}
            >
              {heading}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {paginatedData.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-between p-4 border-b border-gray-200 gap-4 text-sm"
          >
            {Object.values(row).map((value, valueIndex) => (
              <div
                key={valueIndex}
                className={`min-w-40 ${
                  valueIndex === 0 ? "flex items-center space-x-3" : ""
                } ${
                  valueIndex == 0
                    ? "text-left"
                    : valueIndex == headings.length - 2
                    ? "text-right"
                    : "text-center"
                }`}
              >
                {typeof value === "string" &&
                (value.includes("Know more") ||
                  value.includes("Assign") ||
                  value.includes("Insights") ||
                  value === "Reopen" ||
                  value === "Close" ||
                  value === "Resolve") ? (
                  <button
                    onClick={() => functionn(row.id)}
                    className="px-4 py-1 text-[0.9rem] rounded-md bg-purple-100 text-purple-500"
                  >
                    {value}
                  </button>
                ) : typeof value === "string" &&
                  value.includes("https://user-ooh-point.vercel.app") ? (
                  <QRCodeGenerator value={value} /> 
                ) : typeof value === "string" && value.includes("View") ? (
                  <div
                    className="cursor-pointer text-purple-500"
                    onClick={() => functionn(row.id)}
                  >
                    <IoEye className="text-2xl" />
                  </div>
                ) : typeof value === "string" &&
                  (value.includes("Coupons") || value === "Edit") ? (
                  <button
                    onClick={() => view(row.id)}
                    className="px-4 py-1 text-[0.9rem] rounded-md bg-purple-100 text-purple-500"
                  >
                    {value}
                  </button>
                ) : typeof value === "object" ? (
                  <div className="flex items-center justify-start gap-4 min-w-40">
                    <img
                      className="w-12 h-12 rounded-full "
                      src={value.img}
                      alt="img"
                    />
                    <div className={`text-center`}>{value.name}</div>
                  </div>
                ) : (
                  <span
                    className={`${
                      valueIndex === 2 && "px-4 py-[2px] rounded-lg "
                    } ${
                      valueIndex === 2 && rowIndex % 4 === 0
                        ? " text-red-500 bg-red-100"
                        : valueIndex === 2 && rowIndex % 4 === 1
                        ? "text-green-500 bg-green-100"
                        : valueIndex === 2 && rowIndex % 4 === 2
                        ? " text-yellow-500 bg-yellow-100"
                        : valueIndex === 2 &&
                          rowIndex % 4 === 3 &&
                          " text-blue-500 bg-blue-100"
                    }`}
                  >
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-end py-4 space-x-2 px-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${
              currentPage === 1
                ? "bg-gray-300 text-gray-400"
                : "bg-gray-300 hover:bg-gray-400"
            } py-1 px-3 rounded`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${
                page === currentPage
                  ? "bg-purple-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
              } py-1 px-3 rounded`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-400"
                : "bg-gray-300 hover:bg-gray-400"
            } py-1 px-3 rounded`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
