import React from "react";
import VendorsCard from "./VendorsCard";
import VendorsCard2 from "./VendorsCard2";
import VendorsCard3 from "./VendorsCard3";
import VendorsCard4 from "./VendorsCard4";

const VendDetails = ({vendor}) => {
  console.log(vendor)

  return (
    <div className="w-full">
      {/* Profile Section */}
      <div className="w-full bg-oohpoint-grey-100 flex justify-between px-10 py-5 rounded-xl">
        <div>
          <h2 className="text-oohpoint-primary-1 text-3xl">Meet {vendor.ownerName}!</h2>
          <p>ID - {vendor.vid}</p>
        </div>
        <div>
          <img src="/assets/img.png" alt="" />
        </div>
      </div>

      <div className="mt-5 w-full grid gap-5 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
        
          <VendorsCard profile={vendor} />
          <VendorsCard4 profile={vendor} />
          <VendorsCard2 profile={vendor} />
          {/* <VendorsCard2 profile={vendor} /> */}
      </div>
        <div  className="mt-5 w-full flex gap-4 max-lg:flex-col">
          { vendor && <VendorsCard3 profile={vendor.campaigns} vendorId={vendor.vendorId} /> }
          {/* { vendor && <VendorsCard3 profile={vendor.campaigns} /> } */}
        </div>

  
    </div>
  );
};

export default VendDetails;
