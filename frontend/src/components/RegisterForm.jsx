import React from "react";

const RegisterForm = ({ form, setForm, handleChange, loading, setIsRegister, handleRegister }) => {
  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleRegister}>
        <h1>Register</h1>

        <input
          type="text"
          name="name"
          placeholder="Nama"
          value={form.name}
          onChange={handleChange}
          required
        />

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

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="switch-text">
          Sudah punya akun?{" "}
          <span
            className="text-link"
            onClick={() => setIsRegister(false)}
            style={{ cursor: "pointer", color: "#007bff" }}
          >
            Login di sini
          </span>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
