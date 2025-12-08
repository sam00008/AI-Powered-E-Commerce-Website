import React from "react";
import { Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
import ForgotPassword from "./pages/forgotPassword.jsx";
import ResetPassword from "./pages/resetPassword.jsx";
import About from "./pages/About.jsx";
import NewArrivals from "./pages/new.jsx";
import WomenCollection from "./pages/WomenCollection.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import SearchResults from "./pages/SearchResult.jsx";
import CartPage from "./pages/cartPage.jsx";
import CheckoutPage from "./pages/checkoutPage.jsx";
import OrderDetails from "./pages/orderDetailPage.jsx";
import OrderHistory from "./pages/orderHistoryPage.jsx";
import MenCollection from "./pages/menCollection.jsx";
import JeansCollection from "./pages/jeansCollection.jsx";
import KidsCollection from "./pages/kidsCollection.jsx";
import Ai from "./component/Ai.jsx";
import TshirtCollection from "./pages/t-shirtCollection.jsx";
import ShirtCollection from "./pages/shirtCollection.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      navigate("/login", { replace: true });
    };

    window.addEventListener("app:logout", handleLogout);

    return () => {
      window.removeEventListener("app:logout", handleLogout);
    };
  }, [navigate]);
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Registration />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/product" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/collection" element={<ForgotPassword />} />
        <Route path="/contact" element={<ForgotPassword />} />
        <Route path="/category/new" element={<NewArrivals />} />
        <Route path="/category/women" element={<WomenCollection />} />
        <Route path="/category/men" element={<MenCollection />} />
        <Route path="/category/kids" element={<KidsCollection />} />
        <Route path="/category/jeans" element={<JeansCollection />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/success/:orderId" element={<OrderDetails />} />
        <Route path="/order/:orderId" element={<OrderDetails />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/category/shirts" element={<ShirtCollection />} />
         <Route path="/category/t-shirts" element={<TshirtCollection />} />
      </Routes>

      {/* ✅ Place AI icon outside Routes */}
      <Ai />
    </>
  );
}

export default App;
