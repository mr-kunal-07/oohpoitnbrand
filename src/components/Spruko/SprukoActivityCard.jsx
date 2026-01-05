import React from "react";

const data = [
  {
    id: 1,
    title: "Total Visits",
    value: "23,124",
    change: "1.75%",
    icon: "🎯",
    changeType: "increase",
    bgColor: "bg-purple-100",
  },
  {
    id: 2,
    title: "Total Products",
    value: "1.3k",
    change: "0.85%",
    icon: "📦",
    changeType: "decrease",
    bgColor: "bg-orange-100",
  },
  {
    id: 3,
    title: "Total Sales",
    value: "23.89k",
    change: "3.74%",
    icon: "💰",
    changeType: "increase",
    bgColor: "bg-green-100",
  },
  {
    id: 4,
    title: "Total Revenue",
    value: "$187.38k",
    change: "0.23%",
    icon: "💵",
    changeType: "increase",
    bgColor: "bg-yellow-100",
  },
  {
    id: 5,
    title: "Total Profit",
    value: "$84.33k",
    change: "4.95%",
    icon: "📉",
    changeType: "decrease",
    bgColor: "bg-blue-100",
  },
  {
    id: 6,
    title: "Total Income",
    value: "$983k",
    change: "1.75%",
    icon: "💲",
    changeType: "increase",
    bgColor: "bg-red-100",
  },
];

const SprukoActivityCard = () => {
  return (
    <div className="min-w-[15rem] bg-white shadow rounded-lg col-span-11 xl:col-span-3 lg:col-span-6 row-span-5">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg">Activity</h2>
      </div>
      <ul className="p-4 pt-0">
        {data.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between py-2 border-b border-gray-100"
          >
            <div className="flex items-center">
              <span
                className={`text-xl ${item.bgColor} p-2 rounded-full flex justify-center items-center text-center`}
              >
                {item.icon}
              </span>
              <div className="ml-3">
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p
                  className={`text-xs ${
                    item.changeType === "increase"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  <span className="text-gray-400">
                    {" "}
                    {item.changeType === "increase"
                      ? "Increased"
                      : "Decreased"}{" "}
                    by
                  </span>{" "}
                  {item.change} {item.changeType === "increase" ? "↑" : "↓"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg ">{item.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SprukoActivityCard;
