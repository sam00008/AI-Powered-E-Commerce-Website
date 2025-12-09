import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if admin is logged in
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(
          "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com/api/v1/auth/admin/current-admin",
          { method: "GET", credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.email) {
            // Redirect to dashboard if admin is logged in
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking admin:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Checking authentication...</p>
      </div>
    );
  }

  // Public home page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Gravity Store</h1>
        <Link
          to="/login"
          className="bg-[#fd7f20] hover:bg-[#fc2e20] text-white px-4 py-2 rounded transition"
        >
          Admin Login
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between p-8 md:p-20 bg-gradient-to-r from-orange-200 to-orange-100">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            Welcome to Gravity Store
          </h2>
          <p className="text-gray-700 mb-6">
            Your AI-powered e-commerce solution. Manage, shop, and explore with ease.
          </p>
          <Link
            to="/shop"
            className="bg-[#fd7f20] hover:bg-[#fc2e20] text-white px-6 py-3 rounded transition"
          >
            Explore Now
          </Link>
        </div>
        <div className="md:w-1/2">
          <img
            src="/hero-image.png"
            alt="Hero"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="p-8 md:p-20 grid md:grid-cols-3 gap-8">
        {[
          { title: "AI Powered", desc: "Smart recommendations & analytics" },
          { title: "Fast Delivery", desc: "Quick and reliable shipping" },
          { title: "Secure Payments", desc: "Safe & encrypted transactions" },
        ].map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
