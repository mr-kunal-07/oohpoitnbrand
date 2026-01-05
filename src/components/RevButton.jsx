import React from "react";

const RevButton = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="hover:text-white border flex justify-center items-center border-primary hover:scale-90 shadow-md transition-all duration-300 hover:bg-primary bg-[#0046431f] text-primary hover:rounded-bl-none hover:rounded-tr-none px-4 py-1 rounded-md"
    >
      {children}
    </button>
  );
};

export default RevButton;
