// src/pages/Checkout.jsx
import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import { useAuth } from "../context/authContext.jsx";
import Footer from "../component/Footer.jsx";
import { toast } from "react-toastify";

export default function Checkout() {
  const navigate = useNavigate();

  // Contexts (adjust names if yours differ)
  const shop = useContext(ShopDataContext);
  const auth = useAuth ? useAuth() : null;

  // -- derive values safely
  const cart = shop?.cart || [];
  const totalPrice = shop?.totalPrice ?? cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const currency = shop?.currency ?? "₹";
  const getCartData = shop?.getCartData ?? (() => Promise.resolve());
  const API_BASE_URL = (auth && auth.API_BASE_URL) || process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";
  const user = (auth && auth.user) || null;
  const loadingUser = (auth && auth.loading) || false;

  const shippingCost = 10;
  const orderTotal = Number(totalPrice || 0) + shippingCost;

  const initialAddress = {
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  };

  const [shippingAddress, setShippingAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD or Online
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // helper: build endpoint URL
  const makeUrl = (path) => {
    return `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  const isAddressComplete = useCallback(() => {
    return Object.values(shippingAddress).every((v) => typeof v === "string" && v.trim() !== "");
  }, [shippingAddress]);

  // Load saved address from backend (if available)
  useEffect(() => {
    let mounted = true;
    const loadAddress = async () => {
      try {
        const url = makeUrl("/user/address");
        const token = localStorage.getItem("token");
        const opts = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : { credentials: "include" };

        const res = await fetch(url, { method: "GET", ...opts });
        if (!mounted) return;
        if (!res.ok) return;
        const body = await res.json();
        const addr = body?.data?.address || body?.address || body?.data || body;
        if (addr && typeof addr === "object") {
          setShippingAddress((s) => ({ ...s, ...addr }));
          setIsFormOpen(false);
        }
      } catch (err) {
        console.debug("Could not load saved address", err);
      }
    };

    if (!loadingUser) loadAddress();
    return () => { mounted = false; };
  }, [API_BASE_URL, loadingUser, makeUrl]);

  // Save address to backend for reuse
  const saveAddressToServer = async (address) => {
    try {
      const url = makeUrl("/user/save-address");
      const token = localStorage.getItem("token");
      const opts = token
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ address }),
          }
        : {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          };

      const res = await fetch(url, opts);
      return res.ok;
    } catch (err) {
      console.debug("saveAddressToServer error:", err);
      return false;
    }
  };

  // Dynamically load Razorpay script if not present
  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  // Build order items payload from cart
  const buildItemsPayload = () => cart.map((it) => ({ productId: it._id, qty: it.qty }));

  const handlePlaceOrder = async () => {
    setError("");
    if (!isAddressComplete()) {
      setError("Please complete the shipping address.");
      setIsFormOpen(true);
      return;
    }
    if (!cart || cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsPlacingOrder(true);

    // Save address to user profile (best-effort)
    await saveAddressToServer(shippingAddress).catch(() => null);

    try {
      const itemsPayload = buildItemsPayload();
      const token = localStorage.getItem("token");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      if (paymentMethod === "COD") {
        const res = await fetch(makeUrl("/order/place"), {
          method: "POST",
          credentials: token ? undefined : "include",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            shippingAddress,
            paymentMethod: "COD",
            items: itemsPayload,
          }),
        });

        const body = await (res.headers.get("content-type")?.includes("application/json") ? res.json() : Promise.resolve({ message: "Unknown error" }));
        if (!res.ok) {
          throw new Error(body?.message || `Failed to place order (status ${res.status})`);
        }

        // Clear client cart (if you have a context method)
        if (typeof getCartData === "function") await getCartData();

        toast && toast("Order placed successfully");
        // COD NAVIGATION: This already redirects to /order/success/:orderId
        navigate(`/order/success/${body?.data?._id ?? ""}`); 
        return;
      }

      // Online / Razorpay flow
      const canLoad = await loadRazorpayScript();
      if (!canLoad) {
        throw new Error("Failed to load payment gateway. Try again later.");
      }

      const res = await fetch(makeUrl("/order/place/razorpay"), {
        method: "POST",
        credentials: token ? undefined : "include",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          shippingAddress,
          items: itemsPayload,
        }),
      });

      // Store initial Razorpay response (which should contain the order ID)
      const razorpayBody = await (res.headers.get("content-type")?.includes("application/json") ? res.json() : Promise.resolve({ message: "Unknown error" }));
      if (!res.ok) {
        throw new Error(razorpayBody?.message || `Failed to initiate payment (status ${res.status})`);
      }
      
      const tempOrderId = razorpayBody?.data?._id; // Initial Order ID from Razorpay setup

      // body.data must include { key, amount, razorpayOrderId, currency }
      const { key, amount, razorpayOrderId, currency: respCurrency } = razorpayBody.data || {};
      if (!key || !amount || !razorpayOrderId) {
        throw new Error("Payment initiation failed (invalid server response)");
      }

      // Open Razorpay checkout
      const options = {
        key,
        amount,
        currency: respCurrency || "INR",
        name: "Your Store",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          // This function executes only on SUCCESSFUL PAYMENT
          try {
            const verifyRes = await fetch(makeUrl("/order/verify-payment"), {
              method: "POST",
              credentials: token ? undefined : "include",
              headers: { "Content-Type": "application/json", ...authHeaders },
              body: JSON.stringify(response),
            });

            const verifyBody = await (verifyRes.headers.get("content-type")?.includes("application/json") ? verifyRes.json() : Promise.resolve({ message: "Unknown verify response" }));
            if (!verifyRes.ok) {
              throw new Error(verifyBody?.message || `Payment verification failed (status ${verifyRes.status})`);
            }

            // payment verified — clear cart
            if (typeof getCartData === "function") await getCartData();

            toast && toast.success ? toast.success("Payment successful — Order confirmed") : toast("Payment successful — Order confirmed");
            
            // ✅ ONLINE PAYMENT NAVIGATION: Get final Order ID and redirect
            const finalOrderId = verifyBody?.data?._id || tempOrderId || "";
            navigate(`/order/success/${finalOrderId}`); 
            
          } catch (err) {
            console.error("Payment verification error:", err);
            toast && toast.error ? toast.error(err.message || "Payment verification failed") : null;
          }
        },
        prefill: {
          name: user?.name || shippingAddress.fullName || "",
          email: user?.email || "",
          contact: shippingAddress.phone || "",
        },
        notes: {
          // optional notes
        },
        theme: {
          color: "#fd7f20",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response);
        toast && toast.error ? toast.error("Payment failed or cancelled") : null;
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout Error:", err);
      setError(err.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!cart) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <nav className="bg-white shadow-md flex justify-between items-center px-4 py-3 md:px-6 md:py-4 mb-8 rounded-lg">
        <Link to="/" className="text-xl font-bold text-gray-800">Gravity Store</Link>
        <Link to="/shop" className="bg-[#fd7f20] hover:bg-[#fc2e20] text-white px-3 py-1 md:px-4 md:py-2 rounded transition">Continue Shopping</Link>
      </nav>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsFormOpen(!isFormOpen)}>
                <h3 className="text-xl font-bold text-gray-800"><span className="text-[#fd7f20] mr-2">1.</span> Shipping Address</h3>
                <button className="text-gray-500 hover:text-gray-700 transition">{isFormOpen ? "−" : "⊕"}</button>
              </div>

              {!isFormOpen && isAddressComplete() && (
                <div className="mt-4 p-4 border-t border-gray-100">
                  <p className="font-semibold text-gray-800">{shippingAddress.fullName}</p>
                  <p className="text-gray-600">{shippingAddress.address}, {shippingAddress.city}</p>
                  <p className="text-gray-600">{shippingAddress.state} - {shippingAddress.postalCode}, {shippingAddress.country}</p>
                  <p className="text-gray-600">Phone: {shippingAddress.phone}</p>
                </div>
              )}

              {isFormOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-gray-100">
                  {Object.keys(initialAddress).map((key) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</label>
                      <input
                        id={key}
                        name={key}
                        value={shippingAddress[key]}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value })}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#fd7f20] focus:border-[#fd7f20]"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2 flex justify-end">
                    <button onClick={() => setIsFormOpen(false)} disabled={!isAddressComplete()} className={`px-4 py-2 rounded-md font-semibold transition ${isAddressComplete() ? 'bg-[#fc2e20] text-white hover:bg-[#fd7f20]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Save & Continue</button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4"><span className="text-[#fd7f20] mr-2">2.</span> Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="h-4 w-4" />
                  <span className="ml-3 text-gray-700 font-medium">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="paymentMethod" value="Online" checked={paymentMethod === "Online"} onChange={() => setPaymentMethod("Online")} className="h-4 w-4" />
                  <span className="ml-3 text-gray-700 font-medium">Online Payment (Razorpay)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#fd7f20] h-fit sticky top-20">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4 border-b pb-3">Order Summary ({cart.length} Items)</h3>

              <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate pr-2">{item.name} (x{item.qty})</span>
                    <span className="font-medium text-gray-800">{currency}{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-gray-700 mb-4 border-t pt-4">
                <div className="flex justify-between"><span>Subtotal:</span><span>{currency}{totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span>{currency}{shippingCost.toFixed(2)}</span></div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-dashed border-gray-300">
                <span>Order Total:</span>
                <span>{currency}{orderTotal.toFixed(2)}</span>
              </div>

              <button onClick={handlePlaceOrder} disabled={isPlacingOrder || !isAddressComplete()} className="w-full mt-6 bg-[#fc2e20] hover:bg-[#fd7f20] text-white py-3 rounded-lg text-lg font-bold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
                {isPlacingOrder ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    Processing...
                  </>
                ) : `Place Order (${currency}${orderTotal.toFixed(2)})`}
              </button>

              {!isAddressComplete() && <p className="text-xs text-red-500 mt-2 text-center font-medium">*Please fill and save the Shipping Address to proceed.</p>}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}