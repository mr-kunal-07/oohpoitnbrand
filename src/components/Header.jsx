"use client";
import { auth } from "@/firebase";
import { useAuth } from "@/context/MyContext";
import { Menu, Users, ChevronDown, UserPen, HeartHandshake, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import NotificationBell from "./NotificationBell";

const Header = ({ onMenuClick }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      document.cookie = "token=; path=/; max-age=0";
      toast.success("Logged out successfully");
      router.push("/");
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    setShowProfileMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">

        {/* Left Section - Menu Button & Brand */}


        {/* Brand Name */}
        <div className="hidden md:block min-w-0">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate uppercase ">
            {user?.brandName || "OOHPoint"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back
          </p>
        </div>


        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-2">

          {/* Desktop Leads Button */}
          <button
            onClick={() => router.push("/leads")}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-150"
          >
            <Users className="w-4 h-4" strokeWidth={2.5} />
            <span>Leads</span>
          </button>

          {/* Mobile Leads Button */}
          <button
            onClick={() => router.push("/leads")}
            className="sm:hidden flex items-center justify-center w-9 h-9 bg-purple-600 dark:bg-purple-700 text-white rounded-lg shadow-sm transition-all duration-150 flex-shrink-0"
            aria-label="View leads"
          >
            <Users className="w-4 h-4" strokeWidth={2.5} />
          </button>

          {/* Notifications */}
          {/* <NotificationBell /> */}

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 sm:gap-2.5 px-1 sm:px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full ring-2 ring-slate-200 dark:ring-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={user?.imageUrl ?? "/images/default-avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />

                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>

              {/* User Info - Desktop Only */}
              <div className="hidden lg:flex flex-col items-start min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[140px]">
                  {user?.pocs?.[0]?.name || user?.brandName || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              {/* Chevron - Desktop Only */}
              <ChevronDown
                className="hidden lg:block w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0"
                style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
                strokeWidth={2}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                style={{
                  animation: 'slideDown 0.15s ease-out',
                  transformOrigin: 'top right'
                }}
              >

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => handleNavigation("/profile")}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <UserPen className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Profile Settings</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Manage your account</p>
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Log out</p>
                      <p className="text-xs text-red-500/70 dark:text-red-400/70 truncate">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;