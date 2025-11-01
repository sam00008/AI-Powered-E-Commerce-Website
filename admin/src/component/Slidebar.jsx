import React from "react";
import { Link } from "react-router-dom";

function Sidebar({ isOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white border-r shadow-md transition-all duration-300 z-20 ${
        isOpen ? "w-[18%]" : "w-0"
      } overflow-hidden`}
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-8 text-gray-800">Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <Link to="/dashboard" className="text-gray-700 hover:text-[#fd7f20]">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/add" className="text-gray-700 hover:text-[#fd7f20]">
              Add Product
            </Link>
          </li>
          <li>
            <Link to="/lists" className="text-gray-700 hover:text-[#fd7f20]">
              Product List
            </Link>
          </li>
          <li>
            <Link to="/order" className="text-gray-700 hover:text-[#fd7f20]">
              Orders
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
