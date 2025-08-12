import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const ProtectedRoute = ({ allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const response = await axios.get(`${API_URL}/users/getuser`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (allowedRoles.includes(response.data.role)) {
          setUser(response.data);
        } else {
          throw new Error("Unauthorized");
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [allowedRoles]);

  if (loading) return <p>Loading...</p>;

  return user ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;


