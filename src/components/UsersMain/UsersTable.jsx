"use client";
import React, { useState } from "react";
import Link from "next/link";

const UserTable = () => {
  const users = [
    {
      userName: "YGSBGFCNDB",
      email: "hgdjfhv@gmail.com",
      phone: "+91 675645346",
      joinedDate: "11-09-2024",
      lastActivity: "11-09-2024",
      totalOrders: 88,
      status: "Active",
    },
    {
      userName: "JFSDNFSD",
      email: "email2@gmail.com",
      phone: "+91 675645345",
      joinedDate: "12-09-2024",
      lastActivity: "12-09-2024",
      totalOrders: 45,
      status: "Blocked",
    },
    {
      userName: "KDNDJDJDD",
      email: "email3@gmail.com",
      phone: "+91 675645344",
      joinedDate: "13-09-2024",
      lastActivity: "13-09-2024",
      totalOrders: 23,
      status: "Active",
    },
    {
      userName: "NSFSDFD",
      email: "email4@gmail.com",
      phone: "+91 675645343",
      joinedDate: "14-09-2024",
      lastActivity: "14-09-2024",
      totalOrders: 67,
      status: "Active",
    },
    {
      userName: "SGDFSGDS",
      email: "email5@gmail.com",
      phone: "+91 675645342",
      joinedDate: "15-09-2024",
      lastActivity: "15-09-2024",
      totalOrders: 89,
      status: "Blocked",
    },
    {
      userName: "SRRRDFSD",
      email: "email6@gmail.com",
      phone: "+91 675645341",
      joinedDate: "16-09-2024",
      lastActivity: "16-09-2024",
      totalOrders: 102,
      status: "Active",
    },
    // Add more user data here...
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Calculate the indices of the first and last user for the current page
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="">
            <tr className="text-left text-gray-700">
              <th className="p-2">User Name</th>
              <th className="p-2">Email ID</th>
              <th className="p-2">Phone Number</th>
              <th className="p-2">Joined Date</th>
              <th className="p-2">Last Activity</th>
              <th className="p-2">Total Orders/Services</th>
              <th className="p-2">User Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 whitespace-nowrap">{user.userName}</td>
                <td className="p-2 whitespace-nowrap">{user.email}</td>
                <td className="p-2 whitespace-nowrap">{user.phone}</td>
                <td className="p-2 whitespace-nowrap">{user.joinedDate}</td>
                <td className="p-2 whitespace-nowrap">{user.lastActivity}</td>
                <td className="p-2 whitespace-nowrap">{user.totalOrders}</td>
                <td className="p-2 whitespace-nowrap">
                  <span
                    className={`text-${
                      user.status === "Active" ? "green" : "red"
                    }-500 font-normal`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-2 space-x-2 whitespace-nowrap flex flex-col gap-2">
                  <Link href="/users/users-details">
                    <button className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full hover:bg-gray-300 ">
                      Details
                    </button>
                  </Link>

                  <button className="bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600">
                    Block
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4">
          <nav className="inline-flex -space-x-px">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded-l-md border-gray-300 bg-white hover:bg-gray-100 text-gray-500 ${
                currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              &lt;
            </button>
            <button className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-100 text-gray-500">
              {currentPage}
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded-r-md border-gray-300 bg-white hover:bg-gray-100 text-gray-500 ${
                currentPage === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              &gt;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
