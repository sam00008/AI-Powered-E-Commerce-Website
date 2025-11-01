import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import GravityLogo from "../assets/Gravity.png";
import { LuEyeClosed } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
// 💡 1. Import your new "api" client
import api from "../api.js";
// 🛑 2. You no longer need authDataContext
// import { authDataContext } from "../context/authContext.jsx";
import { UserDataContext } from "../context/UserContext.jsx";

function Login() {
  // 🛑 3. No serverUrl needed
  // const { serverUrl } = useContext(authDataContext);
  const { userData, setUserData } = useContext(UserDataContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (userData) navigate("/");
  }, [userData, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 💡 4. Use the "api" client instead of fetch
      const res = await api.post("/auth/login", {
        email,
        password
      });

      // 💡 5. Check the response format from your backend ApiResponse
      if (res.data?.data?.user) {
        setUserData(res.data.data.user); // ✅ update context immediately
        alert("Login successful!");
        navigate("/");
      } else {
        throw new Error("Login successful but no user data received.");
      }

    } catch (error) {
      console.error(error);
      // 💡 6. Get the error message from axios response
      alert(error.response?.data?.message || "Login failed. Please check credentials.");
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
          <img src={GravityLogo} alt="Gravity Logo" className="h-24 object-contain bg-transparent" />
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-center">Sign in</h1>

        {/* 💡 7. Change form tag to use onSubmit */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-2 focus:outline-none focus:ring-1 focus:ring-[#fd7f20]"
              required
            />
          </div>

          <div className="mb-2 relative">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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

          <div className="mb-4 text-right">
            <Link to="/forgot-password" className="text-xs text-[#0073bb] hover:underline">Forgot your password?</Link>
          </div>

          <button
            // 💡 8. Change to type="submit"
            type="submit"
            className="w-full bg-[#fd7f20] hover:bg-[#fc2e20] text-white text-sm font-medium py-2 rounded-sm mb-4"
          >
            Sign in
          </button>
        </form>

        <p className="text-sm text-gray-700 text-center">
          New to Gravity? <Link to="/signup" className="text-[#0073bb] hover:underline">Create your account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;