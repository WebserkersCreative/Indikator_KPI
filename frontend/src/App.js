import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ScreenLoading from "./components/ScreenLoading";

function App() {
  const [user, setUser] = useState(null);
  const [hasLoggedBefore, setHasLoggedBefore] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true); // loading sementara baca localStorage

  // ===================== CEK LOCALSTORAGE SAAT MOUNT =====================
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const loggedOut = localStorage.getItem("loggedOut");

    if (storedUser && !loggedOut) {
      setUser(JSON.parse(storedUser));
    }

    if (storedUser) {
      setHasLoggedBefore(true);
    }

    setLoadingUser(false); // selesai baca user
  }, []);

  // ===================== HANDLE LOGIN =====================
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.removeItem("loggedOut");
  };

  // ===================== HANDLE LOGOUT =====================
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.setItem("loggedOut", "true");
  };

  // ===================== PROTEKSI ROUTE USER =====================
  const ProtectedUserRoute = ({ element }) => {
    if (loadingUser) return <ScreenLoading />; // tampilkan loading sementara cek user
    return user ? element : <Navigate to="/" replace />;
  };

  // ===================== PROTEKSI ROUTE ADMIN =====================
  const ProtectedAdminRoute = ({ element }) => {
    if (loadingUser) return <ScreenLoading />; // tampilkan loading sementara cek user
    if (!user) return <Navigate to="/" replace />;
    if (!user.isAdmin) return <Navigate to="/homepage" replace />;
    return element;
  };

  // ===================== RENDER ROUTES =====================
  if (loadingUser) {
    // sementara baca user
    return <ScreenLoading />;
  }

  return (
    <Router>
      <Routes>
        {/* Halaman Login / Auth */}
        <Route
          path="/"
          element={
            <AuthPage
              onLogin={handleLogin}
              hasLoggedBefore={hasLoggedBefore}
            />
          }
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
