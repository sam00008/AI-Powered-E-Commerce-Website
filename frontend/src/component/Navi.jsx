import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";
import { CiSearch, CiShoppingCart } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";

function Nav({ onProtectedClick }) {
    const { userData, logout } = useContext(UserDataContext);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // --- New Search State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false); // Loading spinner

    const profileRef = useRef(null);
    const searchRef = useRef(null); // Ref for search input + dropdown
    const navigate = useNavigate();
    const location = useLocation();

    const categories = ["New", "Women", "Men", "Jeans", "Kids", "Shirts", "T-Shirts"];

    // --- Click Outside Handler (Handles both Profile and Search) ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSuggestions([]); // Close suggestions
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Dynamic Search-as-you-type (Debounced) ---
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `http://localhost:3000/api/product/search?query=${encodeURIComponent(searchTerm)}`
                );
                const data = await response.json();
                
                // --- FIX: Check for data.status === 200, not data.success ---
                if (data.status === 200 && data.data) {
                    setSuggestions(data.data);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Search suggestion error:", error);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce: Wait 300ms after user stops typing
        const timerId = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(timerId); // Cleanup
    }, [searchTerm]);


    // Determine active category
    const currentCategory = categories.find(
        (cat) =>
            location.pathname.toLowerCase() ===
            `/category/${cat.replace(/\s+/g, "-").toLowerCase()}`
    );

    const handleCategoryClick = (category) => {
        const route = `/category/${category.replace(/\s+/g, "-").toLowerCase()}`;
        if (onProtectedClick) onProtectedClick(route);
        else navigate(route);
    };

    const handleSearchToggle = () => {
        setSearchOpen((prev) => !prev);
        if (!searchOpen) {
            setSuggestions([]); // Clear suggestions when opening
            setSearchTerm(""); // Clear term when opening fresh
        }
        setProfileOpen(false);
    };

    // --- Submitting the search (e.g., pressing "Enter") ---
    const handleSearchSubmit = () => {
        if (!searchTerm.trim()) return;

        const term = searchTerm.trim();
        const currentSuggestions = suggestions; // Capture suggestions

        // Reset the search UI immediately
        setSuggestions([]);
        setSearchTerm("");
        setSearchOpen(false);

        // --- INTENT: PRODUCT SEARCH ---
        // Navigate to the search results page, passing the term.
        // We pass the current suggestions as state to prevent re-fetching immediately on the search page.
        navigate(`/search?query=${encodeURIComponent(term)}`, { state: { initialResults: currentSuggestions } });
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSearchSubmit();
    };

    // --- Clicking a single suggestion item ---
    const handleSuggestionClick = (product) => {
        // Navigate to the specific product's page
        navigate(`/product/${product._id}`);

        // Reset search UI
        setSuggestions([]);
        setSearchTerm("");
        setSearchOpen(false);
    };

    const handleProtectedClick = (path) => {
        if (onProtectedClick) onProtectedClick(path);
        else navigate(path);
        setProfileOpen(false);
    };

    return (
        <nav className="relative">
            {/* ---- TOP BAR ---- */}
            <div className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    {/* Brand */}
                    <button
                        onClick={() => navigate("/")}
                        className="text-2xl font-bold text-[#F06C0F]"
                    >
                        Gravity
                    </button>

                    {/* Search + Icons */}
                    <div className="flex items-center space-x-4">

                        {/* --- Search Input + Dropdown Container --- */}
                        <div className="flex items-center" ref={searchRef}>
                            <div className="relative">
                                {searchOpen && (
                                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 mr-2 shadow-sm border border-gray-200">
                                        <CiSearch className="text-gray-500 w-5 h-5 mr-2" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            placeholder="Search products..."
                                            className="bg-transparent outline-none w-52 text-gray-700 placeholder-gray-500"
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {/* --- Suggestions Dropdown --- */}
                                {searchOpen && (isSearching || suggestions.length > 0) && (
                                    <div className="absolute left-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                                        {isSearching ? (
                                            <p className="px-4 py-2 text-sm text-gray-500">Searching...</p>
                                        ) : (
                                            suggestions.map((product) => (
                                                <button
                                                    key={product._id}
                                                    onClick={() => handleSuggestionClick(product)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
                                                >
                                                    {/* Assuming product has a 'name' field */}
                                                    {product.name}
                                                </button>
                                            ))
                                        )}
                                        {/* Added option to see all results */}
                                        {suggestions.length > 0 && (
                                            <button
                                                onClick={handleSearchSubmit}
                                                className="block w-full text-center px-4 py-2 text-sm font-semibold text-[#F06C0F] border-t hover:bg-gray-50"
                                            >
                                                View all results for "{searchTerm}"
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Search Toggle Icon */}
                            <button
                                onClick={handleSearchToggle}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                                aria-label="Toggle Search"
                            >
                                <CiSearch
                                    className={`text-2xl ${searchOpen ? "text-[#F06C0F]" : "text-gray-700"}`}
                                />
                            </button>
                        </div>


                        {/* Cart Icon */}
                        <button
                            onClick={() => handleProtectedClick("/cart")}
                            className="p-2 rounded-full hover:bg-gray-100 transition relative"
                            aria-label="Cart"
                        >
                            <CiShoppingCart className="text-2xl text-gray-700" />
                            {/* This '2' should come from your cart context later */}
                            <span className="absolute -top-1 -right-1 bg-[#F06C0F] text-white text-xs px-1.5 py-0.5 rounded-full">
                                2
                            </span>
                        </button>

                        {/* Profile Menu */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
                                aria-label="Profile Menu"
                            >
                                <FaUserCircle className="text-2xl text-gray-700" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                                    {userData ? (
                                        <div>
                                            <div className="p-3 border-b">
                                                <p className="text-sm font-medium truncate">{userData.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleProtectedClick("/profile")}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                My Profile
                                            </button>
                                            
                                            {/* 🎯 CORRECTED PATH: Leads to Order History List */}
                                            <button
                                                onClick={() => handleProtectedClick("/orders")} 
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Order History
                                            </button>
                                            
                                            {/* ... other links ... */}
                                            <button
                                                onClick={logout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <button
                                                onClick={() => handleProtectedClick("/login")}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Login
                                            </button>
                                            <button
                                                onClick={() => handleProtectedClick("/signup")}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ---- CATEGORY BAR (Unchanged) ---- */}
            <div className="bg-[#F06C0F]">
                <div className="container mx-auto flex justify-center flex-wrap space-x-4 py-2">
                    {categories.map((category, index) => {
                        const isActive = currentCategory === category;
                        return (
                            <button
                                key={index}
                                onClick={() => handleCategoryClick(category)}
                                className={`relative px-3 py-1 rounded transition font-medium
                                    ${isActive
                                    ? "bg-white text-[#F06C0F]"
                                    : "text-white hover:bg-white hover:text-[#F06C0F]"
                                }`}

                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

export default Nav;