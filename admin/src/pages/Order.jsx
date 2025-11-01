import React, { useState, useEffect, useContext } from "react";
import { authDataContext } from "../context/AuthProvider.jsx";
import axios from "axios";
import { toast } from "react-toastify";

function Order() {
  const { serverUrl } = useContext(authDataContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState({});

  // ✅ Fetch all orders (Admin)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/order/admin/list`);
      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update order status
  const handleStatusUpdate = async (orderId) => {
    try {
      const newStatus = selectedStatus[orderId];
      if (!newStatus) return toast.warning("Please select a status");

      const res = await axios.put(
        `${serverUrl}/api/order/status/${orderId}`,
        { status: newStatus }
      );

      toast.success("Order status updated");

      // 🚀 Update only the changed order instead of re-fetching
      const updatedOrder = res.data.data;
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  // ✅ Delete order
  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${serverUrl}/api/order/admin/delete/${orderId}`);
      toast.success("Order deleted successfully");
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-lg font-semibold text-gray-600">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        🧾 Order Management
      </h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found.</div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-xl bg-white">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    {order.shippingAddress?.fullName || "N/A"}
                    <div className="text-xs text-gray-500">
                      {order.shippingAddress?.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ₹{order.totalAmount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{order.paymentMethod}</td>
                  <td className="px-6 py-4">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                      <select
                        onChange={(e) =>
                          setSelectedStatus({
                            ...selectedStatus,
                            [order._id]: e.target.value,
                          })
                        }
                        value={selectedStatus[order._id] || ""}
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                      >
                        <option value="">Select</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => handleStatusUpdate(order._id)}
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Order;
