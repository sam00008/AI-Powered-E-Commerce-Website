import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx"; // <-- Ensure path is correct

// Star Rating (unchanged)
const StarRating = ({ rating }) => {
    // ... (StarRating implementation remains the same)
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const starIcon = (fill, index) => (
        <svg
            key={`${fill}-${index}`}
            className={`w-3 h-3 ${fill}`}
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.001 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
    );

    return (
        <div className="flex items-center space-x-0.5">
            {[...Array(fullStars)].map((_, i) => starIcon("text-gray-900", i))}
            {hasHalfStar && starIcon("text-gray-900/50", "half")}
            {[...Array(emptyStars)].map((_, i) => starIcon("text-gray-300", i))}
            <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
        </div>
    );
};

// --- MAIN PRODUCT CARD ---
const ProductCard = ({ product, currency = "₹" }) => {
    const navigate = useNavigate();
    const { getCartData } = useContext(ShopDataContext); // ✅ Import getCartData
    const [selectedColor, setSelectedColor] = useState(
        product.colors ? product.colors[0] : null
    );
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = "http://localhost:3000/api"; // Adjust port if needed

    const displayImage =
        product.image1 ||
        product.images?.[0] ||
        "https://via.placeholder.com/400x500/F0F0F0/000000?text=Product";

    const finalPrice = product.salePrice || product.price;
    const originalPrice = product.salePrice ? product.price : null;

    // --- ADD TO CART FUNCTIONALITY ---
    const handleAddToCartClick = async () => {
        try {
            setLoading(true);

            // Fetch call to the authenticated backend API
            const response = await fetch(`${API_BASE_URL}/cart/addcart`, {
                method: "POST",
                credentials: "include", // 👈 ESSENTIAL for sending the cookie
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Product added to cart successfully!");
                // ✅ CRITICAL FIX: Refresh the cart state from the backend
                await getCartData(); 
            } else {
                alert(data.message || "Failed to add to cart");
                if (response.status === 401) {
                    navigate("/login"); // Redirect if not authorized/expired token
                }
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Something went wrong while adding to cart.");
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNowClick = async () => {
        // Buy Now should ensure the item is in the cart and then navigate.
        await handleAddToCartClick(); 
        navigate("/checkout");
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-500 hover:shadow-xl relative overflow-hidden">
            {/* ... (Rest of JSX remains the same) ... */}
            <div className="relative overflow-hidden">
                <a href={`/products/${product._id}`} className="block">
                    <div className="relative w-full aspect-[4/5] overflow-hidden">
                        <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
                            loading="lazy"
                        />
                    </div>
                </a>
            </div>

            <div className="p-4 flex flex-col space-y-3">
                <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                        {product.category || "Apparel"}
                    </p>
                    <a
                        href={`/products/${product._id}`}
                        className="text-gray-900 hover:text-gray-600 transition font-semibold text-base leading-snug truncate block"
                        title={product.name}
                    >
                        {product.name}
                    </a>
                </div>

                {product.rating && <StarRating rating={product.rating} />}

                <div className="flex items-center space-x-2">
                    <p
                        className={`font-extrabold ${
                            originalPrice ? "text-red-600" : "text-gray-900"
                        } text-xl`}
                    >
                        {currency}
                        {finalPrice.toFixed(2)}
                    </p>
                    {originalPrice && (
                        <p className="text-gray-400 line-through text-base font-normal">
                            {currency}
                            {originalPrice.toFixed(2)}
                        </p>
                    )}
                </div>

                {product.colors?.length > 0 && (
                    <div className="flex space-x-1.5">
                        {product.colors.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => setSelectedColor(color)}
                                title={color.name}
                                className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                                    selectedColor?.id === color.id
                                        ? "border-gray-900 ring-2 ring-gray-200"
                                        : "border-gray-300 hover:border-gray-500"
                                }`}
                            >
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{ backgroundColor: color.swatchUrl || "#ccc" }}
                                />
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex flex-col space-y-2 pt-2">
                    <button
                        onClick={handleAddToCartClick}
                        disabled={loading}
                        className="w-full bg-[#fd7f20] hover:bg-[#fc2e20] text-white py-3 text-sm font-semibold tracking-wide uppercase transition-colors disabled:opacity-50"
                    >
                        {loading ? "ADDING..." : "ADD TO CART"}
                    </button>

                    <button
                        onClick={handleBuyNowClick}
                        disabled={loading}
                        className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3 text-sm font-semibold tracking-wide uppercase transition-colors disabled:opacity-50"
                    >
                        BUY NOW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;