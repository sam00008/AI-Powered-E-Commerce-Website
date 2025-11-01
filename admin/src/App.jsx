import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Add from "./pages/Add.jsx";
import Lists from "./pages/Lists.jsx";
import Login from "./pages/Login.jsx";
import Order from "./pages/Order.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import Update from "./pages/Update.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/login" element={<Login />} />
        <Route path="/order" element={<Order />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/update/:id" element={<Update />} />
      </Routes>
    </>
  );
}

export default App;
