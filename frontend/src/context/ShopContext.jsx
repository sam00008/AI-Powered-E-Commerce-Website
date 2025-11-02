import React, { createContext, useState, useEffect, useMemo } from "react";

// Create Context
export const ShopDataContext = createContext();

function ShopContext({ children }) {
    // 🛑 NOTE: products state fetch is kept, but it is not directly related to the cart issue
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const currency = "₹";
    const API_BASE_URL = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com/api"; // Adjust port if needed

    // ✅ Fetch products (kept for product listing)
    useEffect(() => {
        const getProducts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/product/admin/list`);
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                setProducts(data.data || data);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        getProducts();
    }, []);

    // --- CART API FUNCTIONS ---

    // ✅ New function to fetch cart from backend
    const getCartData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/cart`, {
                method: "GET",
                credentials: "include", // ESSENTIAL for sending the cookie
            });

            if (res.status === 401) {
                // Not logged in: clear cart without an error alert
                setCart([]);
                return;
            }
            if (!res.ok) throw new Error("Failed to fetch cart");
            
            const responseData = await res.json();
            const backendCartItems = responseData?.data?.items || [];
            
            // Transform backend cart structure to match frontend needs
            const transformedCart = backendCartItems.map((item) => ({
                _id: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                image1: item.productId.image1, 
                qty: item.quantity, 
            }));
            
            setCart(transformedCart);

        } catch (error) {
            console.error("Error fetching cart:", error);
            setCart([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Initial cart load (replaces localStorage load)
    useEffect(() => {
        getCartData();
    }, []);

    // ✅ addToCart: Now just triggers a refresh, as the API call is in ProductCard
    const addToCart = async (product) => {
        try {
        const res = await fetch(`${API_BASE_URL}/cart/addcart`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product._id, quantity: 1 }),
        });

        if (!res.ok) {
            if (res.status === 401) {
                alert("Please log in to add items to your cart.");
                return;
            }
            throw new Error("Failed to add product to cart");
        }

        // Refresh cart after adding
        await getCartData();

    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Error adding to cart. Please try again later.");
    }
        await getCartData(); 
    };

    // ✅ Remove from cart - Synced with backend
    const removeFromCart = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/cart/remove`, {
                method: "DELETE", // Assuming your DELETE endpoint is protected
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: id }),
            });

            if (!res.ok) throw new Error("Failed to remove item");
            
            // Update local state instantly after successful API call
            setCart((prev) => prev.filter((p) => p._id !== id));
        } catch (error) {
            console.error("Remove item failed:", error);
            alert("Failed to remove item. Please log in and try again.");
        }
    };

    // ✅ Update quantity - Synced with backend
    const updateQty = async (id, qty) => {
        const quantity = parseInt(qty, 10);
        if (quantity <= 0 || isNaN(quantity)) return removeFromCart(id);
        
        try {
            const res = await fetch(`${API_BASE_URL}/cart/update`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: id, quantity }),
            });
            
            if (!res.ok) throw new Error("Failed to update quantity");

            // Update local state instantly after successful API call
            setCart((prev) => prev.map((p) => (p._id === id ? { ...p, qty: quantity } : p)));
        } catch (error) {
            console.error("Update quantity failed:", error);
            alert("Failed to update cart quantity. Please log in and try again.");
        }
    };

    // ✅ Clear cart - Requires API call
    const clearCart = async () => {
        // Assuming you have an API route to clear the cart for the user
        // If not, this function should be implemented on the backend.
        // For now, we clear the local state after API call.
        
        // This is a placeholder as the backend clear route is not provided
        // In a real app, you would fetch(CLEAR_CART_URL, {method: 'DELETE', credentials: 'include'})
        setCart([]);
    };

    // ✅ Total price (useMemo for slight optimization)
    const totalPrice = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    }, [cart]);

    const value = {
        products,
        cart,
        loading,        // Expose loading state
        getCartData,    // Expose for components that need to refresh cart
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalPrice,
        currency,
    };

    return (
        <ShopDataContext.Provider value={value}>
            {children}
        </ShopDataContext.Provider>
    );
}

export default ShopContext;