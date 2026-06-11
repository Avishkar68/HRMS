import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/SideBar";
import { Menu } from "lucide-react";

const AdminPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-655 transition-all active:scale-[0.95]"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-gray-900 text-sm tracking-tight">ADMIN PORTAL</span>
        </div>
        <div className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-100">
          Admin
        </div>
      </header>

      {/* Sidebar with toggle control */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPage;
