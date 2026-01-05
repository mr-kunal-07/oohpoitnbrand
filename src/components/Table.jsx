"use client";
import Image from "next/image";
import React, { useState } from "react";
import QRCodeGenerator from "./QRCode";

const Table = ({ isShow, handleShow, data = [], vendor }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;
  const totalPages = data && data.length > 0 ? Math.ceil(data.length / itemsPerPage) : 1;

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
    <div className="bg-white rounded-xl w-full overflow-x-auto ">
      <div className="flex flex-col items-center">
        {/* Table Header */}
        <div className="gap-1 md:gap-4 flex flex-row w-full max-w-screen-lg border-b border-gray-300 py-1 md:py-2 text-[9px] md:text-lg font-semibold items-center">
          <div className="flex-1 text-center">Campaign ID</div>
          <div className="flex-1 text-center">Campaign Name</div>
          <div className="flex-1 text-center">Duration</div>
          <div className="flex-1 text-center">QR Code</div>
          {/* <div className="flex-1 text-center">Phone</div>
          <div className="flex-1 text-center">Business Name</div>
          <div className="flex-1 text-center">Campaigns</div> */}
          {/* <div className="flex-1 text-center"></div> */}
        </div>

        {/* Table Rows */}
        {(displayedData || []).map((person) => (
          <div
            key={person.id}
            className="gap-1 md:gap-4 flex flex-row w-full max-w-screen-lg py-1 md:py-2 text-xs md:text-lg items-center"
          >
             <div className="flex-1 text-center text-[10px] md:text-base">
              {person.cid}
            </div>
            <div className="flex-1 text-center text-[10px] md:text-base">
              {person.campaignName}
            </div>
            <div className="flex-1 text-center text-[10px] md:text-base">
  {new Date(person.startDate.seconds * 1000).toLocaleDateString()} - 
  {new Date(person.endDate.seconds * 1000).toLocaleDateString()}
</div>
            <div className="flex-1 text-center text-[10px] md:text-base"> 
              <QRCodeGenerator value={`https://user-ooh-point.vercel.app/campaign/${person.campaignId}`} />
              </div>
            {/* <div className="flex-1 text-center text-[10px] md:text-base">
              {person.phoneNumber}
            </div>
            <div className="flex-1 text-center text-[10px] md:text-base">
              {person.businessName}
            </div> */}
            {/* <div className="flex-1 text-center flex gap-4 justify-center text-[10px] md:text-base max-lg:flex-col ">
              {person?.campaigns?.length}
            </div> */}
            {isShow && (
              <div
                className="text-[9px] md:text-sm bg-oohpoint-grey-300 cursor-pointer text-oohpoint-primary-2 text-primary rounded-2xl flex items-center px-1 md:px-3"
                onClick={() => handleShow(person)}  // Pass the vendor data to handleShow
              >
                Know more
              </div>
            )}
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
