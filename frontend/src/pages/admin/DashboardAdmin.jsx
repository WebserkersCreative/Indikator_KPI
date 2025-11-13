import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/DashboardAdmin.css";

const DashboardAdmin = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(user || null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    if (!storedUser || !storedUser.isAdmin) {
      alert("Anda harus login sebagai admin!");
      navigate("/"); // kembali ke AuthPage
    } else {
      setUserData(storedUser);
    }
  }, [navigate]);

  // ✅ Tombol logout diperbarui agar sinkron dengan App.js
  const handleLogout = () => {
    if (window.confirm("Yakin ingin logout?")) {
      localStorage.removeItem("userData");
      if (onLogout) onLogout(); // panggil fungsi logout dari App.js
      navigate("/"); // arahkan ke halaman login AuthPage
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return (
          <div className="adm-content-section">
            <h2 className="adm-section-title">Dashboard Overview</h2>
            <div className="adm-cards-container">
              <div className="adm-card">
                <h3 className="adm-card-title">Total Users</h3>
                <p className="adm-card-value">150</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Active Sessions</h3>
                <p className="adm-card-value">47</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">New Reports</h3>
                <p className="adm-card-value">12</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Server Health</h3>
                <p className="adm-card-value">Good</p>
              </div>
            </div>
            <div className="adm-kpi-indicator">
              <h3>Key Performance Indicators</h3>
              <ul>
                <li><strong>Sales Target:</strong> 90% Achieved</li>
                <li><strong>Customer Satisfaction:</strong> 80%</li>
                <li><strong>Active Subscriptions:</strong> 35%</li>
              </ul>
            </div>
          </div>
        );
      case "User Management":
        return (
          <div className="adm-content-section">
            <h2 className="adm-section-title">User Management</h2>
            <div className="adm-cards-container">
              <div className="adm-card">
                <h3 className="adm-card-title">Total Users</h3>
                <p className="adm-card-value">150</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Admins</h3>
                <p className="adm-card-value">5</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Active Users</h3>
                <p className="adm-card-value">120</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Inactive Users</h3>
                <p className="adm-card-value">30</p>
              </div>
            </div>
            <div className="adm-user-list">
              <h4 className="adm-user-list-title">Recent Users</h4>
              <ul className="adm-user-list-items">
                <li>John Doe</li>
                <li>Jane Smith</li>
                <li>Bob Johnson</li>
                <li>Emily Davis</li>
                <li>Alice Brown</li>
              </ul>
            </div>
          </div>
        );
      case "Reports":
        return (
          <div className="adm-content-section">
            <h2 className="adm-section-title">Reports</h2>
            <div className="adm-cards-container">
              <div className="adm-card">
                <h3 className="adm-card-title">Daily Reports</h3>
                <p className="adm-card-value">8</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Weekly Reports</h3>
                <p className="adm-card-value">45</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Monthly Reports</h3>
                <p className="adm-card-value">150</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Pending Reviews</h3>
                <p className="adm-card-value">5</p>
              </div>
            </div>
            <div className="adm-reports-summary">
              <h4>Report Categories:</h4>
              <ul>
                <li>Customer Feedback</li>
                <li>Sales Performance</li>
                <li>Monthly Traffic</li>
                <li>System Health</li>
              </ul>
            </div>
          </div>
        );
      case "Settings":
        return (
          <div className="adm-content-section">
            <h2 className="adm-section-title">Settings</h2>
            <div className="adm-cards-container">
              <div className="adm-card">
                <h3 className="adm-card-title">System Config</h3>
                <p className="adm-card-value">Updated 1 day ago</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Security</h3>
                <p className="adm-card-value">2FA Enabled</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Notifications</h3>
                <p className="adm-card-value">Email & SMS</p>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">API Access</h3>
                <p className="adm-card-value">Active</p>
              </div>
            </div>
            <div className="adm-security-logs">
              <h4>Recent Security Events</h4>
              <ul>
                <li>Login attempt from new device (10/11/2025)</li>
                <li>Password change (09/11/2025)</li>
                <li>Two-Factor Authentication enabled (08/11/2025)</li>
              </ul>
            </div>
          </div>
        );
      default:
        return <p>Select a menu.</p>;
    }
  };

  return (
    <div className="adm-dashboard">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-header">
          <h2 className="adm-sidebar-title">Admin Panel</h2>
          <p className="adm-sidebar-email">{userData?.email}</p>
        </div>
        <ul className="adm-sidebar-menu">
          {["Dashboard", "User Management", "Reports", "Settings"].map((menu) => (
            <li
              key={menu}
              className={activeMenu === menu ? "adm-active" : ""}
              onClick={() => setActiveMenu(menu)}
            >
              {menu}
            </li>
          ))}
          <li onClick={handleLogout} className="adm-logout">
            Logout
          </li>
        </ul>
      </aside>

      <div className="adm-main-content">
        <header className="adm-header">
          <h1 className="adm-welcome">Welcome, {userData?.name || "Admin"}!</h1>
          <p className="adm-selected-menu">Selected Menu: {activeMenu}</p>
        </header>
        <div className="adm-dashboard-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
