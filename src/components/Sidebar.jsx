"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useContext, useMemo, useState } from "react";
import { IoClose, IoHomeOutline } from "react-icons/io5";
import { MyContext } from "@/context/MyContext";
import {
  HeartHandshake,
  ShoppingBagIcon,
  TicketPercent,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Briefcase,
  ListChecks,
  StarIcon,
} from "lucide-react";
import { FaRegStickyNote } from "react-icons/fa";
import { useCampaignTypes } from "@/hooks/useCampaignTypes";

const Sidebar = () => {
  const { user, isOpen, setIsOpen, isHovered, setIsHovered } =
    useContext(MyContext);
  const router = useRouter();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);
  const { hasPrizeMode, hasProductMode, hasSocietyMode, bothTypes } = useCampaignTypes();

  // Memoized menu list - conditionally show dashboard dropdown
  const menuItems = useMemo(() => {
    let dashboardItem;

    // If brand has all modes (Prize + Product + Society)
    if (hasProductMode && hasPrizeMode && hasSocietyMode) {
      dashboardItem = {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
        children: [
          { label: "Campaigns", path: "/dashboard", icon: Layers },
          { label: "Samplings", path: "/dashboard/sampling", icon: Sparkles },
          { label: "Society", path: "/dashboard/society", icon: Users },
        ],
      };
    }

    // If brand has society + product
    else if (hasSocietyMode && hasProductMode && !hasPrizeMode) {
      dashboardItem = {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
        children: [
          { label: "Samplings", path: "/dashboard/sampling", icon: Sparkles },
          { label: "Society", path: "/dashboard/society", icon: Users },
        ],
      };
    }

    // If brand has society + prize
    else if (hasSocietyMode && hasPrizeMode && !hasProductMode) {
      dashboardItem = {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
        children: [
          { label: "Campaigns", path: "/dashboard", icon: Layers },
          { label: "Society", path: "/dashboard/society", icon: Users },
        ],
      };
    }

    // BothTypes (Prize + Product) — no society
    else if (bothTypes && !hasSocietyMode) {
      dashboardItem = {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
        children: [
          { label: "Campaigns", path: "/dashboard", icon: Layers },
          { label: "Samplings", path: "/dashboard/sampling", icon: Sparkles },
        ],
      };
    }

    // Society only
    else if (hasSocietyMode && !hasProductMode && !hasPrizeMode) {
      dashboardItem = {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
      };
    }

    // Product mode only
    else if (hasProductMode && !hasPrizeMode && !hasSocietyMode) {
      dashboardItem = {
        label: "Dashboard",
        path: "/dashboard/sampling",
        icon: IoHomeOutline,
      };
    }

    // Prize mode only
    else {
      dashboardItem = {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
      };
    }

    return [
      dashboardItem,
      { label: "Campaigns", path: "/campaigns", icon: ShoppingBagIcon },
      {
        label: "Offers",
        path: "/offers",
        icon: TicketPercent,
        children: [
          { label: "Push Offers", path: "/offers", icon: Layers },
          { label: "List Product/Services", path: "/offers/list", icon: ListChecks },
        ],
      },
      {
        label: "GIG",
        path: "/gig",
        icon: StarIcon,
        children: [
          { label: "GIG Dashboard", path: "/gig", icon: Layers },
          { label: "Post Internship/Job", path: "/gig/Jobs", icon: Briefcase },
        ],
      },
      { label: "Helpdesk", path: "/helpdesk", icon: HeartHandshake },
      { label: "Suggest Feature", path: "/suggestFeature", icon: FaRegStickyNote },
    ];
  }, [hasPrizeMode, hasProductMode, hasSocietyMode, bothTypes]);



  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false);
  };

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50
          transition-[width,transform] duration-200 ease-out
          bg-gradient-to-br from-oohpoint-primary-1 via-oohpoint-primary-1 to-oohpoint-primary-1/90
          border-r border-white/10
          flex flex-col shadow-2xl
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isHovered ? "w-72" : "w-20"}
        `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-design-bg bg-contain bg-center bg-repeat opacity-[0.03]" />
        </div>

        {/* Content */}
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-white/10">
            <div
              className="flex items-center gap-3 overflow-hidden cursor-pointer"
              onClick={() => handleNavigation("/")}
            >
              <Image
                src="/logo.png"
                alt="logo"
                width={40}
                height={40}
                className="w-12 rounded-xl h-12 object-contain"
                priority
              />
              {isHovered && (
                <span className="text-white font-bold text-lg whitespace-nowrap">
                  OOHPoint
                </span>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <IoClose className="text-2xl" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
            {isHovered && (
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-3">
                Menu
              </div>
            )}

            {menuItems.map(({ label, path, icon: Icon, badge, children }) => {
              const isActive = pathname === path;
              const isDropdownOpen = openDropdown === label;

              return (
                <div key={path}>
                  {/* Parent Button */}
                  <button
                    onClick={() =>
                      children ? toggleDropdown(label) : handleNavigation(path)
                    }
                    className={`
                      w-full group relative flex items-center gap-3 px-3 py-3.5 rounded-xl
                      transition-colors duration-150
                      ${isActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/8 hover:text-white"}
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 w-1 h-10 bg-white rounded-r-full -translate-x-3" />
                    )}

                    {/* Icon */}
                    <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <Icon className="text-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    {/* Label */}
                    {isHovered && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-sm font-medium whitespace-nowrap">
                          {label}
                        </span>

                        {children ? (
                          isDropdownOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          badge && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg">
                              <Sparkles className="w-2.5 h-2.5" />
                              {badge}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Children */}
                  {children && isDropdownOpen && isHovered && (
                    <div className="ml-8 mt-1 space-y-1 transition-all duration-300">
                      {children.map((sub) => {
                        const isSubActive = pathname === sub.path;
                        const SubIcon = sub.icon || Layers;
                        return (
                          <button
                            key={sub.path}
                            onClick={() => handleNavigation(sub.path)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSubActive
                              ? "bg-white/15 text-white"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                              }`}
                          >
                            <SubIcon className="w-4 h-4 opacity-80" />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
