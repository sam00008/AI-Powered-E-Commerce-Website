import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext.jsx";
import { useNavigate } from "react-router-dom";
import { Package, Calendar, IndianRupee, Truck, ShoppingBag, XCircle } from "lucide-react";

const OrderHistory = () => {
  const { user, loading, API_BASE_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch user's order history
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrderHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/order/history`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to load orders (HTTP ${res.status})`);
        }

        const data = await res.json();
        setOrders(data.data || []);
      } catch (err) {
        console.error("Fetch Order History Error:", err);
        setError(err.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrderHistory();
  }, [API_BASE_URL, user, loading, navigate]);

  // ✅ Cancel order functionality
  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const res = await fetch(`${API_BASE_URL}/order/cancel/${orderId}`, {
        method: "PUT", // or PATCH depending on backend
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to cancel order (HTTP ${res.status})`);
      }

      // ✅ Optimistic UI update — immediately mark order as Cancelled
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "Cancelled" } : o
        )
      );

      alert("Order cancelled successfully.");
    } catch (error) {
      console.error("Cancel Order Error:", error);
      alert("Failed to cancel the order. Please try again.");
    }
  };

  // ✅ Loading state
  if (loading || loadingOrders) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <ShoppingBag className="w-12 h-12 animate-bounce mb-4 text-blue-600" />
        <p className="text-lg font-medium">Fetching your orders...</p>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p className="text-lg font-semibold">⚠️ {error}</p>
      </div>
    );
  }

  // ✅ No orders
  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Package className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
        <p className="text-gray-600 mb-6">You haven’t placed any orders yet.</p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // ✅ Render orders elegantly
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Your Orders
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                {/* Left section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Order #{order._id.slice(-6)}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-gray-600 font-medium">Items:</p>
                    <ul className="pl-5 list-disc text-gray-700 text-sm">
                      {order.items?.map((item, index) => (
                        <li key={index}>
                          <span className="font-medium">{item.productName}</span>{" "}
                          — Qty: {item.quantity} — ₹{item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right section */}
                <div className="text-right md:text-left">
                  <p className="text-lg font-semibold flex items-center justify-end md:justify-start gap-1 text-gray-800">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    {order.totalAmount?.toFixed(2)}
                  </p>

                  <p
                    className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending" ||
                          order.status === "Not Confirmed"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    {order.status}
                  </p>

                  {/* ✅ Cancel Button (only for Pending or Not Confirmed orders) */}
                  {(order.status === "Pending" ||
                    order.status === "Not Confirmed") && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="mt-3 flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-100 p-4 text-right">
                <button
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
