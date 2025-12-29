import React from "react";
import "../styles/ScreenLoading.css";
import logo from "../Pictures/logo_web.png"; // path sesuai lokasi logo

const ScreenLoading = () => {
  return (
    <div className="hospital-loader">
      <div className="background-glow"></div>

      <div className="logo-circle">
        <div className="heartbeat-line"></div>
        <div className="logo">
          <img src={logo} alt="RSIA Annisa Logo" className="hospital-logo" />
        </div>
      </div>

      <div className="loading-message">
        <h2>Mempersiapkan KPI RSIA Annisa...</h2>
        <p>Harap tunggu sebentar, kami sedang menyiapkan data Anda</p>
      </div>

      <div className="health-bar">
        <div className="health-progress"></div>
      </div>
    </div>
  );
};

export default ScreenLoading;
