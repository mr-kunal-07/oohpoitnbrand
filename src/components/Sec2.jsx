import Image from "next/image";
import React from "react";

const Sec2 = ({Icon, value, para, img}) => {
  return (
    <div className="bg-white rounded-lg p-8 flex flex-col justify-center items-center gap-8 w-[30%] min-w-[18rem] min-h-[16.5rem] ">
      <div className="flex justify-between font-medium w-full items-center" >
        <Image src={img} height={1000} width={1000} className=" w-auto h-[5rem]"/>
        <div className=" text-3xl font-semibold text-green-400">{value}</div>
      </div>
      <div className="flex justify-between font-medium w-full items-center">
         <div className="text-[1.3rem] font-medium  text-purple-900">{para}</div>
         <Icon className=" text-[4rem] text-green-400" />
      </div>
    </div>
  );
};

export default Sec2;