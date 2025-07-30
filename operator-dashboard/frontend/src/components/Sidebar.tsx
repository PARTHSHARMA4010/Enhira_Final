import React from "react";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <div style={{ width: "250px", background: "#f4f4f4", height: "100vh", padding: "20px" }}>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/">Operators</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
