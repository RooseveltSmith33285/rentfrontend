import { Navigate, Outlet } from "react-router-dom";
import React from 'react'
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;  
};

export default ProtectedRoute;
