import React from "react";
import { Loader2 } from "lucide-react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        <div className="pulsing-ring"></div>
        <div className="rotating-icon">
          <Loader2 className="loader-icon" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
