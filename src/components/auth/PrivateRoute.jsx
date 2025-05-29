// src/components/Auth/PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { account } from "../../appwrite/config.js";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get(); // If this succeeds, user is logged in
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>; // Or a spinner
  }

  return isLoggedIn ? children : <Navigate to="/" />;
};

export default PrivateRoute;
