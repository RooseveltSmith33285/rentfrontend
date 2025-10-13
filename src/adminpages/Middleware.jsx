// Middleware.jsx
import { Navigate, Outlet } from "react-router-dom";
import React from "react";
const Middleware = () => {
  const token = localStorage.getItem("adminToken");
  
  if (!token) {
    return <Navigate to="/adminlogin" replace />;
  }
  
  return <Outlet />;
};

export default Middleware;