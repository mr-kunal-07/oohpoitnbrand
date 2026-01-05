"use client";
import React, { useEffect, useState } from "react";

const PaymentTable = ({ data, handleShow }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 14;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const [assignModal, setAssignModal] = useState(false);
  const [campaignId, setCampaignId] = useState("")
  const [campaigns, setCampaigns] = useState([])
  const [pricePerScan, setPricePerScan] = useState(0)
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState([])
  const [vendorId, setVendorId] = useState("")
  const [campaign, setCampaign] = useState({})
  const [vendor, setVendor] = useState({})

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

  const handleShowClick = ()=>{
   handleShow()
  }


  const fetchCampaigns = async () => {
    const res = await fetch('/api/getCampaigns')
   
    if (!res.ok) {
      throw new Error("Failed to fetch Campaigns");
    }

    const data = await res.json();
    setCampaigns(data.reverse())
    console.log(data)
  }

  const fetchVendors = async () => {
    const res = await fetch('/api/getVendors')
   
    if (!res.ok) {
      throw new Error("Failed to fetch Vendors");
    }

    const data = await res.json();
    setVendors(data.reverse())
    console.log(data)
  }

  useEffect(() => {
    fetchCampaigns()
    fetchVendors()
  }, [])

  const assignCampaign = async () => {
    setLoading(true);
  
    // Ensure vendor?.campaigns and campaign?.vendors are arrays
    const campaigns = [...(vendor?.campaigns || []), {
      pricePerScan,
      campaignId: campaignId,
    }];
    const vendors = [...(campaign?.vendors || []), {
      pricePerScan,
      vendorId,
    }];
  
    try {
      const response = await fetch("/api/updateVendor", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vendorId, campaigns }),
      });
  
      const result = await response.json();
      if (response.ok) {
        // Handle success (e.g., show a success message)
        console.log("Vendor updated successfully");
      } else {
        // Handle errors (e.g., show an error message)
        console.error("Error assigning campaign:", result);
      }
    } catch (error) {
      console.error("Error assigning campaign:", error);
    }
  
    try {
      const response = await fetch("/api/updateCampaign", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid: campaignId, vendors }),
      });
  
      const result = await response.json();
      if (response.ok) {
        // Handle success (e.g., show a success message)
        console.log("Campaign updated successfully");
      } else {
        // Handle errors (e.g., show an error message)
        console.error("Error assigning vendor:", result);
      }
    } catch (error) {
      console.error("Error assigning vendor:", error);
    }
  
    setLoading(false);
  };
  

  return (
    <div className="bg-white rounded-xl w-full py-2 md:py-3">
      <div className="flex flex-col items-center">
        {/* Table Header */}
        <div className="gap-0.5 md:gap-1 flex flex-row w-full max-w-screen-lg border-b border-gray-300 py-1 text-xs md:text-sm font-bold text-gray-900 items-center">
          <div className="flex-1 text-center">Name</div>
          <div className="flex-1 text-center">ID</div>
          <div className="flex-1 text-center">Phone</div>
          <div className="flex-1 text-center">Business Name</div>
          <div className="flex-1 text-center">Actions</div>
        </div>

        {/* Table Rows */}
        {vendors.map((person) => (
          <div
            key={person.id}
            className="gap-0.5 md:gap-1 flex flex-row w-full max-w-screen-lg py-1 text-xs md:text-sm items-center "
          >
            <div className="flex-1 font-light  leading-4 text-center">
              {person.ownerName}
            </div>
            <div className="flex-1  font-light  leading-4 text-center">
              {person.vid}
            </div>
            <div className="flex-1  font-light  leading-4 text-center">
              {person.phoneNumber}
            </div>
            <div className="flex-1  font-light  leading-4 text-center">
              {person.businessName}
            </div>
            <div className="flex-1 text-center flex md:gap-3 justify-center max-lg:flex-col gap-1">
              <button onClick={() => {setAssignModal(true)
                setVendorId(person.vid)
                setVendor(person)
              }} className="flex-1 text-[10px] bg-oohpoint-grey-300 font-thin text-oohpoint-grey-100 rounded-md p-[3px]">
                Assign 
              </button>
              <button className="flex-1 text-[10px] bg-[#46E51E] opacity-50 text-oohpoint-primary-1 font-thin rounded-md p-[3px]">
                Edit
              </button>
              <button className="flex-1 text-[10px] bg-[#FB0C0C] text-oohpoint-primary-1 font-thin rounded-md p-[3px] opacity-50">
                Reject
              </button>
              <button className="flex-1 text-[10px] bg-oohpoint-grey-300 font-thin text-oohpoint-grey-100 rounded-md p-[3px]" onClick={handleShowClick}>
                Details
              </button>
            </div>
          </div>
        ))}

        {/* Pagination Controls */}
        <div className="py-2 flex justify-end items-center space-x-1 md:space-x-2 w-full max-w-screen-lg">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-1 md:px-2 py-1 rounded text-xs md:text-sm disabled:opacity-50 text-oohpoint-tertiary-1 border-2 border-oohpoint-tertiary-1"
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
              className={`px-1 md:px-2 py-1 rounded text-xs md:text-sm ${
                currentPage === page
                  ? "bg-oohpoint-tertiary-1 text-white"
                  : "text-oohpoint-tertiary-1"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-1 md:px-2 py-1 rounded text-xs md:text-sm disabled:opacity-50 text-oohpoint-tertiary-1 border-2 border-oohpoint-tertiary-1"
          >
            &gt;
          </button>
        </div>
      </div>
      {assignModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-3">
              <div className="bg-white max-h-[90vh] overflow-y-scroll p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-xl text-center font-semibold mb-8">
                  Assign Campaign to Vendor
                </h2>
                <div className="mb-4">
                  <label className="block text-gray-800">Campaign</label>
                  <select
                    value={campaignId}
                    onChange={(e) => {
                      setCampaignId(e.target.value);
                      const data = campaigns.find((cp) => cp.cid === e.target.value);
                      setCampaign(data);
                      console.log(data);
                    }}
                    className="mt-1 block w-full bg-gray-50 rounded-md p-2"
                  >
                    <option value="" disabled>
                      Select A Campaign
                    </option>
                    {campaigns.map((cp) =>
                      !vendor?.campaigns?.find((v) => v.campaignId === cp.cid) ? (
                        <option key={cp.cid} value={cp.cid}>
                          {cp.campaignName} - {cp.campaignId}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>
                <div className=" mb-4">
                  <label className="block text-gray-800">Price Per Scan:</label>
                  <input
                    type="number"
                    value={pricePerScan}
                    onChange={(e) => setPricePerScan(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter price per scan"
                  />
                </div>
                <div className="flex justify-end flex-col gap-3">
                  <button
                    onClick={assignCampaign}
                    className="bg-oohpoint-primary-2 text-white py-2 w-full rounded-lg"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => setAssignModal(false)}
                    className="border-gray-200 border text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )} 
    </div>
  );
};

export default PaymentTable;
