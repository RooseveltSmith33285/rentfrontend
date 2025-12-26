import { Navigate, Outlet } from "react-router-dom";
import React from 'react'
const VendorProtectedRoute = () => {
  const token = localStorage.getItem("vendorToken");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;  
};

export default VendorProtectedRoute;
 