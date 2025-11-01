// src/pages/Cart.jsx (Final Corrected Version)

import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <-- 1. Import useNavigate
import { ShopDataContext } from "../context/ShopContext.jsx";
import Footer from "../component/Footer.jsx";

function Cart() {
    const { cart, updateQty, removeFromCart, totalPrice, currency } = useContext(ShopDataContext);
    const navigate = useNavigate(); // <-- 2. Initialize navigate

    // State to manage loading status for specific item operations
    const [itemLoading, setItemLoading] = useState(null); 
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const shippingCost = 10; // example fixed cost
    const total = totalPrice + shippingCost;

    const handleQuantityChange = async (itemId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);
        if (quantity > 0) {
            setItemLoading(itemId); 
            await updateQty(itemId, quantity); 
            setItemLoading(null); 
        }
    };

    const handleRemoveItem = async (itemId) => {
        setItemLoading(itemId); 
        await removeFromCart(itemId); 
        setItemLoading(null); 
    };

    const handleCheckout = () => {
        // Only proceed if the cart isn't empty
        if (cart.length === 0) {
            return; 
        }
        
        setCheckoutLoading(true);
        
        // --- 3. CORRECT NAVIGATION LOGIC ---
        // Instead of a placeholder timeout/alert, we navigate directly.
        // We set a small timeout here only to show the "PROCESSING..." state briefly, 
        // which gives a better user experience on fast networks.
        setTimeout(() => {
            navigate("/checkout"); // <-- The key change: directs user to /checkout page
            setCheckoutLoading(false); // This line won't execute if navigation happens immediately
        }, 500); // 500ms delay to show the loading state
    };
    
    const isItemLoading = (itemId) => itemLoading === itemId;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-0">
            {/* Navbar */}
            <nav className="bg-white shadow-md flex justify-between items-center px-4 py-3 md:px-6 md:py-4 mb-8 rounded-lg">
                <Link to="/" className="text-xl font-bold text-gray-800">
                    Gravity Store
                </Link>
                <Link
                    to="/category/new"
                    className="bg-[#fd7f20] hover:bg-[#fc2e20] text-white px-3 py-1 md:px-4 md:py-2 rounded transition"
                >
                    Continue Shopping
                </Link>
            </nav>

            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Your Shopping Cart
            </h2>

            {cart.length === 0 ? (
                <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
                    <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
                    <Link
                        to="/category/new"
                        className="bg-[#fd7f20] hover:bg-[#fc2e20] text-white px-6 py-3 rounded transition"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        {cart.map((item) => (
                            <div
                                key={item._id}
                                className="flex flex-col md:flex-row items-center py-4 border-b last:border-b-0 relative"
                            >
                                {/* Loading overlay for item */}
                                {isItemLoading(item._id) && (
                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-md z-10">
                                        <p className="text-gray-700 font-semibold">Updating...</p>
                                    </div>
                                )}

                                <img
                                    src={item.image1 || "https://via.placeholder.com/100x100?text=Product"}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-md mr-4 mb-4 md:mb-0"
                                />
                                <div className="flex-grow text-center md:text-left mb-4 md:mb-0">
                                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                                    <p className="text-gray-600">
                                        Price: {currency}
                                        {item.price.toFixed(2)}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2 mr-4 mb-4 md:mb-0">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.qty}
                                        onChange={(e) =>
                                            handleQuantityChange(item._id, e.target.value)
                                        }
                                        disabled={isItemLoading(item._id)} 
                                        className="w-16 p-2 border border-gray-300 rounded-md text-center disabled:opacity-70 disabled:bg-gray-100"
                                    />
                                    <p className="text-gray-700 font-medium">
                                        Subtotal: {currency}
                                        {(item.price * item.qty).toFixed(2)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleRemoveItem(item._id)}
                                    disabled={isItemLoading(item._id)} 
                                    className="text-red-500 hover:text-red-700 transition px-3 py-1 rounded disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
                            Order Summary
                        </h3>
                        <div className="flex justify-between text-gray-700 mb-2">
                            <span>Subtotal:</span>
                            <span>
                                {currency}
                                {totalPrice.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-700 mb-4 border-b pb-4">
                            <span>Shipping:</span>
                            <span>
                                {currency}
                                {shippingCost.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-800 mb-6">
                            <span>Total:</span>
                            <span>
                                {currency}
                                {total.toFixed(2)}
                            </span>
                        </div>
                        <button
                            className="w-full bg-[#fd7f20] hover:bg-[#fc2e20] text-white py-3 rounded-lg text-lg font-semibold transition disabled:opacity-50"
                            onClick={handleCheckout}
                            disabled={checkoutLoading || cart.length === 0} // Disable if cart is empty
                        >
                            {checkoutLoading ? "PROCESSING..." : "Proceed to Checkout"}
                        </button>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default Cart;