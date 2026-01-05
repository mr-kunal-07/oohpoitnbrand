"use client";
import { MyContext } from "@/context/MyContext";
import React, { useContext, useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

const Profile = () => {
  const { user } = useContext(MyContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-full min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-oohpoint-primary-2/10">
                  {user?.imageUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      src={user?.imageUrl}
                      alt={`${user?.name}'s profile`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-oohpoint-primary-2 to-oohpoint-primary-3 flex items-center justify-center">
                      <span className="text-white text-2xl md:text-3xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 bg-green-500 rounded-full border-4 border-white"
                  aria-label="Online status"
                ></div>
              </div>

              {/* Name and Title */}
              <div>
                <h1 className="text-gray-900 font-bold text-2xl md:text-3xl mb-1">
                  Welcome {user?.brandName || "User"}!
                </h1>
                <p className="text-oohpoint-tertiary-2 font-medium text-sm md:text-base flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Your business profile
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={openModal}
                className="bg-oohpoint-primary-2 hover:bg-oohpoint-primary-3 text-white py-3 px-6 rounded-xl font-medium shadow-lg shadow-oohpoint-primary-2/20 hover:shadow-xl hover:shadow-oohpoint-primary-2/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 justify-center"
                aria-label="Change password"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-oohpoint-primary-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Account Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Brand Name */}
            <div className="group">
              <label htmlFor="brandName" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-oohpoint-primary-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Brand Name
              </label>
              <input
                id="brandName"
                type="text"
                value={user?.brandName || ""}
                className="w-full rounded-xl py-3 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-medium cursor-not-allowed"
                disabled
              />
            </div>

            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-oohpoint-primary-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                className="w-full rounded-xl py-3 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-medium cursor-not-allowed"
                disabled
              />
            </div>

            {/* Business Name */}
            <div className="group">
              <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-oohpoint-primary-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={user?.businessName || ""}
                className="w-full rounded-xl py-3 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-medium cursor-not-allowed"
                disabled
              />
            </div>

            {/* Business Address */}
            <div className="group">
              <label htmlFor="businessAddress" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-oohpoint-primary-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Business Address
              </label>
              <input
                id="businessAddress"
                type="text"
                value={user?.businessAddress || ""}
                className="w-full rounded-xl py-3 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-medium cursor-not-allowed"
                disabled
              />
            </div>

            {/* Subscription */}
            <div className="group">
              <label htmlFor="subscription" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-oohpoint-primary-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Subscription
              </label>
              <select
                id="subscription"
                value={user?.subscription || "Basic"}
                className="w-full rounded-xl py-3 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-medium cursor-not-allowed"
                disabled
              >

                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Brand ID */}
            <div className="group">
              <label htmlFor="brandId" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-oohpoint-primary-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                Brand ID
              </label>
              <input
                id="brandId"
                type="text"
                value={user?.brandId || ""}
                className="w-full rounded-xl py-3 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-medium cursor-not-allowed"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <ChangePasswordModal onClose={closeModal} />}
    </div>
  );
};

export default Profile;