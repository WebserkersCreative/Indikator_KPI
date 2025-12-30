import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../components/firebase";
import { signOut } from "firebase/auth";
import { Search } from "lucide-react";
import KpiFormModal from "../components/KpiFormModal";
import ScreenLoading from "../components/ScreenLoading";
import Modal from "../components/Modal";

import logoAnnisa from "../assets/logo_web.png";
import "../styles/HomePage.css";

const API = process.env.REACT_APP_API_BASE_URL || "";

const HomePage = ({ user, onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingKpi, setLoadingKpi] = useState(false);
  const [myKpiData, setMyKpiData] = useState({});
  const [expandedDates, setExpandedDates] = useState([]);
  const [editCounts, setEditCounts] = useState({});
  const [searchName, setSearchName] = useState("");
  const [totalKaryawan, setTotalKaryawan] = useState(0);
  const [totalKpi, setTotalKpi] = useState(0);
  const [hasKpiLoaded, setHasKpiLoaded] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [modalData, setModalData] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });
  const [savingKpi, setSavingKpi] = useState(false);

  const navigate = useNavigate();
  const inputKpiButtonRef = useRef(null);

  const allNames = Array.from(
    new Set(
      Object.values(myKpiData || {})
        .flat()
        .map((kpi) => kpi.nama)
        .filter(Boolean)
    )
  );

  const filteredSuggestions = searchName
    ? allNames
        .filter((name) => name.toLowerCase().includes(searchName.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
    : [];

  // PAGE LOADING
  useEffect(() => {
    const timer = setTimeout(() => setLoadingPage(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  /// ===================== FETCH KPI SAYA =====================
  const handleFetchMyKpi = async () => {
    try {
      if (!user?.email) return;

      setHasKpiLoaded(true);
      setLoadingKpi(true);

      const response = await fetch(
        `${API}/api/kpi-my?email=${encodeURIComponent(user.email)}`
      );

      const data = await response.json();

      if (data.result === "success") {
        const grouped = {};
        const counts = {};
        let totalKpiCount = 0;

        (data.message || []).forEach((kpi) => {
          const namaorang = kpi.nama || "Tanpa Nama";

          // 🔹 Group per NAMA
          if (!grouped[namaorang]) {
            grouped[namaorang] = [];
          }

          grouped[namaorang].push(kpi);
          totalKpiCount++;

          // 🔹 Simpan edit_count per KPI
          const kpiKey = kpi.id || kpi.indikator_kpi;
          counts[kpiKey] = Number(kpi.edit_count || 0);
        });

        // 🔹 Hitung jumlah karyawan unik
        const jumlahKaryawan = Object.keys(grouped).length;

        // 🔥 SET STATE UTAMA
        setMyKpiData(grouped);
        setEditCounts(counts);
        setTotalKaryawan(jumlahKaryawan);
        setTotalKpi(totalKpiCount);
      } else {
        setModalData({
          isOpen: true,
          type: "error",
          title: "Gagal Fetch KPI",
          message: data.message || "Gagal mengambil KPI Anda!",
        });
      }
    } catch (error) {
      console.error("Fetch KPI error:", error);
      setModalData({
        isOpen: true,
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Terjadi kesalahan saat mengambil KPI Anda!",
      });
    } finally {
      setLoadingKpi(false);
    }
  };

  // OPEN INPUT KPI FORM
  const handleOpenModal = () => {
    if (!user) {
      setModalData({
        isOpen: true,
        type: "error",
        title: "User Tidak Terdeteksi",
        message: "Silakan login ulang!",
      });
      return;
    }
    setShowForm(true);
  };

  const handleCloseModal = () => setShowForm(false);

  // LOGOUT
  const handleLogoutClick = () => {
    setModalData({
      isOpen: true,
      type: "info",
      title: "Konfirmasi Logout",
      message: "Apakah Anda yakin ingin keluar dari akun ini?",
      onConfirm: confirmLogout,
    });
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
      navigate("/");
    } catch {
      setModalData({
        isOpen: true,
        type: "error",
        title: "Logout Gagal",
        message: "Terjadi kesalahan saat logout.",
      });
    }
  };

  // EXPAND KARTU KPI
  const toggleDate = (date) => {
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  // OPEN EDIT
  const openEditModal = (kpiKey, date, actual, bukti) => {
    let buktiType = null;
    if (bukti) {
      buktiType = bukti.toLowerCase().endsWith(".pdf") ? "pdf" : "image";
    }

    setEditModalData({
      kpiKey,
      date,
      actual,
      buktiUrl: bukti,
      buktiType,
      buktiFile: null,
      buktiPreview: null,
      buktiFilename: bukti ? extractFilenameFromUrl(bukti) : null,
    });
  };

  const closeEditModal = () => setEditModalData(null);

  const extractFilenameFromUrl = (url) => {
    try {
      return url.split("/").pop().split("?")[0];
    } catch {
      return null;
    }
  };

  const shortenFilename = (name, lenFront = 6, lenBack = 6) => {
    if (!name) return "";
    if (name.length <= lenFront + lenBack + 3) return name;
    const front = name.slice(0, lenFront);
    const back = name.slice(name.length - lenBack);
    return `${front}...${back}`;
  };

  // FILE CHANGE
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type = file.type.includes("pdf") ? "pdf" : "image";
    let preview = type === "image" ? URL.createObjectURL(file) : null;

    setEditModalData((prev) => ({
      ...prev,
      buktiFile: file,
      buktiPreview: preview,
      buktiType: type,
      buktiFilename: file.name,
    }));
  };

  // SAVE EDIT
  const handleSaveEdit = () => {
    setModalData({
      isOpen: true,
      type: "info",
      title: "Konfirmasi Simpan KPI",
      message: "Apakah Anda yakin ingin menyimpan perubahan ini?",
      onConfirm: confirmSaveKpi,
    });
  };

  const confirmSaveKpi = async () => {
    if (!editModalData || !user?.email) return;

    const { kpiKey, date, actual, buktiFile } = editModalData;
    const currentCount = editCounts[kpiKey] || 0;

    if (currentCount >= 2) {
      setModalData({
        isOpen: true,
        type: "error",
        title: "Batas Edit Tercapai",
        message: "Anda hanya bisa mengedit KPI ini maksimal 2 kali.",
      });
      return;
    }

    try {
      setSavingKpi(true);

      const formData = new FormData();
      formData.append("kpiKey", kpiKey);
      formData.append("actual", actual);
      formData.append("email", user.email);
      if (buktiFile) formData.append("buktiFile", buktiFile);

      const response = await fetch(`${API}/api/kpi-update`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.result !== "success") throw new Error("Update failed");

      const newBuktiUrl =
        result.buktiUrl || (buktiFile ? URL.createObjectURL(buktiFile) : null);

      setMyKpiData((prev) => ({
        ...prev,
        [date]: prev[date].map((kpi) =>
          (kpi.id || kpi.indikator_kpi) === kpiKey
            ? { ...kpi, actual, bukti: newBuktiUrl || kpi.bukti }
            : kpi
        ),
      }));

      setEditCounts((prev) => ({
        ...prev,
        [kpiKey]: result.message?.edit_count ?? currentCount + 1,
      }));

      setEditModalData(null);

      setModalData({
        isOpen: true,
        type: "success",
        title: "Berhasil",
        message: "KPI berhasil disimpan.",
      });
    } catch (err) {
      console.error(err);
      setModalData({
        isOpen: true,
        type: "error",
        title: "Gagal Update KPI",
        message: "Terjadi kesalahan saat update KPI!",
      });
    } finally {
      setSavingKpi(false);
    }
  };

  if (loadingPage) return <ScreenLoading />;

  return (
    <div className="homepage-container">
      {/* HEADER */}
      <header className="homepage-header">
        <div className="hospital-logo">
          <img src={logoAnnisa} alt="Logo Rumah Sakit Annisa" />
        </div>
        <div className="user-info">
          {user?.photo && (
            <img
              src={user.photo}
              alt="User Avatar"
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
          )}
          <p className="username">
            Halo, <span>{user.name}</span>
          </p>
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </header>

      <main className="homepage-main">
        {/* HEADER */}
        <h1 className="welcome-title">Selamat Datang di Dashboard KPI</h1>
        <p className="welcome-subtitle">
          Pantau dan tingkatkan kinerja Anda bersama Rumah Sakit Annisa
        </p>

        {/* ACTION BUTTON */}
        <div className="button-section">
          <button
            className="start-btn"
            onClick={handleOpenModal}
            ref={inputKpiButtonRef}
          >
            Input KPI
          </button>

          <button className="start-btn kpi-saya-btn" onClick={handleFetchMyKpi}>
            Edit KPI
          </button>
        </div>

        {/* LOADING */}
        {hasKpiLoaded && loadingKpi && (
          <div className="kpi-loading-spinner">
            <div className="spinner-circle"></div>
            <p>Memuat KPI...</p>
          </div>
        )}

        {/* KPI CONTENT */}
        {hasKpiLoaded && !loadingKpi && myKpiData && (
          <>
            <div className="kpi-top-section">
              {/* SUMMARY */}
              <div className="kpi-summary-box">
                <div className="kpi-summary-item">
                  <div className="kpi-summary-number">{totalKaryawan}</div>
                  <div className="kpi-summary-label">
                    Karyawan sudah input KPI
                  </div>
                </div>

                <div className="kpi-summary-item">
                  <div className="kpi-summary-number">{totalKpi}</div>
                  <div className="kpi-summary-label">Total KPI masuk</div>
                </div>
              </div>

              {/* SEARCH */}
              <div className="kpi-search-wrapper">
                <Search className="kpi-search-icon" size={18} />
                <input
                  type="text"
                  className="kpi-search-input"
                  placeholder="Cari nama karyawan..."
                  value={searchName}
                  onChange={(e) => {
                    setSearchName(e.target.value);
                    setShowSuggest(true);
                  }}
                  onFocus={() => setShowSuggest(true)}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                />

                {showSuggest && filteredSuggestions.length > 0 && (
                  <ul className="kpi-suggest-list">
                    {filteredSuggestions.map((name) => (
                      <li
                        key={name}
                        className="kpi-suggest-item"
                        onClick={() => {
                          setSearchName(name);
                          setShowSuggest(false);
                        }}
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* KPI LIST */}
            <div className="my-kpi-section">
              <div className="my-kpi-title">KPI Karyawan</div>

              <div className="my-kpi-cards-wrapper">
                {Object.entries(myKpiData)
                  .filter(([nama]) =>
                    searchName
                      ? nama.toLowerCase().includes(searchName.toLowerCase())
                      : true
                  )
                  .sort(([a], [b]) => a.localeCompare(b)) // ✅ OTOMATIS A–Z
                  .map(([nama, kpis]) => {
                    const isOpen = expandedDates.includes(nama);

                    return (
                      <div
                        key={nama}
                        className={`kpi-card ${isOpen ? "open" : ""}`}
                        onClick={() => toggleDate(nama)}
                      >
                        <div className="kpi-card-header">
                          <h3>{nama}</h3>
                        </div>

                        {isOpen && (
                          <div className="kpi-content-wrapper">
                            <ul>
                              {kpis.map((kpi, idx) => (
                                <li key={idx}>
                                  <span className="kpi-label">
                                    <span className="kpi-pin">📌</span>
                                    <span className="kpi-text">
                                      {kpi.indikator_kpi}
                                    </span>
                                  </span>

                                  <span className="kpi-actual">
                                    {kpi.actual || "-"}
                                  </span>

                                  <div className="kpi-action-buttons">
                                    {kpi.bukti && (
                                      <a
                                        href={kpi.bukti}
                                        className="kpi-bukti-btn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        Lihat Bukti
                                      </a>
                                    )}

                                    <button
                                      className="kpi-edit-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(
                                          kpi.id,
                                          nama,
                                          kpi.actual,
                                          kpi.bukti
                                        );
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="expand-text">
                          {isOpen
                            ? "Klik untuk tutup"
                            : "Klik untuk lihat detail"}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="homepage-footer">
        <p>
          © {new Date().getFullYear()} Rumah Sakit Annisa — Mendampingi Sedekat
          Sahabat
        </p>
      </footer>

      {/* INPUT KPI FORM */}
      {showForm && user && (
        <KpiFormModal onClose={handleCloseModal} user={user} />
      )}

      {/* MODAL ALERT */}
      {modalData.isOpen && (
        <Modal
          isOpen={modalData.isOpen}
          type={modalData.type}
          title={modalData.title}
          message={modalData.message}
          onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={() => {
            if (modalData.onConfirm) modalData.onConfirm();
            setModalData((prev) => ({
              ...prev,
              isOpen: false,
              onConfirm: null,
            }));
          }}
        />
      )}

      {/* EDIT KPI MODAL */}
      {editModalData && (
        <div className="ekp-overlay">
          <div className="ekp-modal">
            <h3 className="ekp-title">Edit KPI: {editModalData.kpiKey}</h3>

            <p className="ekp-sisa-edit">
              Sisa edit:{" "}
              <strong>
                {2 - (editCounts[editModalData.kpiKey] || 0)} kali lagi
              </strong>
            </p>

            <div className="ekp-field">
              <label>Actual:</label>
              <input
                type="text"
                value={editModalData.actual}
                onChange={(e) =>
                  setEditModalData((prev) => ({
                    ...prev,
                    actual: e.target.value,
                  }))
                }
              />
            </div>

            <div className="ekp-field">
              <label>Bukti (opsional):</label>
              <div className="ekp-file-box">
                <label className="ekp-btn">
                  Pilih File
                  <input
                    type="file"
                    className="ekp-hidden-input"
                    onChange={handleFileChange}
                  />
                </label>

                {editModalData.buktiFilename && (
                  <span className="ekp-filename">
                    {shortenFilename(editModalData.buktiFilename)}
                  </span>
                )}
              </div>

              {editModalData.buktiFile && (
                <>
                  {editModalData.buktiType === "image" && (
                    <img
                      src={editModalData.buktiPreview}
                      alt="Preview"
                      className="ekp-img-preview"
                    />
                  )}

                  {editModalData.buktiType === "pdf" && (
                    <p className="ekp-pdf-preview">
                      PDF dipilih —{" "}
                      <a
                        href={URL.createObjectURL(editModalData.buktiFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat PDF
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="ekp-footer">
              <button
                className="ekp-save"
                onClick={handleSaveEdit}
                disabled={savingKpi}
              >
                {savingKpi ? "Menyimpan..." : "Simpan"}
              </button>

              <button
                className="ekp-cancel"
                onClick={closeEditModal}
                disabled={savingKpi}
              >
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
