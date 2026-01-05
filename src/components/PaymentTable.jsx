"use client";
import Image from "next/image";
import React, { useState } from "react";

const Table = ({ isShow }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const data = [
    {
      id: 1,
      name: "John Doe",
      image: "/profile.png",
      phone: "(406)555-0120",
      date: "8/15/17",
      campaigns: 10,
    },
    // ... other data
  ];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleClick = (page) => {
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const displayedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maxPageButtons = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  return (
    <div className="bg-white rounded-xl w-full overflow-x-auto">
      <div className="flex flex-col items-center">
        {/* Table Header */}
        <div className="gap-1 md:gap-4 flex flex-row w-full max-w-screen-lg border-b border-gray-300 py-1 md:py-2 text-[9px] md:text-lg font-semibold items-center">
          <div className="flex-1 text-center"></div>
          <div className="flex-1 text-center">Name</div>
          <div className="flex-1 text-center">ID</div>
          <div className="flex-1 text-center">Phone</div>
          <div className="flex-1 text-center">Date</div>
          <div className="flex-1 text-center">Campaigns</div>
        </div>

        {/* Table Rows */}
        {displayedData.map((person) => (
          <div
            key={person.id}
            className="gap-1 md:gap-4 flex flex-row w-full max-w-screen-lg py-1 md:py-2 text-xs md:text-lg items-center"
          >
            <div className="flex-1 flex items-center justify-center">
              <Image
                src={person.image}
                height={500}
                width={500}
                className="rounded-full w-8 h-8 md:w-14 md:h-14"
                alt={person.name}
              />
            </div>
            <div className="flex-1 text-center text-[10px] md:text-base">
              {person.name}
            </div>
            <div className="flex-1 text-center text-[10px] md:text-base">
              {person.id}
            </div>
            <div className="flex-1 text-center text-[10px] md:text-base">
              {person.phone}
            </div>
            <div className="flex-1 text-center text-[10px] md:text-base">
              {person.date}
            </div>
            <div className="flex-1 text-center flex gap-4 justify-center text-[10px] md:text-base max-lg:flex-col ">
              {person.campaigns}
              {isShow && (
                <div className="text-[9px] md:text-sm bg-oohpoint-grey-300 text-oohpoint-primary-2 text-primary rounded-2xl flex items-center px-1 md:px-3">
                  Know more
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Pagination Controls */}
        <div className="py-2 md:py-4 flex justify-end items-center space-x-1 md:space-x-4 w-full max-w-screen-lg">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-2 md:px-3 py-1 rounded disabled:opacity-50 text-primary border-2 border-primary text-[10px] md:text-base"
          >
            &lt;
          </button>

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, index) => startPage + index
          ).map((page) => (
            <button
              key={page}
              onClick={() => handleClick(page)}
              className={`px-2 md:px-3 py-1 rounded text-[10px] md:text-base ${
                currentPage === page
                  ? "bg-primary text-gray-200"
                  : "text-primary"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-2 md:px-3 py-1 rounded disabled:opacity-50 text-primary border-2 border-primary text-[10px] lg:text-base"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;
