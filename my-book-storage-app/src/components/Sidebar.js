import React from "react";
import "./Sidebar.css";

const Sidebar = ({ keycloak, fetchProtectedResource }) => {
  return (
    <div className="sidebar">
      <h2>Welcome, {keycloak.tokenParsed.name}!</h2>
      <button onClick={fetchProtectedResource}>
        Fetch Unknown Protected Resource
      </button>
      <button onClick={() => keycloak.logout()}>Logout</button>
    </div>
  );
};

export default Sidebar;
