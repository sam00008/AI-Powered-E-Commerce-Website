// src/component/ProtectedRoute.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the current-admin endpoint to check for a valid cookie
        const res = await fetch(`${BASE_URL}/api/v1/auth/admin/current-admin`, {
          method: 'GET',
          credentials: 'include', // Ensure the cookie is sent
        });

        if (res.ok) {
          // If the token is valid, authentication is successful
          setIsAuthenticated(true);
        } else {
          // If not authenticated, redirect to login
          navigate('/login'); 
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Verifying Admin access...</p>
      </div>
    );
  }

  // If authenticated, render the child route (DashboardHome)
  return isAuthenticated ? children : null;
}

export default ProtectedRoute;