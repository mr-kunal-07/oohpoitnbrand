"use client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MyProvider } from "@/context/MyContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <>
      <MyProvider>
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
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
          
          {/* Sidebar - Fixed position */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div 
            className="flex flex-col flex-1 h-screen overflow-hidden transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ marginLeft: '72px' }}
          >
            {/* Header - Sticky at top */}
            <Header />
            
            {/* Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 custom-scrollbar">
              <div className="w-full h-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </MyProvider>

      <style jsx global>{`
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar for webkit browsers */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Dark mode scrollbar */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* Prevent layout shift */
        body {
          overflow: hidden;
        }

        /* Optimize font rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Focus visible for accessibility */
        *:focus-visible {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Prevent text selection on UI elements */
        button,
        [role="button"] {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        /* Performance optimization for animations */
        .will-change-transform {
          will-change: transform;
        }

        /* Loading state optimization */
        .loading {
          pointer-events: none;
          opacity: 0.6;
        }
      `}</style>
    </>
  );
}