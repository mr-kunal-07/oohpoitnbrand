import React from "react";

const Sec1 = ({p1, p2, c1, c2}) => {
  return (
    <div className="bg-white rounded-lg p-8 py-[1.3rem] flex flex-col justify-start items-start gap-2 w-full">
      <div className="flex justify-between font-medium text-oohpoint-primary-2  w-full itesm-center">
        <div className="font-medium">{p1}</div>
        <div className=" text-3xl font-semibold">{c1}</div>
      </div>
      <div className=" flex justify-between font-medium text-oohpoint-primary-2 w-full items-center">
        <div className="font-medium ">{p2}</div>
        <div className=" text-3xl font-semibold">{c2}</div>
      </div>
    </div>
  );
};

export default Sec1;