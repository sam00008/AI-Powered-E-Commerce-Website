// src/component/Nav.jsx
import React, { useState, useContext } from "react";
import { FiUser } from "react-icons/fi";
import { LogOut } from "lucide-react"; // Using lucide-react for a modern icon
import { authDataContext } from "../context/AuthProvider.jsx"; // 👈 Import the context

function Nav() {
    // State to toggle the dropdown menu visibility
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get admin data and logout function from context
    const { adminData, logoutAdmin } = useContext(authDataContext);

    // Get the admin's email or use a placeholder
    const adminEmail = adminData?.email || "Admin User";

    // Function to handle logout and close the dropdown
    const handleLogout = () => {
        logoutAdmin(); // Execute the context logout function
        setIsDropdownOpen(false); // Close the dropdown
    };

    return (
        <div className="relative flex items-center gap-4">
            
            {/* Admin Icon/Name Button (Toggles Dropdown) */}
            <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition duration-150 focus:outline-none"
                aria-expanded={isDropdownOpen}
                aria-controls="admin-dropdown"
            >
                <FiUser className="text-[#fd7f20]" />
                <span className="text-gray-700 font-medium">{adminEmail}</span>
            </button>

            {/* Dropdown Menu (Conditionally Rendered) */}
            {isDropdownOpen && (
                <div 
                    id="admin-dropdown"
                    className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                    {/* Admin Email Display */}
                    <div className="p-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Signed in as:</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{adminEmail}</p>
                    </div>

                    {/* Logout Option */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 transition duration-150"
                    >
                        <LogOut size={16} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default Nav;
