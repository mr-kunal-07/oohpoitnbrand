"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MyProvider } from "@/context/MyContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <MyProvider>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Main Layout Container */}
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-white">

        {/* Sidebar - Responsive (drawer on mobile, fixed on desktop) */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area - Responsive margin */}
        <div className="flex flex-col flex-1 h-screen overflow-hidden lg:ml-[72px] transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]">

          {/* Header - Sticky at top with mobile menu handler */}
          <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />

          {/* Content Area - Scrollable with proper background */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 custom-scrollbar">
            <div className="w-full min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>

    </MyProvider>
  );
}