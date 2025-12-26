import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../baseUrl";
import React from 'react'

const Middleware = () => {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLoading(false);
      setValid(false);
      return;
    }

    const parsed = JSON.parse(token);

    axios
      .post(`${BASE_URL}/admin/checkValidAdmin`, { email: parsed.email })
      .then(() => {
        setValid(true);
      })
      .catch(() => {
        setValid(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Checking authentication...</div>;

  if (!valid) return <Navigate to="/adminlogin" replace />;

  return <Outlet />;
};

export default Middleware;
