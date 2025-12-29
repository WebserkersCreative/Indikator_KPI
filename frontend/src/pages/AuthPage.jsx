// AuthPage.jsx (UPDATED)
import React, { useState, useEffect } from "react";
import "../styles/AuthPage.css";
import { FaGoogle } from "react-icons/fa";
import { auth, provider } from "../components/firebase";
import RegisterForm from "../components/RegisterForm";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

const AuthPage = ({ onLogin }) => {
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [modal, setModal] = useState({
    isOpen: false,
    type: "info",
    message: "",
    callback: null,
  });

  const API = process.env.REACT_APP_API_BASE_URL || "";

  // Ambil email/password dari localStorage (remember me)
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    if (savedEmail && savedPassword) {
      setForm((f) => ({ ...f, email: savedEmail, password: savedPassword }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleRememberMeChange = (e) => setRememberMe(e.target.checked);

  // ===================== MODAL HELPERS =====================
  const showModal = (type, message, callback = null) => {
    setModal({ isOpen: true, type, message, callback });
  };
  const closeModal = () => {
    const cb = modal.callback;
    setModal({ ...modal, isOpen: false, callback: null });
    if (cb) cb();
  };

  // ===================== REGISTER =====================
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (data.result === "success") {
        const userData = {
          uid: data.uid || "",
          name: form.name,
          email: form.email,
          photo: data.photo || "",
          password: form.password,
          isAdmin: false,
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.removeItem("loggedOut");
        onLogin(userData);

        showModal("success", data.message || "Registrasi berhasil", () => {
          setIsRegister(false);
          setForm({ email: "", password: "", name: "" });
          navigate("/homepage");
        });
      } else {
        showModal("error", data.message || "Registrasi gagal");
      }
    } catch (err) {
      console.error("Register error:", err);
      showModal("error", "Terjadi kesalahan saat registrasi.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== LOGIN EMAIL/PASSWORD =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isAdminActive ? `${API}/api/admin/login` : `${API}/api/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (data.result === "success") {
        if (!isAdminActive && rememberMe) {
          localStorage.setItem("email", form.email);
          localStorage.setItem("password", form.password);
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }

        const userData = {
          uid: data.uid || "",
          name: data.name || form.email.split("@")[0],
          email: form.email,
          photo: data.photo || "",
          password: form.password,
          isAdmin: isAdminActive,
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.removeItem("loggedOut");
        onLogin(userData);

        showModal("success", data.message || "Login berhasil", () => {
          if (isAdminActive) navigate("/dashboard-admin");
          else navigate("/homepage");
        });
      } else {
        showModal("error", data.message || "Login gagal");
      }
    } catch (err) {
      console.error("Login error:", err);
      showModal("error", "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== LOGIN GOOGLE =====================
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Selalu buka popup agar flow autentikasi berjalan konsisten
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // endpoint sesuai mode (admin/user)
      const endpoint = isAdminActive
        ? `${API}/api/admin/google-login`
        : `${API}/api/google-login`;

      // sertakan password fallback (mis. email) supaya backend yg mengharuskan password tetap menerima request
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName || user.email.split("@")[0],
          email: user.email,
          photo: user.photoURL || "",
          // fallback password: gunakan email sebagai identifier jika backend butuh field password
          password: user.email,
        }),
      });

      const data = await res.json();

      if (data.result === "success") {
        const userData = {
          uid: user.uid || data.uid || "",
          name: user.displayName || data.name || user.email.split("@")[0],
          email: user.email,
          photo: user.photoURL || data.photo || "",
          password: user.email,
          isAdmin: isAdminActive,
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.removeItem("loggedOut");
        onLogin(userData);

        showModal("success", "Login berhasil!", () => {
          if (isAdminActive) navigate("/dashboard-admin");
          else navigate("/homepage");
        });
      } else {
        // jika backend mengembalikan pesan error, tampilkan
        showModal("error", data.message || "Login Google gagal di server");
      }
    } catch (err) {
      console.error("Google login error:", err);
      // Tangani error Firebase (mis. popup closed by user, network, dll)
      const message =
        err?.message ||
        (err?.code ? `Firebase error: ${err.code}` : "Login Google gagal.");
      showModal("error", message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ===================== TOGGLE PASSWORD VISIBILITY =====================
  const togglePassword = () => setShowPassword(!showPassword);

  // ===================== RENDER =====================
  return (
    <div
      className={`authpage 
        ${isAdminActive ? "active" : ""} 
        ${isRegister ? "register-active" : ""}`}
    >
      {/* CSS EXTRA REGISTER (perbaikan ukuran input password) */}
      <style>
        {`
          .authpage.register-active .sign-up-container {
            opacity: 1 !important;
            transform: translateX(0) !important;
            z-index: 5 !important;
          }
          .authpage.register-active .sign-in-container {
            opacity: 0 !important;
            transform: translateX(-100px) !important;
          }

          .password-container {
            position: relative;
            width: 100%;
          }

          .password-container input {
            width: 100%;       /* Pastikan input password selebar input lain */
            padding-right: 40px;
          }

          .password-container .toggle-password {
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            cursor: pointer;
            color: #555;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>

      {/* FORM LOGIN USER */}
      {!isAdminActive && !isRegister && (
        <div className="form-container sign-in-container">
          <form onSubmit={handleSubmit}>
            <h1>Log In</h1>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password"
                onClick={togglePassword}
                aria-hidden="true"
              >
      
              </span>
            </div>

            <div className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                id="rememberMeCheckbox"
              />
              <label htmlFor="rememberMeCheckbox">Remember Me</label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Log In"}
            </button>

            {/* GOOGLE LOGIN */}
            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <FaGoogle style={{ marginRight: "10px" }} />
                  Log in with Google
                </>
              )}
            </button>

            <p className="switch-text">
              Belum punya akun?{" "}
              <span
                className="text-link"
                onClick={() => setIsRegister(true)}
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                Daftar di sini
              </span>
            </p>

            <button
              type="button"
              className="ghost mobile-ghost"
              onClick={() => setIsAdminActive(true)}
            >
              Admin Login
            </button>
          </form>
        </div>
      )}

      {/* FORM REGISTER USER */}
      {isRegister && !isAdminActive && (
        <RegisterForm
          form={form}
          setForm={setForm}
          handleChange={handleChange}
          loading={loading}
          setIsRegister={setIsRegister}
          handleRegister={handleRegister}
        />
      )}

      {/* FORM ADMIN LOGIN */}
      {isAdminActive && (
        <div className="form-container sign-up-container">
          <form onSubmit={handleSubmit}>
            <h1>Admin Login</h1>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password"
                onClick={togglePassword}
                aria-hidden="true"
              >
                
              </span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <FaGoogle style={{ marginRight: "10px" }} />
                  Log in with Google
                </>
              )}
            </button>

            <button
              type="button"
              className="ghost1 mobile-ghost"
              onClick={() => setIsAdminActive(false)}
            >
              Back to User Login
            </button>
          </form>
        </div>
      )}

      {/* OVERLAY PANEL */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Hello, Selamat Datang Admin</h1>
            <button className="ghost1" onClick={() => setIsAdminActive(false)}>
              Log In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Sahabat RSIA Annisa</h1>
            <button className="ghost" onClick={() => setIsAdminActive(true)}>
              Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        message={modal.message}
        onClose={closeModal}
      />
    </div>
  );
};

export default AuthPage;
