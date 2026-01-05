import React from "react";

const Card = ({ head, count, Icon }) => {
  return (
    <div className=" bg-oohpoint-grey-100 rounded-lg p-8 py-7 flex justify-between items-start w-[100%] min-w-[18rem]">
      <div className=" flex flex-col justify-start items-start gap-2">
        <h4 className=" text-oohpoint-primary-2 font-medium">{head}</h4>
        <p className=" text-oohpoint-primary-3 text-3xl font-bold">{count}</p>
      </div>
      <Icon className=" text-3xl text-oohpoint-tertiary-2" />
    </div>
  );
};

export default Card;
