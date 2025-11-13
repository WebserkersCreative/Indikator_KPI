// ========================= IMPORT MODULE =========================
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

// ========================= KONFIGURASI DASAR =========================
const app = express();
const PORT = 5000;

// Ganti URL ini dengan Web App URL Google Apps Script kamu
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzfvqRBY-U0fpmbXLnyYwroMtDioL5p17BVr1PkboRGxcAv7_ZRr4FnPliJUBMMYN6W/exec";

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// ========================= SIGNUP =========================
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        result: "error",
        message: "Email, password, dan nama wajib diisi!",
      });
    }

    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: "register",
      email,
      password,
      name,
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error signup:", error.message);
    res.status(500).json({ result: "error", message: error.message });
  }
});

// ========================= LOGIN USER =========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ result: "error", message: "Email dan password wajib diisi!" });
    }

    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: "login",
      email,
      password,
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error login:", error.message);
    res
      .status(500)
      .json({ result: "error", message: "Terjadi kesalahan saat login." });
  }
});

// ========================= LOGIN ADMIN =========================
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ result: "error", message: "Email dan password wajib diisi!" });
    }

    // Aksi baru untuk cek admin
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: "adminLogin",
      email,
      password,
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error admin login:", error.message);
    res
      .status(500)
      .json({ result: "error", message: "Terjadi kesalahan saat login admin." });
  }
});

// ========================= LOGIN GOOGLE ADMIN =========================
app.post("/api/admin/google-login", async (req, res) => {
  try {
    const { email, name, photo } = req.body;
    if (!email || !name) {
      return res
        .status(400)
        .json({ result: "error", message: "Email dan nama wajib dikirim!" });
    }

    // Kirim ke Apps Script untuk validasi apakah email admin terdaftar
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: "adminGoogleLogin",
      email,
      name,
      photo,
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error admin google login:", error.message);
    res.status(500).json({
      result: "error",
      message: "Terjadi kesalahan saat login Google admin.",
    });
  }
});

// ========================= SAVE USER GOOGLE =========================
app.post("/api/save-user", async (req, res) => {
  try {
    const { name, email, photo } = req.body;
    if (!email || !name) {
      return res.status(400).json({
        result: "error",
        message: "Email dan nama wajib dikirim!",
      });
    }

    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: "save-user",
      name,
      email,
      photo,
    });

    res.json({
      result: "success",
      message: "User berhasil disimpan",
      user: { name, email, photo },
      scriptResponse: response.data,
    });
  } catch (error) {
    console.error("❌ Error save-user:", error.message);
    res.status(500).json({ result: "error", message: error.message });
  }
});

// ========================= GET INDIKATOR DATA =========================
app.get("/api/indikator-data", async (req, res) => {
  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: "getIndikatorData",
    });
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error get indikator data:", error.message);
    res.status(500).json({
      result: "error",
      message: "Gagal mengambil data indikator!",
    });
  }
});

// ========================= INPUT KPI BATCH =========================
app.post("/api/kpi-batch", async (req, res) => {
  try {
    const { email, password, divisi, nama, unit, tanda_tangan, indikator_list } =
      req.body;

    if (!email || !password || !Array.isArray(indikator_list)) {
      return res.status(400).json({
        result: "error",
        message: "Email, password, dan indikator_list wajib dikirim!",
      });
    }

    // Gunakan hanya endpoint kpiBatch di Apps Script
    const payload = {
      action: "kpiBatch",
      email,
      password,
      divisi,
      nama,
      unit,
      tanda_tangan,
      indikator_list,
    };

    const response = await axios.post(GOOGLE_SCRIPT_URL, payload, {
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error input KPI batch:", error.message);
    res.status(500).json({
      result: "error",
      message: "Gagal mengirim batch KPI.",
    });
  }
});

// ========================= START SERVER =========================
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
