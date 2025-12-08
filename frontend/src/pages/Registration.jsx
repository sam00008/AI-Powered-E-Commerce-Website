import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import GravityLogo from "../assets/Gravity.png";
import { LuEyeClosed } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
import { authDataContext } from "../context/authContext.jsx";
import { UserDataContext } from "../context/UserContext.jsx";

function Registration() {
  const { serverUrl } = useContext(authDataContext);
  // ✅ Removed getCurrentUser, as we'll get user data from the response
  const { setUserData, userData } = useContext(UserDataContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (userData) navigate("/");
  }, [userData, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${serverUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Correct: This sends/receives cookies
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json(); // ✅ Always parse the JSON response

      if (!res.ok) {
        throw new Error(data.message || "Failed to register");
      }

      // ✅ Set user context immediately from the registration response
      if (data?.data?.user) {
        setUserData(data.data.user);
      }

      // 🛑 Removed: await getCurrentUser(); (This is no longer needed)
      
      alert("Registration successful!");
      navigate("/"); // redirect to home
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-20"
        style={{ backgroundImage: `url(${GravityLogo})` }}
      ></div>
      <div className="absolute inset-0 bg-gray-100/30"></div>

      <form
        onSubmit={handleSignup}
        className="relative z-10 w-[350px] rounded-md p-6 bg-white/70 shadow-md"
      >
        <div className="mb-6 flex justify-center">
          <img src={GravityLogo} alt="Gravity Logo" className="h-24 object-contain bg-transparent" />
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-center">Create account</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First and last name"
            className="w-full border border-gray-300 rounded-sm p-2 focus:outline-none focus:ring-1 focus:ring-[#fd7f20]"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full border border-gray-300 rounded-sm p-2 focus:outline-none focus:ring-1 focus:ring-[#fd7f20]"
            required
          />
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full border border-gray-300 rounded-sm p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#fd7f20]"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <IoEyeOutline size={20} /> : <LuEyeClosed size={20} />}
          </button>
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1">Re-enter password</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full border border-gray-300 rounded-sm p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#fd7f20]"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showConfirmPassword ? <IoEyeOutline size={20} /> : <LuEyeClosed size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-[#fd7f20] hover:bg-[#fc2e20] text-white text-sm font-medium py-2 rounded-sm mb-4"
        >
          Create your Gravity account
        </button>

        <p className="text-sm text-gray-700 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0073bb] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Registration;