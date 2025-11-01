import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// 🎯 IMPORTANT: You must ensure useAuth provides a 'loadingUser' state.
import { useAuth } from '../context/authContext.jsx'; 
import Footer from '../component/Footer.jsx'; 

const OrderDetails = () => {
    // 1. Get the order ID from the URL
    const { orderId } = useParams();
    
    // 🎯 FIX: Destructure 'loadingUser' from the context
    const { API_BASE_URL, user, loadingUser } = useAuth(); 
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Helper Functions ---
    // Function to format numbers as Indian Rupee (₹) currency
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Confirmed': return 'bg-yellow-100 text-yellow-800';
            case 'Pending': 
            case 'Awaiting Payment': return 'bg-orange-100 text-orange-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // --- Data Fetching Effect (The FIX is here) ---
    useEffect(() => {
        // 🎯 FIX 1: If user authentication status is still loading, do nothing.
        if (loadingUser) {
            return;
        }

        // 🎯 FIX 2: If loading is complete AND there's no user (unauthorized), then redirect.
        if (!user || !orderId) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            setLoading(true);
            setError('');
            try {
                // Hitting the secure backend endpoint: e.g., http://localhost:3000/api/order/details/ID
                const response = await fetch(`${API_BASE_URL}/order/details/${orderId}`, {
                    method: 'GET',
                    credentials: 'include', // Ensures cookies (JWT) are sent
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    let errorMessage = `Failed to fetch order. Status: ${response.status}.`;
                    
                    // 🎯 IMPROVED ERROR HANDLING: Explicitly catch the 403 Forbidden error
                    if (response.status === 403 || response.status === 401) {
                        errorMessage = "Access Denied. Your session may have expired or you are not authorized to view this order. Please log in again.";
                    }
                    
                    // CRITICAL FIX: Handle HTML response for generic 404/500 errors
                    const contentType = response.headers.get("content-type");
                    
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } else if (response.status === 404) {
                         // Use the generic message if not JSON
                        errorMessage = `Order not found (404). Check the order ID in the URL. ${errorMessage}`;
                    }
                    
                    throw new Error(errorMessage);
                }

                const data = await response.json(); 
                setOrder(data.data); // Assuming your ApiResponse structure
            } catch (err) {
                console.error("Fetch Order Error:", err);
                setError(err.message || 'An unexpected error occurred while loading details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, API_BASE_URL, user, navigate, loadingUser]); // 🎯 FIX 3: Include loadingUser in dependency array

    // --- Loading and Error States (Rendering based on states) ---
    // Show a global loading indicator while user status is being checked OR order is being fetched
    if (loadingUser || loading) { 
        return <div className="min-h-screen flex items-center justify-center text-xl">Loading Order Details...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen p-8 text-center">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Error Loading Order</h2>
                <p className="text-gray-700 max-w-lg mx-auto whitespace-pre-wrap">{error}</p>
                <Link to="/orders" className="text-blue-500 hover:underline mt-4 block">
                    Go to Order History
                </Link>
            </div>
        );
    }
    
    if (!order) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Order not found.</div>;
    }

    const createdDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // --- Render Component (Currency Signs Updated) ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Header / Navbar (Simple) */}
            <nav className="bg-white shadow-md flex justify-between items-center px-4 py-3 md:px-6 md:py-4 mb-8 rounded-lg">
                <Link to="/" className="text-xl font-bold text-gray-800">Gravity Store</Link>
                <Link to="/orders" className="text-gray-600 hover:text-gray-800 transition">
                    ← Back to Order History
                </Link>
            </nav>

            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-100">
                
                {/* Order Confirmation Header */}
                <div className="text-center mb-10 border-b pb-6">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        🎉 Order Confirmation
                    </h1>
                    <p className="text-gray-600 text-lg">Thank you for your purchase!</p>
                </div>
                
                {/* Key Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-10">
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <p className="font-semibold text-gray-500">Order ID</p>
                        <p className="text-gray-900 font-mono text-base break-all">{order._id}</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <p className="font-semibold text-gray-500">Order Date</p>
                        <p className="text-gray-900 text-base">{createdDate}</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <p className="font-semibold text-gray-500">Order Status</p>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* --- 📦 Order Items Table (The Receipt) --- */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Items Ordered</h2>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start border-b pb-4">
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">{item.name}</span>
                                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                            </div>
                            <span className="font-bold text-gray-800">
                                {/* 🎯 CURRENCY FIX */}
                                { formatCurrency(item.price * item.quantity) }
                            </span>
                        </div>
                    ))}
                </div>

                {/* --- 💰 Totals and Final Amount --- */}
                <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-between text-gray-700 mb-2">
                        <span>Subtotal:</span>
                        {/* 🎯 CURRENCY FIX */}
                        <span>{ formatCurrency(order.totalAmount - (order.totalAmount > 10 ? 10 : 0)) }</span>
                    </div>
                    <div className="flex justify-between text-gray-700 mb-2">
                        <span>Shipping Cost:</span>
                        {/* 🎯 CURRENCY FIX (Assuming fixed shipping is ₹10 if total > 10, otherwise ₹0) */}
                        <span>{ formatCurrency(order.totalAmount > 10 ? 10 : 0) }</span> 
                    </div>
                    <div className="flex justify-between text-2xl font-extrabold text-gray-900 mt-4 pt-2 border-t border-dashed">
                        <span>Order Total:</span>
                        {/* 🎯 CURRENCY FIX */}
                        <span>{ formatCurrency(order.totalAmount) }</span>
                    </div>
                </div>

                {/* --- 🏠 Shipping Details --- */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Shipping Address</h3>
                        <p className="font-semibold">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="mt-2 text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Method</h3>
                        <p className="font-semibold">{order.paymentMethod}</p>
                        {order.paymentMethod === 'COD' && (
                            <p className="text-sm text-gray-600 mt-1">Payment will be collected upon delivery.</p>
                        )}
                    </div>
                </div>
                
                {/* Footer Action */}
                <div className="mt-10 text-center pt-6 border-t">
                    <Link 
                        to="/" 
                        className="bg-[#fc2e20] hover:bg-[#fd7f20] text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;