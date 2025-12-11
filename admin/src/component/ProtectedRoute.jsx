// src/component/ProtectedRoute.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/v1/auth/admin/current-admin`,
          { withCredentials: true }
        );

        if (res.data.status === 200) {
          setIsAuth(true);
        } else {
          navigate("/login"); // 👈 FIXED HERE
        }
      } catch {
        navigate("/login");   // 👈 FIXED HERE
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Verifying admin access...</p>
      </div>
    );
  }

  return isAuth ? children : null;
}

export default ProtectedRoute;
