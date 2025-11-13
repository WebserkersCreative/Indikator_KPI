import React, { useState, useEffect } from "react";
import "../styles/AuthPage.css";
import { FaGoogle } from "react-icons/fa";
import { auth, provider } from "../components/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthPage = ({ onLogin }) => {
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

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

  // ===================== LOGIN EMAIL/PASSWORD =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isAdminActive
      ? "http://localhost:5000/api/admin/login"
      : "http://localhost:5000/api/login";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();
      alert(data.message);

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
          name: data.name || "",
          email: form.email,
          photo: data.photo || "",
          password: form.password,
          isAdmin: isAdminActive,
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.removeItem("loggedOut");
        onLogin(userData);

        if (isAdminActive) {
          navigate("/dashboard-admin");
        } else {
          navigate("/homepage");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== LOGIN GOOGLE =====================
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        // User sudah pernah login → langsung ke homepage
        const userData = {
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          photo: currentUser.photoURL,
          password: currentUser.email,
          isAdmin: isAdminActive,
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.removeItem("loggedOut");
        onLogin(userData);

        // Spinner tetap muncul sebentar sebelum redirect
        setTimeout(() => {
          setGoogleLoading(false);
          if (isAdminActive) {
            navigate("/dashboard-admin");
          } else {
            navigate("/homepage");
          }
        }, 500); // 300ms delay supaya spinner terlihat
      } else {
        // User belum login → tampilkan popup Google
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const endpoint = isAdminActive
          ? "http://localhost:5000/api/admin/google-login"
          : "http://localhost:5000/api/save-user";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
          }),
        });

        const data = await res.json();

        if (data.result === "success") {
          const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            password: user.email,
            isAdmin: isAdminActive,
          };

          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.removeItem("loggedOut");
          onLogin(userData);

          setTimeout(() => {
            setGoogleLoading(false);
            if (isAdminActive) {
              navigate("/dashboard-admin");
            } else {
              navigate("/homepage");
            }
          }, 300);
        } else {
          alert(
            isAdminActive
              ? "Login Google Admin gagal. Pastikan email terdaftar sebagai admin."
              : "Gagal menyimpan user ke server."
          );
          setGoogleLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      alert(isAdminActive ? "Login Google Admin gagal." : "Login Google gagal.");
      setGoogleLoading(false);
    }
  };

  // ===================== RENDER =====================
  return (
    <div className={`authpage ${isAdminActive ? "active" : ""}`}>
      {/* FORM LOGIN USER */}
      {!isAdminActive && (
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
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

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
              className="ghost mobile-ghost"
              onClick={() => setIsAdminActive(true)}
            >
              Admin Login
            </button>
          </form>
        </div>
      )}

      {/* FORM LOGIN ADMIN */}
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
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

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
    </div>
  );
};

export default AuthPage;
