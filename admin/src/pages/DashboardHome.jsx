import React, { useState } from "react";
import Nav from "../component/Nav.jsx";
import Sidebar from "../component/Slidebar.jsx";
import { FiAlignJustify } from "react-icons/fi";

function DashboardHome() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main content wrapper (shifts based on sidebar width) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-[18%]" : "ml-0"
        }`}
      >
        {/* Top Navbar */}
        <header className="bg-white shadow-md flex items-center justify-between px-6 py-3 sticky top-0 z-10 transition-all duration-300">
          {/* Left: toggle + title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-700 hover:text-[#fd7f20] transition"
            >
              <FiAlignJustify size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Gravity Store</h1>
          </div>

          {/* Right: Admin info */}
          <Nav />
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-8">Here is your overview.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow-md p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Total Users</h2>
              <p className="text-gray-500">350</p>
            </div>
            <div className="bg-white shadow-md p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
              <p className="text-gray-500">120</p>
            </div>
            <div className="bg-white shadow-md p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Total Products</h2>
              <p className="text-gray-500">75</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardHome;
