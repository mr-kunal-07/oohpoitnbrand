"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
    Bell, Eye, Trash2, Send, TrendingUp, Users, AlertTriangle, Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Notifications Data ---
const initialNotifications = [
    { id: 10, type: "campaign", category: "campaign_status", title: "Campaign Goes Live 🎉", message: "The 'Q4 Launch' is now live!", time: "5 minutes ago", read: false, action: false },
    { id: 9, type: "leads", category: "leads_customer_actions", title: "New Lead Captured", message: "New lead: Alex Smith.", time: "15 minutes ago", read: false, action: true, actionLabel: "View Lead" },
    { id: 8, type: "alert", category: "performance_milestones", title: "Milestone Reached! ⭐", message: "First 500 engagements reached.", time: "2 hours ago", read: false, action: false },
    { id: 7, type: "inbox", category: "system_alerts", title: "Account Update", message: "Your subscription renews in 3 days.", time: "4 hours ago", read: false, action: true, actionLabel: "Renew" },
    { id: 6, type: "campaign", category: "campaign_status", title: "Campaign Paused", message: "Paused due to low inventory.", time: "Yesterday", read: true, action: false },
    { id: 5, type: "alert", category: "performance_milestones", title: "Engagement Drop", message: "AI is optimizing engagement.", time: "Yesterday", read: true, action: false },
];

// --- Tabs ---
const tabsConfig = [
    { name: "All", icon: <Bell className="w-4 h-4" />, key: "all" },
    { name: "Campaigns", icon: <Send className="w-4 h-4" />, key: "campaign_status" },
    { name: "Performance", icon: <TrendingUp className="w-4 h-4" />, key: "performance_milestones" },
    { name: "Leads", icon: <Users className="w-4 h-4" />, key: "leads_customer_actions" },
];

// --- Icon mapping ---
const getCategoryIcon = (category) => {
    switch (category) {
        case "campaign_status": return { icon: <Send className="w-5 h-5" />, color: "bg-indigo-600" };
        case "performance_milestones": return { icon: <TrendingUp className="w-5 h-5" />, color: "bg-teal-600" };
        case "leads_customer_actions": return { icon: <Users className="w-5 h-5" />, color: "bg-blue-600" };
        case "system_alerts": return { icon: <AlertTriangle className="w-5 h-5" />, color: "bg-red-600" };
        default: return { icon: <Mail className="w-5 h-5" />, color: "bg-gray-500" };
    }
};

// --- Notification Item ---
const NotificationItem = React.memo(({ n, handleNotificationClick, handleAction, isLoading }) => {
    const { icon, color } = getCategoryIcon(n.category);
    const isUnread = !n.read;
    const buttonLabel = n.actionLabel || "View Details";

    return (
        <div
            className={`flex items-start gap-3 p-3 transition-all cursor-pointer group rounded-lg ${isUnread
                ? "bg-indigo-50 hover:bg-indigo-100 border-l-4 border-indigo-600"
                : "bg-white hover:bg-gray-50 border-l-4 border-transparent"
                }`}
            onClick={() => handleNotificationClick(n.id)}
        >
            <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${color}`}>
                {icon}
            </div>

            <div className="flex-1 text-sm text-gray-700">
                <p className={`text-sm leading-snug ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                    {n.title}: <span className="font-normal">{n.message}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                    <span>{n.time}</span>
                    {isUnread && (
                        <span className="text-xs font-bold text-red-600 ml-2">• NEW</span>
                    )}
                </p>

                {n.action && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => handleAction(n.id, "action")}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:bg-indigo-400"
                            disabled={isLoading}
                        >
                            {buttonLabel}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); handleAction(n.id, "dismiss"); }}
                className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 self-center disabled:opacity-50"
                aria-label={`Dismiss notification ${n.title}`}
                disabled={isLoading}
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
});
NotificationItem.displayName = 'NotificationItem';

// --- Main Component ---
export default function NotificationBell({ initialCount = 3 }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [notifications, setNotifications] = useState(initialNotifications);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef(null);
    const router = useRouter();

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const filteredNotifications = useMemo(() => {
        let list = activeTab === "all" ? notifications : notifications.filter(n => n.category === activeTab);
        return [...list].sort((a, b) => (!a.read && b.read ? -1 : a.read && !b.read ? 1 : b.id - a.id));
    }, [notifications, activeTab]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = useCallback((id, type) => {
        setIsLoading(true);
        setTimeout(() => {
            if (type === "dismiss" || type === "action") setNotifications(prev => prev.filter(n => n.id !== id));
            else if (type === "markRead") setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setIsLoading(false);
        }, 300);
    }, []);

    const markAllAsRead = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setIsLoading(false);
        }, 300);
    }, []);

    const handleNotificationClick = useCallback((id) => {
        handleAction(id, "markRead");
    }, [handleAction]);

    return (
        <div className="relative z-[999]" ref={ref}>
            {/* Bell */}
            <button
                onClick={() => setOpen(!open)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Notifications"
                aria-expanded={open}
            >
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                {unreadCount > 0 && (
                    <>
                        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                    </>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-3 w-100 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-fade-in slide-in-top transform-gpu overflow-hidden">
                    {/* Header & Tabs */}
                    <div className="sticky top-0 bg-white p-4 z-10 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">Notifications</h3>
                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0 || isLoading}
                                className={`flex items-center gap-1 text-sm transition-colors p-1 rounded-md ${unreadCount > 0
                                    ? "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                    : "text-gray-400 cursor-not-allowed"
                                    } disabled:opacity-50`}
                                aria-label="Mark all as read"
                            >
                                <Eye className="w-4 h-4" />
                                Mark all read
                            </button>
                        </div>

                        <div className="flex gap-1 -mb-px overflow-x-auto justify-between">
                            {tabsConfig.map((t) => {
                                const tabCount = t.key === "all" ? filteredNotifications.length : notifications.filter(n => n.category === t.key).length;
                                return (
                                    <button
                                        key={t.key}
                                        onClick={() => setActiveTab(t.key)}
                                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all border-b-2 whitespace-nowrap ${activeTab === t.key
                                            ? "text-indigo-600 bg-indigo-50 border-indigo-600"
                                            : "text-gray-500 hover:bg-gray-100 border-transparent"
                                            }`}
                                    >
                                        {t.icon}
                                        {t.name}
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === t.key ? "bg-indigo-200 text-indigo-800" : "bg-gray-200 text-gray-600"}`}>
                                            {tabCount}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100 relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                                <svg className="w-6 h-6 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="ml-2 text-indigo-600 font-medium text-sm">Processing...</p>
                            </div>
                        )}

                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map(n => (
                                <NotificationItem
                                    key={n.id}
                                    n={n}
                                    handleNotificationClick={handleNotificationClick}
                                    handleAction={handleAction}
                                    isLoading={isLoading}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                                <AlertTriangle className="w-8 h-8 text-gray-300 mb-3" />
                                <p className="font-semibold text-gray-700">All caught up!</p>
                                <p className="text-sm">No notifications in the {tabsConfig.find(t => t.key === activeTab)?.name} tab.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 text-center">
                        <button
                            onClick={() => { router.push("/notifications"); setOpen(false); }}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-all flex items-center justify-center w-full gap-1"
                        >
                            View All in Center →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
