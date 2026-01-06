"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { IoClose, IoHomeOutline } from "react-icons/io5";
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
import { useCampaignTypes } from "@/hook/useCampaignTypes";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { hasPrizeMode, hasProductMode, hasSocietyMode, bothTypes } = useCampaignTypes();

  const getDashboardItem = () => {
    const hasAll = hasProductMode && hasPrizeMode && hasSocietyMode;
    const hasSocietyProduct = hasSocietyMode && hasProductMode && !hasPrizeMode;
    const hasSocietyPrize = hasSocietyMode && hasPrizeMode && !hasProductMode;
    const hasPrizeProduct = bothTypes && !hasSocietyMode;
    const hasSocietyOnly = hasSocietyMode && !hasProductMode && !hasPrizeMode;
    const hasProductOnly = hasProductMode && !hasPrizeMode && !hasSocietyMode;

    if (hasAll) {
      return {
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

    if (hasSocietyProduct) {
      return {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
        children: [
          { label: "Samplings", path: "/dashboard/sampling", icon: Sparkles },
          { label: "Society", path: "/dashboard/society", icon: Users },
        ],
      };
    }

    if (hasSocietyPrize) {
      return {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
        children: [
          { label: "Campaigns", path: "/dashboard", icon: Layers },
          { label: "Society", path: "/dashboard/society", icon: Users },
        ],
      };
    }

    if (hasPrizeProduct) {
      return {
        label: "Dashboard",
        path: "/dashboard",
        icon: IoHomeOutline,
        children: [
          { label: "Campaigns", path: "/dashboard", icon: Layers },
          { label: "Samplings", path: "/dashboard/sampling", icon: Sparkles },
        ],
      };
    }

    if (hasSocietyOnly) {
      return {
        label: "Dashboard",
        path: "/dashboard/society",
        icon: IoHomeOutline,
      };
    }

    if (hasProductOnly) {
      return {
        label: "Dashboard",
        path: "/dashboard/sampling",
        icon: IoHomeOutline,
      };
    }

    return {
      label: "Dashboard",
      path: "/dashboard",
      icon: IoHomeOutline,
    };
  };

  const menuItems = useMemo(() => {
    return [
      getDashboardItem(),
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
      // {
      //   label: "GIG",
      //   path: "/gig",
      //   icon: StarIcon,
      //   children: [
      //     { label: "GIG Dashboard", path: "/gig", icon: Layers },
      //     { label: "Post Internship/Job", path: "/gig/Jobs", icon: Briefcase },
      //   ],
      // },
      { label: "Helpdesk", path: "/helpdesk", icon: HeartHandshake },
    ];
  }, [hasPrizeMode, hasProductMode, hasSocietyMode, bothTypes]);

  const handleNavigation = (path) => {
    router.push(path);
    setOpenDropdown(null);
  };

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <aside 
      className="fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm z-50 will-change-transform"
      style={{ 
        width: isExpanded ? '280px' : '72px',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setOpenDropdown(null);
      }}
    >
      
      {/* Content */}
      <div className="relative flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => handleNavigation("/dashboard")}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <img 
                src="/logo.png" 
                alt="logo" 
                className="rounded-md w-full h-full object-cover" 
                loading="lazy"
              />
            </div>
            <span 
              className="text-slate-900 dark:text-white font-semibold text-base whitespace-nowrap"
              style={{
                opacity: isExpanded ? 1 : 0,
                transition: 'opacity 0.15s ease-in-out',
                pointerEvents: isExpanded ? 'auto' : 'none'
              }}
            >
              OOHPoint
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <div 
            className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3"
            style={{
              opacity: isExpanded ? 1 : 0,
              transition: 'opacity 0.15s ease-in-out'
            }}
          >
            Navigation
          </div>

          <div className="space-y-0.5">
            {menuItems.map(({ label, path, icon: Icon, children }) => {
              const isActive = pathname === path;
              const isDropdownOpen = openDropdown === label;

              return (
                <div key={`${label}-${path}`}>
                  {/* Parent Button */}
                  <button
                    onClick={() =>
                      children ? toggleDropdown(label) : handleNavigation(path)
                    }
                    className={`
                      w-full relative flex items-center gap-3 px-3 py-2.5 rounded-lg group/item
                      transition-all duration-150
                      ${isActive
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"}
                    `}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-purple-600 dark:bg-purple-500 rounded-r-full -translate-x-2" />
                    )}

                    {/* Icon Container */}
                    <div className="relative flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      <Icon 
                        className="w-5 h-5" 
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>

                    {/* Label and Chevron */}
                    <div 
                      className="flex items-center justify-between flex-1 min-w-0"
                      style={{
                        opacity: isExpanded ? 1 : 0,
                        transition: 'opacity 0.15s ease-in-out'
                      }}
                    >
                      <span className="text-[13px] font-medium whitespace-nowrap">
                        {label}
                      </span>

                      {children && (
                        <div className="ml-auto">
                          {isDropdownOpen ? (
                            <ChevronUp className="w-4 h-4 opacity-50" />
                          ) : (
                            <ChevronDown className="w-4 h-4 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Children */}
                  {children && isDropdownOpen && isExpanded && (
                    <div 
                      className="ml-9 mt-0.5 space-y-0.5 overflow-hidden"
                      style={{
                        animation: 'slideDown 0.2s ease-out'
                      }}
                    >
                      {children.map((sub) => {
                        const isSubActive = pathname === sub.path;
                        const SubIcon = sub.icon || Layers;
                        return (
                          <button
                            key={sub.path}
                            onClick={() => handleNavigation(sub.path)}
                            className={`
                              w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
                              transition-all duration-150
                              ${isSubActive
                                ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"}
                            `}
                          >
                            <SubIcon className="w-4 h-4 opacity-70" strokeWidth={2} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer Hint */}
        <div 
          className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-center"
          style={{
            opacity: isExpanded ? 1 : 0,
            transition: 'opacity 0.15s ease-in-out'
          }}
        >
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Hover to expand
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thumb-slate-300::-webkit-scrollbar-thumb {
          background-color: rgb(203 213 225);
          border-radius: 2px;
        }

        .dark .scrollbar-thumb-slate-700::-webkit-scrollbar-thumb {
          background-color: rgb(51 65 85);
          border-radius: 2px;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;