import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../components/firebase"; // import Firebase auth
import { signOut } from "firebase/auth";
import KpiFormModal from "../components/KpiFormModal";
import ScreenLoading from "../components/ScreenLoading";
import logoAnnisa from "../assets/logo_web.png";
import "../styles/HomePage.css";

const HomePage = ({ user, onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(user || null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // ===================== AMBIL USER =====================
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const loggedOutFlag = localStorage.getItem("loggedOut");

    // ✅ Jika tidak pernah logout dan ada data user → tampilkan
    if (storedUser && !loggedOutFlag) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      navigate("/"); // wajib login lagi
    }
  }, [navigate]);

  // ===================== LOADING SEMENTARA =====================
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // bisa ganti 3000ms
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <ScreenLoading />;

  // ===================== MODAL KPI =====================
  const handleOpenModal = () => setShowForm(true);
  const handleCloseModal = () => setShowForm(false);

  // ===================== LOGOUT =====================
  const handleLogoutClick = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    try {
      // Hapus data user dari localStorage
      localStorage.removeItem("userData");
      localStorage.setItem("loggedOut", "true"); // flag supaya auto-login tidak terjadi

      // Logout dari Firebase jika sebelumnya login Google
      await signOut(auth);

      // Reset state di App.js
      onLogout();

      // Tutup modal dan redirect ke login
      setShowLogoutModal(false);
      navigate("/");
    } catch (error) {
      console.error("Logout gagal:", error);
      alert("Terjadi kesalahan saat logout.");
    }
  };

  const cancelLogout = () => setShowLogoutModal(false);

  // ===================== RENDER =====================
  return (
    <div className="homepage-container">
      {/* HEADER */}
      <header className="homepage-header">
        <div className="hospital-logo">
          <img src={logoAnnisa} alt="Logo Rumah Sakit Annisa" />
        </div>

        <div className="user-info">
          {currentUser?.photo && (
            <img
              src={currentUser.photo}
              alt="User Avatar"
              referrerPolicy="no-referrer"
              className="user-avatar"
            />
          )}

          {currentUser && (
            <p className="username">
              Halo, <span>{currentUser.name}</span>
            </p>
          )}

          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="homepage-main">
        <h1 className="welcome-title">Selamat Datang di Dashboard KPI</h1>
        <p className="welcome-subtitle">
          Pantau dan tingkatkan kinerja Anda bersama Rumah Sakit Annisa
        </p>

        <div className="button-section">
          <button className="start-btn" onClick={handleOpenModal}>
            Mulai Input KPI
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="homepage-footer">
        <p>
          © {new Date().getFullYear()} Rumah Sakit Annisa — Melayani Sedekat Sahabat
        </p>
      </footer>

      {/* MODAL KPI */}
      {showForm && (
        <KpiFormModal onClose={handleCloseModal} user={currentUser} />
      )}

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Konfirmasi Logout</h3>
            <p>Apakah Anda yakin ingin keluar dari akun ini?</p>
            <div className="logout-modal-buttons">
              <button className="confirm-btn" onClick={confirmLogout}>
                Ya, Logout
              </button>
              <button className="cancel-btn" onClick={cancelLogout}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
