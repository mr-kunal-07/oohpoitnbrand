function ProfileDetails({ profile, handleShow }) {
    const handleClick = () => {
      handleShow();
    };
  
    return (
      <div className="flex flex-col md:flex-row justify-between items-start p-4 md:p-6 bg-oohpoint-grey-100 md:px-20 md:py-10 rounded-2xl">
        {/* Left Section */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          {/* Back button */}
          <div className="flex items-center mb-4">
            <button className="p-2 -ml-4 md:-ml-12" onClick={handleClick}>
              <img src="/assets/Right side.png" alt="Back" className="w-4 md:w-auto" />
            </button>
            <h1 className="text-lg md:text-2xl text-oohpoint-primary-1 font-normal ml-2">
              {profile.name}
            </h1>
          </div>
  
          {/* Profile details */}
          <h2 className="text-lg md:text-[24px] text-oohpoint-primary-1 font-light mb-4">
            {profile.id}
          </h2>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <span className="font-semibold">Phone number</span>
            <span>{profile.phone}</span>
  
            <span className="font-semibold">Email ID</span>
            <span>{profile.email}</span>
  
            <span className="font-semibold">Location</span>
            <span>{profile.location}</span>
  
            <span className="font-semibold">License Certificate</span>
            <span className="text-blue-500 cursor-pointer">link</span>
  
            <span className="font-semibold">PAN Card</span>
            <span>{profile.panCard}</span>
  
            <span className="font-semibold">GST No.</span>
            <span className="text-blue-500 cursor-pointer">link</span>
  
            <span className="font-semibold">Proof of address</span>
            <span className="text-blue-500 cursor-pointer">link</span>
  
            <span className="font-semibold">Aadhar Card Number</span>
            <span className="text-blue-500 cursor-pointer">link</span>
  
            <span className="font-semibold">Assign Person</span>
            <span className="flex items-center">
              {profile.assignPerson}
              <img
                src={profile.assignPersonImage}
                alt="Assign Person"
                className="w-5 h-5 md:w-6 md:h-6 rounded-full ml-2"
              />
            </span>
          </div>
        </div>
  
        {/* Right Section */}
        <div className="flex flex-col justify-between w-full md:w-auto md:h-[45vh] gap-4">
          <div className="flex-grow"></div>
          <div className="flex gap-4 justify-center md:justify-start">
            <button className="bg-green-300 hover:bg-green-400 text-white py-2 px-4 rounded-md">
              Approve
            </button>
            <button className="bg-red-300 hover:bg-red-400 text-white py-2 px-4 rounded-md">
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default ProfileDetails;
  