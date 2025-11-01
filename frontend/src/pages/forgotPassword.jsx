import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import GravityLogo from "../assets/Gravity.png"; // Your app logo
import { authDataContext } from "../context/authContext";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${serverUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send password reset email");
      }

      setSuccess(data.message || "Password reset email sent successfully!");
      setEmail("");

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background blur with Gravity logo */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: `url(${GravityLogo})` }}
      ></div>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-gray-100/30"></div>

      {/* Forgot Password Card */}
      <div className="relative z-10 w-[350px] rounded-md p-6 bg-white/80 shadow-md">
        <div className="flex justify-center mb-6">
          <img
            src={GravityLogo}
            alt="Gravity Logo"
            className="h-20 object-contain bg-transparent"
          />
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-center">
          Forgot Password
        </h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleForgotPassword}>
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-2 focus:outline-none focus:ring-1 focus:ring-[#fd7f20]"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-3 text-green-600 text-sm text-center">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fd7f20] hover:bg-[#fc2e20] text-white py-2 rounded-sm transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-sm text-gray-700 text-center mt-4">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#0073bb] hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
