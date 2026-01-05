import React, { useState } from "react";
import VerificationTable from "../../VerificationTable";
import Details from "../../Details";
// import profile from "../../../public/assets/profile.png"
const Payment = () => {
  const [num, setNum] = useState(10);
  const [showDetail, setShowDetail] = useState(false);
  const data = [
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
    {
      id: "eagsaf",
      name: "Wade Warren",
      //   image: "/profile.png",
      phone: "+91 676383463",
      date: "11-09-2021",
      campaigns: 10,
    },
  ];
  const profileData = {
    name: "Kritika",
    id: "KRITI142523453",
    phone: "+91 56374578",
    email: "kritikabhardwaj@gmail.com",
    location: "Delhi, India",
    panCard: "+91 56374578",
    assignPerson: "Manju Sharma",
    assignPersonImage: "/profile.png",
  };

  const handleShow = ()=>{
    setShowDetail((prev)=> !prev)
  }

  return (
    <div className="w-full ">
      <div className="w-full bg-oohpoint-grey-100 flex justify-between px-5 rounded-2xl items-center py-5">
        <div>
          <h1 className="text-2xl text-oohpoint-primary-1">
            Number of pending Approvals
          </h1>
          <p className="text-base text-[#441886]">
            Total number of pending approvals of vendors
          </p>
        </div>
        <div className="text-3xl font-bold text-oohpoint-primary-2">{num}</div>
      </div>
      <div className="mt-10">
        {showDetail ? (
          <Details profile={profileData}  handleShow={handleShow}/>
        ) : (
          <VerificationTable data={data}  handleShow={handleShow}/>
        )}
        {/* <VerificationTable data={data}/> */}
        {/*  */}
      </div>
    </div>
  );
};

export default Payment;
