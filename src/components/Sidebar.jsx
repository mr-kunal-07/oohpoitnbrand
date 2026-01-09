"use client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IoHomeOutline } from "react-icons/io5";
import {
  ShoppingBagIcon,
  TicketPercent,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  LifeBuoy,
  Star,
  Phone,
  Calendar,
} from "lucide-react";
import { useCampaignTypes } from "@/hook/useCampaignTypes";

const COLLAPSED_WIDTH = "72px";
const EXPANDED_WIDTH = "280px";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { hasPrizeMode, hasProductMode, hasSocietyMode, bothTypes } = useCampaignTypes();

  const getDashboardConfig = () => {
    const configs = {
      all: [
        { label: "Campaigns", path: "/dashboard", icon: Layers },
        { label: "Samplings", path: "/dashboard/sampling", icon: Sparkles },
        { label: "Society", path: "/dashboard/society", icon: Users },
      ],
      societyProduct: [
        { label: "Samplings", path: "/dashboard/sampling", icon: Sparkles },
        { label: "Society", path: "/dashboard/society", icon: Users },
      ],
      societyPrize: [
        { label: "Campaigns", path: "/dashboard", icon: Layers },
        { label: "Society", path: "/dashboard/society", icon: Users },
      ],
      prizeProduct: [
        { label: "Campaigns", path: "/dashboard", icon: Layers },
        { label: "Samplings", path: "/dashboard/sampling", icon: Sparkles },
      ],
    };

    const hasAll = hasProductMode && hasPrizeMode && hasSocietyMode;
    const hasSocietyProduct = hasSocietyMode && hasProductMode && !hasPrizeMode;
    const hasSocietyPrize = hasSocietyMode && hasPrizeMode && !hasProductMode;
    const hasPrizeProduct = bothTypes && !hasSocietyMode;
    const hasSocietyOnly = hasSocietyMode && !hasProductMode && !hasPrizeMode;
    const hasProductOnly = hasProductMode && !hasPrizeMode && !hasSocietyMode;

    const baseDashboard = { label: "Dashboard", icon: IoHomeOutline };

    if (hasAll) return { ...baseDashboard, path: "/dashboard", children: configs.all };
    if (hasSocietyProduct) return { ...baseDashboard, path: "/dashboard", children: configs.societyProduct };
    if (hasSocietyPrize) return { ...baseDashboard, path: "/dashboard", children: configs.societyPrize };
    if (hasPrizeProduct) return { ...baseDashboard, path: "/dashboard", children: configs.prizeProduct };
    if (hasSocietyOnly) return { ...baseDashboard, path: "/dashboard/society" };
    if (hasProductOnly) return { ...baseDashboard, path: "/dashboard/sampling" };

    return { ...baseDashboard, path: "/dashboard" };
  };

  const menuItems = useMemo(() => [
    getDashboardConfig(),
    { label: "My Campaigns", path: "/campaigns", icon: ShoppingBagIcon },
    {
      label: "Push Offers",
      path: "/offers",
      icon: TicketPercent
    },
  ], [hasPrizeMode, hasProductMode, hasSocietyMode, bothTypes]);

  const generalItems = [
    { label: "Support Center", path: "/support", icon: LifeBuoy },
    { label: "Write A Review", path: "/review", icon: Star },
    { label: "Contact Sales", path: "/contact-sales", icon: Phone },
    { label: "Book a Meeting", path: "/book-meeting", icon: Calendar },
  ];

  const navigate = (path) => {
    router.push(path);
    setOpenDropdown(null);
  };

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => {
    setIsExpanded(false);
    setOpenDropdown(null);
  };

  const fadeStyle = { opacity: isExpanded ? 1 : 0, transition: "opacity 0.15s ease-in-out" };

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm z-50 will-change-transform"
      style={{ width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH, transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => navigate("/dashboard")}>
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <img src="/logo.png" alt="logo" className="rounded-md w-full h-full object-cover" loading="lazy" />
            </div>
            <span className="text-slate-900 font-semibold text-base whitespace-nowrap" style={{ ...fadeStyle, pointerEvents: isExpanded ? "auto" : "none" }}>
              OOHPoint
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3" style={fadeStyle}>
            Navigation
          </div>

          <div className="space-y-0.5">
            {menuItems.map(({ label, path, icon: Icon, children }) => {
              const isActive = pathname === path;
              const isDropdownOpen = openDropdown === label;

              return (
                <div key={label}>
                  <button
                    onClick={() => (children ? toggleDropdown(label) : navigate(path))}
                    className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    {isActive && <div className="absolute left-0 w-1 h-5 bg-purple-600 rounded-r-full -translate-x-2" />}

                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <div className="flex items-center justify-between flex-1 min-w-0" style={fadeStyle}>
                      <span className="text-[13px] font-medium whitespace-nowrap">{label}</span>
                      {children && (isDropdownOpen ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />)}
                    </div>
                  </button>

                  {children && isDropdownOpen && isExpanded && (
                    <div className="ml-9 mt-0.5 space-y-0.5 animate-slideDown">
                      {children.map((sub) => {
                        const isSubActive = pathname === sub.path;
                        const SubIcon = sub.icon || Layers;
                        return (
                          <button
                            key={sub.path}
                            onClick={() => navigate(sub.path)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${isSubActive
                              ? "bg-purple-50 text-purple-700"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              }`}
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

          {/* General Section */}
          <div className="mt-6">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3" style={fadeStyle}>
              General
            </div>
            <div className="space-y-0.5">
              {generalItems.map(({ label, path, icon: Icon }) => {
                const isActive = pathname === path;
                return (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    {isActive && <div className="absolute left-0 w-1 h-5 bg-purple-600 rounded-r-full -translate-x-2" />}

                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span className="text-[13px] font-medium whitespace-nowrap flex-1 text-left" style={fadeStyle}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
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

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgb(203 213 225);
          border-radius: 2px;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;