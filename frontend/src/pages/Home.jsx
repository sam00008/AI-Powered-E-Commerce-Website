import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";
import Nav from "../component/Navi.jsx";
import Background from "../component/Background.jsx";
import Footer from "../component/Footer.jsx"; // ✅ import Footer

export default function Home() {
  const { userData } = useContext(UserDataContext);
  const navigate = useNavigate();

  const handleProtectedNavigation = (targetRoute) => {
    if (!userData || Object.keys(userData).length === 0) {
      navigate("/login", { replace: true, state: { from: targetRoute } });
    } else {
      navigate(targetRoute);
    }
  };

  return (
    <div className="relative w-full">
      <Nav onProtectedClick={handleProtectedNavigation} />

      <div className="mt-[20px]">
        <Background onProtectedClick={handleProtectedNavigation} />
      </div>

      {/* ✅ Footer: always visible */}
      <Footer />
    </div>
  );
}
