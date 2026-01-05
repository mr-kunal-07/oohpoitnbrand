"use client";
import { MyContext } from "@/context/MyContext";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Menu, Search, Users, ChevronDown, UserPen, HeartHandshake, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const router = useRouter();
  const { isOpen, setIsOpen, user, setIsHovered } = useContext(MyContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.error("Log in first");
        router.push("/sign-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        {/* Left Section - Menu & Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Hamburger Menu */}
          <button
            onClick={() => {
              setIsOpen((prev) => !prev);
              setIsHovered((prev) => !prev);
            }}
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
          </button>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Leads Button */}
          <button
            onClick={() => router.push("/leads")}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-oohpoint-primary-1 to-oohpoint-primary-1/90 hover:from-oohpoint-primary-1/90 hover:to-oohpoint-primary-1 text-white rounded-xl font-medium text-sm shadow-lg shadow-oohpoint-primary-1/25 hover:shadow-xl hover:shadow-oohpoint-primary-1/30 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Leads</span>
          </button>

          {/* Mobile Leads Button */}
          <button
            onClick={() => router.push("/leads")}
            className="sm:hidden flex items-center justify-center w-10 h-10 bg-gradient-to-r from-oohpoint-primary-1 to-oohpoint-primary-1/90 text-white rounded-xl shadow-lg shadow-oohpoint-primary-1/25 hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="View leads"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Divider */}
          <div className="hidden sm:block h-8 w-px bg-gray-200" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full ring-2 ring-gray-200 group-hover:ring-oohpoint-primary-1/50 transition-all duration-200 overflow-hidden">
                  <Image
                    src="/profile.png"
                    alt="profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>

              {/* User Info */}
              <div className="hidden lg:flex flex-col items-start min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {user?.pocs?.[0]?.name || user?.brandName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {user?.email}
                </p>
              </div>

              {/* Chevron */}
              <ChevronDown
                className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.pocs?.[0]?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <UserPen />
                      </div>
                      <div>
                        <p className="font-medium">Profile Settings</p>
                        <p className="text-xs text-gray-500">Manage your account</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        router.push("/helpdesk");
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <HeartHandshake />
                      </div>
                      <div>
                        <p className="font-medium">Help & Support</p>
                        <p className="text-xs text-gray-500">Get assistance</p>
                      </div>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => {
                        auth.signOut();
                        toast.success("Logged out successfully");
                        router.push("/sign-in");
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogOut />
                      </div>
                      <div>
                        <p className="font-medium">Log out</p>
                        <p className="text-xs text-red-400">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    
    </header>
  );
};

export default Header;