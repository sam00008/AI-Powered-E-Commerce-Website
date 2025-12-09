import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Add from "./pages/Add.jsx";
import Lists from "./pages/Lists.jsx";
import Login from "./pages/Login.jsx";
import Order from "./pages/Order.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import Update from "./pages/Update.jsx";
import ProtectedRoute from "./component/ProtectedRoute.jsx"; // 👈 1. IMPORT ProtectedRoute

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes (Accessible to everyone) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 Protected/Admin Routes (Requires Admin Login) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        } />
        
        {/* Wrap all other Admin pages with ProtectedRoute as well */}
        <Route path="/add" element={
          <ProtectedRoute>
            <Add />
          </ProtectedRoute>
        } />
        <Route path="/lists" element={
          <ProtectedRoute>
            <Lists />
          </ProtectedRoute>
        } />
        <Route path="/order" element={
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        } />
        <Route path="/update/:id" element={
          <ProtectedRoute>
            <Update />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;