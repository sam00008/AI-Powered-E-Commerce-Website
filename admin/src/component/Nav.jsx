// src/component/Nav.jsx
import React from "react";
import { FiUser } from "react-icons/fi";

function Nav() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
        <FiUser className="text-[#fd7f20]" />
        <span className="text-gray-700 font-medium">Admin</span>
      </div>
    </div>
  );
}

export default Nav;
