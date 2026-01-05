import React from "react";
import Card from "../Card";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCampaign } from "react-icons/md";
import { PiHandshake } from "react-icons/pi";
import UserTable from "./UsersTable";

const UsersMain = () => {
  return (
    <div className="bg-oohpoint-grey-200 w-full h-full flex flex-col justify-start items-start border-2">
      <div className=" w-full flex max-lg:flex-col  items-start justify-between px-8 py-4 gap-1">
        <div>
          <h1 className=" text-oohpoint-grey-500 font-bold text-4xl">Users</h1>
          <p className="text-oohpoint-tertiary-1">
            All you need to know about users!
          </p>
        </div>
        <div className="flex gap-5 max-md:flex-wrap max-md:gap-4 max-md:mt-3">
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-1 rounded-lg"
          />
          <div>
            <img src="/assets/refresh.png" alt="" srcset="" />
          </div>
        </div>
      </div>
      <div className="w-full px-8 gap-4">
        <div className=" w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2">
          <Card
            head="Pending Approvals"
            count="60"
            Icon={IoIosCheckmarkCircleOutline}
          />
          <Card head="Active Vendors" count="90" Icon={MdOutlineCampaign} />
          <Card head="Total number of vendors" count="60" Icon={PiHandshake} />
        </div>
      </div>
      <div className="mt-10 w-full px-5">
        <UserTable />
      </div>
    </div>
  );
};

export default UsersMain;
