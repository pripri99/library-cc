import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

const ProtectedRoute = ({ element, ...rest }) => {
  const { initialized, keycloak } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (keycloak.authenticated) {
    return <Route {...rest} element={element} />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
