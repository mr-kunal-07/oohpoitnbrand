import React from "react";
import { AiOutlineBell } from "react-icons/ai"; // Import the bell icon

const StackCard = ({ head, count, Icon }) => {
  // Sample data for the images
  const users = [
    { id: 1, src: "https://randomuser.me/api/portraits/men/1.jpg", alt: "User 1" },
    { id: 2, src: "https://randomuser.me/api/portraits/men/2.jpg", alt: "User 2" },
    { id: 3, src: "https://randomuser.me/api/portraits/women/1.jpg", alt: "User 3" },
    { id: 4, src: "https://randomuser.me/api/portraits/men/3.jpg", alt: "User 4" },
  ];

  return (
    <div className="min-w-[18rem] bg-white rounded-lg flex  flex-col  items-center px-4   w-fit lg:h-full max-lg:p-5">
      <div className="px-5 lg:pt-8 pb-6 flex justify-between items-start w-full">
        <div className="flex flex-col justify-start items-start gap-2">
          <h4 className="text-oohpoint-primary-2 font-medium">{head}</h4>
          <p className="text-oohpoint-primary-3 text-3xl font-bold">{count}</p>
        </div>
        {Icon && <AiOutlineBell className="text-3xl " />}
      </div>

      {/* Stack Images */}
      <div className="flex -space-x-3 mt-4 w-full px-5">
        {users.slice(0, 3).map((user) => (
          <img
            key={user.id}
            src={user.src}
            alt={user.alt}
            className="w-12 h-12 rounded-full border-2 border-white"
          />
        ))}
        <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white flex justify-center items-center text-purple-500 text-sm font-semibold">
          24+
        </div>
      </div>
    </div>
  );
};

export default StackCard;
