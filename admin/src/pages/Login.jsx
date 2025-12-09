import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import GravityLogo from "../assets/Gravity.png";
import { LuEyeClosed } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
import { authDataContext } from "../context/AuthProvider.jsx";

function AdminLogin() {
  // ... unchanged state and context hooks ...
  const { loginAdmin, adminData } = useContext(authDataContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (adminData) navigate("/dashboard");
  }, [navigate, adminData]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calls the unified login function from the context
      const success = await loginAdmin(email, password);

      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      // This block handles true unexpected errors (like network drop, not auth failure handled by context)
      console.error("Unexpected login error:", error);
      alert("An unexpected error occurred during login."); // Fallback alert
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: `url(${GravityLogo})` }}
      ></div>
      <div className="absolute inset-0 bg-gray-100/30"></div>

      <div className="relative z-10 w-[350px] rounded-md p-6 bg-white/70 shadow-md">
        <div className="mb-6 flex justify-center">
          <img
            src={GravityLogo}
            alt="Gravity Logo"
            className="h-24 object-contain bg-transparent"
          />
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Admin Login
        </h1>

        <form onSubmit={handleAdminLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Admin Email</label>
            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-2 focus:outline-none focus:ring-1 focus:ring-[#fd7f20]"
              required
            />
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#fd7f20]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <IoEyeOutline size={20} /> : <LuEyeClosed size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#fd7f20] hover:bg-[#fc2e20] text-white text-sm font-medium py-2 rounded-sm transition duration-300 ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-4">
          This login is restricted to Gravity Admins only.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
