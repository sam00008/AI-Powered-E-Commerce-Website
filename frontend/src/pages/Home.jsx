import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";
import Nav from "../component/Navi.jsx";
import Background from "../component/Background.jsx";
import Footer from "../component/Footer.jsx";

export default function Home() {
  const { userData, loading } = useContext(UserDataContext); // ✅ Get loading
  const navigate = useNavigate();

  const handleProtectedNavigation = (targetRoute) => {
    // Wait for loading to finish before deciding
    if (loading) return; 

    if (!userData) {
      navigate("/login", { replace: true, state: { from: targetRoute } });
    } else {
      navigate(targetRoute);
    }
  };

  // ✅ Optional: Show a loader while checking auth
  if (loading) {
     return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="relative w-full">
      <Nav onProtectedClick={handleProtectedNavigation} />
      <div className="mt-[20px]">
        <Background onProtectedClick={handleProtectedNavigation} />
      </div>
      <Footer />
    </div>
  );
}