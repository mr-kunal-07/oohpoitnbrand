'use client';

import React from "react";
import { PlusIcon } from "lucide-react";

export function RecentOrders() {
  const orders = [
    {
      address: "319 Haul Road, Saint Paul, MN",
      date: "Nov 14, 09:00",
      amount: "$ 6000",
    },
    {
      address: "319 Haul Road, Saint Paul, MN",
      date: "Nov 14, 09:00",
      amount: "$ 6000",
    },
    {
      address: "319 Haul Road, Saint Paul, MN",
      date: "Nov 14, 09:00",
      amount: "$ 6000",
    },
    {
      address: "319 Haul Road, Saint Paul, MN",
      date: "Nov 14, 09:00",
      amount: "$ 6000",
    },
    {
      address: "319 Haul Road, Saint Paul, MN",
      date: "Nov 14, 09:00",
      amount: "$ 6000",
    },
    {
      address: "319 Haul Road, Saint Paul, MN",
      date: "Nov 14, 09:00",
      amount: "$ 6000",
    },
    {
      address: "319 Haul Road, Saint Paul, MN",
      date: "Nov 14, 09:00",
      amount: "$ 6000",
    },
    {
      address: "319 Haul Road, Saint Paul, MN",
      date: "Nov 14, 09:00",
      amount: "$ 6000",
    },
  ];

  return (
    <div
      className="bg-oohpoint-grey-100  p-6 rounded-lg"
    >
      <div
        className="flex justify-between items-center mb-4"
      >
        <h2 className="text-xl font-semibold">
          Recent Orders
        </h2>
        <button
          className="p-2 bg-red-100 rounded-full"
        >
          <PlusIcon
            className="h-6 w-6 text-red-500"
          />
        </button>
      </div>
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={index}
            className="flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                {order.address}
              </p>
              <p className="text-sm text-gray-500">
                {order.date}
              </p>
            </div>
            <p className="font-medium">
              {order.amount}
            </p>
          </div>
        ))}
      </div>
      <button
        className="w-full text-center text-red-500 mt-4"
      >
        Load More
      </button>
    </div>
  );
}
