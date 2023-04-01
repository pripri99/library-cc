import React, { useEffect } from "react";
import { Route, useLocation, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ element, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = sessionStorage.getItem("access_token");

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  if (!accessToken) {
    return null;
  }

  return <Route {...rest} element={element} />;
};

export default ProtectedRoute;
