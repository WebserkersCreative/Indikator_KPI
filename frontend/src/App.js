import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import DashboardAdmin from "./pages/admin/DashboardAdmin";

function App() {
  const [user, setUser] = useState(null);
  const [hasLoggedBefore, setHasLoggedBefore] = useState(false);

  // Saat App mount, cek localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const loggedOut = localStorage.getItem("loggedOut");

    if (storedUser && !loggedOut) {
      // Jika ada user tersimpan dan belum logout → set ke state
      setUser(JSON.parse(storedUser));
    }

    if (storedUser) {
      // Tandai bahwa user pernah login
      setHasLoggedBefore(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.removeItem("loggedOut"); // hapus flag logout supaya auto-login aktif
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.setItem("loggedOut", "true"); // tandai bahwa user sudah logout
  };

  // Proteksi route user biasa
  const ProtectedUserRoute = ({ element }) => {
    return user ? element : <Navigate to="/" replace />;
  };

  // Proteksi route admin
  const ProtectedAdminRoute = ({ element }) => {
    if (!user) return <Navigate to="/" replace />;
    if (!user.isAdmin) return <Navigate to="/homepage" replace />;
    return element;
  };

  return (
    <Router>
      <Routes>
        {/* Halaman Login / Auth */}
        <Route
          path="/"
          element={<AuthPage onLogin={handleLogin} hasLoggedBefore={hasLoggedBefore} />}
        />

        {/* Halaman User */}
        <Route
          path="/homepage"
          element={
            <ProtectedUserRoute
              element={<HomePage user={user} onLogout={handleLogout} />}
            />
          }
        />

        {/* Halaman Admin */}
        <Route
          path="/dashboard-admin"
          element={
            <ProtectedAdminRoute
              element={<DashboardAdmin user={user} onLogout={handleLogout} />}
            />
          }
        />

        {/* Redirect route tidak dikenal ke login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
