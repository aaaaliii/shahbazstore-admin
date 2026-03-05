"use client";

import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import Sidebar from "./Sidebar";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FCFDFF]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-30">
        <Sidebar />
      </div>

      {/* Mobile overlay + sliding panel */}
      <div
        className={`
          fixed inset-0 z-50 flex md:hidden
          transition-opacity duration-300
          ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sliding sidebar */}
        <aside
          className={`
            relative w-72 bg-custom-gradient-blue
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <button
            className="absolute top-4 right-4 p-2"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <HiX className="text-white" size={24} />
          </button>
          <Sidebar />
        </aside>
      </div>

      <main className="flex-1 w-full md:ml-72 bg-[#FCFDFF] min-h-screen">
        {/* Mobile hamburger */}
        <div className="md:hidden mb-4 p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-xl">WA-AI</span>
            <button
              className="p-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <HiMenu size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 h-full max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
