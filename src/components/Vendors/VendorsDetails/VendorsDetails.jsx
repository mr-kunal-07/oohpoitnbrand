import React, { useState } from "react";
import Table from "@/components/Table";
import VendDetails from "./VendDetails";

const VendorsDetails = ({ vendor }) => {
  const [show, setShow] = useState(false);  // to toggle between table and vendor details
  const [selectedVendor, setSelectedVendor] = useState(null);  // to store selected vendor

  const handleShow = (vendor) => {
    setSelectedVendor(vendor);  // set the selected vendor
    setShow(true);  // show the vendor details
  };

  const handleBack = () => {
    setShow(false);  // go back to the table
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-2 md:gap-4">
        <button className="bg-oohpoint-grey-100 px-4 md:px-6 py-2 rounded-lg text-oohpoint-primary-2 w-full md:w-auto">
          Verified
        </button>
        <button className="bg-oohpoint-grey-100 px-4 md:px-6 py-2 rounded-lg text-oohpoint-primary-2 w-full md:w-auto">
          Disabled
        </button>
        <button className="bg-oohpoint-grey-100 px-4 md:px-6 py-2 rounded-lg text-oohpoint-primary-2 w-full md:w-auto">
          Unverified
        </button>
      </div>

      <div className="w-full mt-5">
        {show && selectedVendor ? (
          <VendDetails vendor={selectedVendor} handleBack={handleBack} />
        ) : (
          vendor && <Table data={vendor} handleShow={handleShow} isShow={true} />
        )}
      </div>
    </div>
  );
};

export default VendorsDetails;
