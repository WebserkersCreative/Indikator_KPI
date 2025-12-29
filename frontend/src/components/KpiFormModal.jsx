import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "./Modal";
import "../styles/KpiFormModal.css";
import "../styles/Modal.css";

export default function InputKPIModal({ user, onClose }) {
  const API = process.env.REACT_APP_API_BASE_URL || "";

  const [indikatorData, setIndikatorData] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    divisi: "",
    unit: "",
    area_kinerja: "",
    indikator_kpi: "",
    target: "",
    satuan: "",
    actual: "",
  });

  // ===== TARGET CONTROL =====
  const [editTarget, setEditTarget] = useState(false);
  const [isTargetFluktuatif, setIsTargetFluktuatif] = useState(false);

  // FILE STATES (UPDATE SUPPORT PDF)
  const [buktiNilaiPreview, setBuktiNilaiPreview] = useState(null);
  const [buktiNilaiName, setBuktiNilaiName] = useState("");
  const [buktiNilaiBase64, setBuktiNilaiBase64] = useState("");
  const [buktiIsPDF, setBuktiIsPDF] = useState(false);

  const [drawing, setDrawing] = useState("");
  const canvasRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredNames, setFilteredNames] = useState([]);
  const [filteredIndicators, setFilteredIndicators] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");

  const showModal = (title, message, type = "info") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const showFinishModal = () => {
    setModalTitle("Selesai");
    setModalMessage("Terima kasih telah mengisi KPI. Pengisian KPI berhasil disimpan.");
    setModalType("finish");
    setModalOpen(true);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (loading) {
        e.preventDefault();
        e.returnValue = "Data KPI sedang disimpan. Apakah Anda yakin ingin meninggalkan halaman?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [loading]);

  useEffect(() => {
    axios
      .get(`${API}/api/indikator-data`)
      .then((res) => {
        if (res.data.result === "success") {
          setIndikatorData(res.data.message);
        }
      })
      .catch((err) => console.error("Error load data:", err));
  }, [API]);

  const uniqueNames = [...new Set(indikatorData.map((item) => item.nama).filter(Boolean))];

  const handleNamaChange = (e) => {
    const namaInput = e.target.value;
    setForm({ ...form, nama: namaInput });

    if (namaInput.trim() === "") {
      setForm({
        nama: "",
        divisi: "",
        unit: "",
        area_kinerja: "",
        indikator_kpi: "",
        target: "",
        satuan: "",
        actual: "",
      });
      setDropdownOpen(false);
      return;
    }

    if (namaInput.length >= 3) {
      const filtered = uniqueNames.filter((nama) =>
        nama.toLowerCase().includes(namaInput.toLowerCase())
      );
      setFilteredNames(filtered);
      setDropdownOpen(filtered.length > 0);
    } else {
      setDropdownOpen(false);
    }
  };

  const handleSelectNama = (namaTerpilih) => {
    const dataNama = indikatorData.find((d) => d.nama === namaTerpilih);
    if (!dataNama) return;

    setForm({
      ...form,
      nama: dataNama.nama,
      divisi: dataNama.divisi,
      unit: dataNama.unit,
      area_kinerja: "",
      indikator_kpi: "",
      target: "",
      satuan: "",
      actual: "",
    });
    setDropdownOpen(false);

    const filtered = indikatorData.filter((d) => d.nama === namaTerpilih);
    setFilteredIndicators(filtered);
  };

const handleIndikatorChange = (e) => {
  const indikator = e.target.value;

  const data = indikatorData.find(
    (d) => d.nama === form.nama && d.indikator_kpi === indikator
  );

  if (!data) {
    setForm({ ...form, indikator_kpi: indikator });
    setIsTargetFluktuatif(false);
    return;
  }

  const fluktuatif = checkIfTargetIsFluktuatif(data.target);

  setIsTargetFluktuatif(fluktuatif);

  setForm({
    ...form,
    indikator_kpi: data.indikator_kpi,
    area_kinerja: data.area_kinerja,
    target: data.target,
    satuan: data.satuan,
  });
};


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ====================== UPDATE FILE HANDLING (SUPPORT PDF) ======================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setBuktiIsPDF(false);

    if (!file) {
      setBuktiNilaiPreview(null);
      setBuktiNilaiName("");
      setBuktiNilaiBase64("");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      showModal("Perhatian", "File harus berupa JPG, JPEG, PNG, atau PDF.", "error");
      e.target.value = null;
      setBuktiNilaiPreview(null);
      setBuktiNilaiName("");
      setBuktiNilaiBase64("");
      return;
    }

    setBuktiNilaiName(file.name);

    if (file.type === "application/pdf") {
      setBuktiIsPDF(true);
      setBuktiNilaiPreview(null);
    } else {
      const url = URL.createObjectURL(file);
      setBuktiNilaiPreview(url);
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setBuktiNilaiBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  };
  // ==============================================================================

  const handleAddBatch = () => {
    if (!form.indikator_kpi || !form.actual) return;

    if (!buktiNilaiBase64) {
      showModal("Perhatian", "Bukti nilai wajib diunggah.", "error");
      return;
    }

    const exists = batchList.some((b) => b.indikator_kpi === form.indikator_kpi);
    if (exists) {
      showModal("Perhatian", "Indikator sudah ditambahkan.", "error");
      return;
    }

    setBatchList((prev) => [
      ...prev,
      {
        ...form,
        bukti_nilai_name: buktiNilaiName || "",
        bukti_nilai: buktiNilaiBase64 || "",
        bukti_pdf: buktiIsPDF ? true : false,
      },
    ]);

    setForm({
      ...form,
      indikator_kpi: "",
      area_kinerja: "",
      target: "",
      satuan: "",
      actual: "",
    });

    setBuktiNilaiPreview(null);
    setBuktiNilaiName("");
    setBuktiNilaiBase64("");
    setBuktiIsPDF(false);

    if (fileRef.current) fileRef.current.value = null;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawing("");
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    let rect = canvas.getBoundingClientRect();
    let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    let y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    const move = (ev) => {
      let nx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      let ny = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top;
      ctx.lineTo(nx, ny);
      ctx.stroke();
    };

    const up = () => {
      setDrawing(canvas.toDataURL());
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext("2d");
      ctx.scale(ratio, ratio);
      if (drawing) {
        const img = new Image();
        img.src = drawing;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        };
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [drawing]);

  const handleSubmit = async () => {
    if (!form.nama || batchList.length === 0) {
      showModal("Perhatian", "Pilih nama dan tambahkan minimal 1 indikator", "error");
      return;
    }
    if (!drawing) {
      showModal("Perhatian", "Tanda tangan wajib diisi.", "error");
      return;
    }

    const payload = {
      email: user.email,
      password: user.password,
      nama: form.nama,
      divisi: form.divisi,
      unit: form.unit,
      tanda_tangan: drawing,
      indikator_list: batchList,
    };

    try {
      setLoading(true);
      setLoadingModal(true);

      const res = await axios.post(`${API}/api/kpi-batch`, payload);

      setLoadingModal(false);

      if (res.data.result === "success") {
        showFinishModal();
      } else {
        showModal("Gagal", res.data.message, "error");
      }
    } catch (err) {
      setLoadingModal(false);

      const serverMsg = err.response?.data?.message
        ? ` — ${err.response.data.message}`
        : "";

      showModal("Gagal", "Error input KPI: " + err.message + serverMsg, "error");
      console.error("Submit payload error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== CEK FLUKTUATIF =====
  const checkIfTargetIsFluktuatif = (target) => {
    return typeof target === "string" && target.toLowerCase().includes("fluktuatif");
  };



  return (
    <div className="rsia-modal-backdrop">
      <div className="rsia-modal" role="dialog" aria-modal="true" aria-labelledby="kpi-title">
        <div className="rsia-modal-header">
          <h5 id="kpi-title">Input Indikator KPI</h5>
          <button
            className="rsia-modal-close"
            onClick={onClose}
            aria-label="Tutup modal"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <div className="rsia-modal-body">
          {/* NAMA */}
          <div className="rsia-form-group" style={{ position: "relative" }}>
            <label>Nama</label>
            <input
              ref={inputRef}
              value={form.nama}
              onChange={handleNamaChange}
              placeholder="Cari nama karyawan..."
              autoComplete="off"
              disabled={loading}
            />
            {dropdownOpen && filteredNames.length > 0 && (
              <ul className="rsia-dropdown" role="listbox">
                {filteredNames.map((nama, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectNama(nama)}
                    role="option"
                    aria-selected={form.nama === nama}
                  >
                    <span className="rsia-nama">{nama}</span>
                    <small className="rsia-detail">
                      {indikatorData.find((d) => d.nama === nama)?.divisi} -{" "}
                      {indikatorData.find((d) => d.nama === nama)?.unit}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* DIVISI & UNIT */}
          <div className="rsia-form-row">
            <div className="rsia-form-group">
              <label>Divisi</label>
              <input value={form.divisi} placeholder="Divisi" readOnly className="rsia-input-locked" />
            </div>
            <div className="rsia-form-group">
              <label>Unit</label>
              <input value={form.unit} placeholder="Unit" readOnly className="rsia-input-locked" />
            </div>
          </div>

          {/* INDIKATOR KPI */}
          <div className="rsia-form-group">
            <label>Indikator KPI</label>
            <select
              name="indikator_kpi"
              value={form.indikator_kpi}
              onChange={handleIndikatorChange}
              disabled={!form.nama || loading}
            >
              <option value="">-- Pilih Indikator --</option>
              {filteredIndicators
                .filter(
                  (f) => !batchList.some((b) => b.indikator_kpi === f.indikator_kpi)
                )
                .map((item, index) => (
                  <option key={index} value={item.indikator_kpi}>
                    {item.indikator_kpi}
                  </option>
                ))}
            </select>
          </div>

          {/* AREA, TARGET, SATUAN, ACTUAL */}
          <div className="rsia-form-group">
            <label>Area Kinerja</label>
            <input name="area_kinerja" value={form.area_kinerja} placeholder="Area Kinerja" readOnly className="rsia-input-locked" />
          </div>

          <div className="rsia-form-row">
            <div className="rsia-form-group">
            <label>
              Target
              {isTargetFluktuatif && (
                <>
                  <input
                    type="checkbox"
                    checked={editTarget}
                    onChange={(e) => setEditTarget(e.target.checked)}
                    style={{ marginLeft: 10 }}
                  />
                  <span style={{ marginLeft: 5 }}>Ubah Target</span>
                </>
              )}
            </label>

            <input
              name="target"
              placeholder="Masukkan Nilai Target"
              value={form.target}
              onChange={handleChange}
              readOnly={!isTargetFluktuatif || !editTarget}
              disabled={loading}
              className={
                !isTargetFluktuatif || !editTarget
                  ? "rsia-input-locked"
                  : "rsia-input-editable"
              }
            />
            </div>

            <div className="rsia-form-group">
              <label>Satuan</label>
              <input name="satuan" value={form.satuan} placeholder="Satuan" readOnly className="rsia-input-locked"/>
            </div>

            <div className="rsia-form-group">
              <label>Actual</label>
              <input
                type="number"
                name="actual"
                value={form.actual}
                placeholder="Masukkan nilai aktual"
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* BUKTI NILAI */}
          <div className="rsia-form-group">
            <label>Bukti Nilai (jpg/png/pdf)</label>
            <input type="file" ref={fileRef} onChange={handleFileChange} disabled={loading} />

            {/* IF IMAGE → SHOW PREVIEW */}
            {buktiNilaiPreview && !buktiIsPDF && (
              <div className="rsia-preview-wrap">
                <div style={{ flex: "1 1 200px" }}>
                  <div className="rsia-preview-title">Preview ({buktiNilaiName})</div>
                  <img src={buktiNilaiPreview} alt="preview" className="rsia-preview" />
                </div>
              </div>
            )}

            {/* IF PDF → SHOW ICON */}
            {buktiIsPDF && (
              <div className="rsia-preview-wrap" style={{ marginTop: "10px" }}>
                <div className="rsia-preview-title">File PDF: {buktiNilaiName}</div>
                <div style={{ fontSize: "14px", marginTop: "5px", color: "#333" }}>
                  📄 PDF siap diunggah
                </div>
              </div>
            )}
          </div>

          <div className="rsia-form-group">
            <button
              type="button"
              className="add-batch"
              onClick={handleAddBatch}
              disabled={!form.indikator_kpi || !form.actual || loading}
            >
              Tambah
            </button>
          </div>

          {batchList.length > 0 && (
            <div className="rsia-batch-list" aria-live="polite">
              <label>Daftar Indikator yang ditambahkan</label>
              <ul>
                {batchList.map((b, i) => (
                  <li key={i}>
                    <div className="batch-info">
                      <div className="indikator">{b.indikator_kpi}</div>
                      <div className="meta">
                        Actual: {b.actual} • Bukti: {b.bukti_nilai_name || "—"}
                        {b.bukti_pdf && " (PDF)"}
                      </div>
                    </div>
                    <div className="right-actions">
                      <button
                        type="button"
                        className="delete-batch"
                        onClick={() => setBatchList((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label={`Hapus ${b.indikator_kpi}`}
                        disabled={loading}
                      >
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TANDA TANGAN */}
          <div className="rsia-form-group">
            <label className="rsia-sign-label">Tanda Tangan</label>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              onMouseDown={startDrawing}
              onTouchStart={startDrawing}
              style={{
                border: "1px solid #ccc",
                cursor: "crosshair",
                width: "100%",
                height: "200px",
              }}
            />
            <span className="rsia-sign-hint">Gambar tanda tangan di atas</span>
            <div className="rsia-canvas-footer">
              <button type="button" className="clear-sign" onClick={clearSignature} disabled={loading}>
                Hapus Tanda Tangan
              </button>
            </div>
          </div>
        </div>

        <div className="rsia-modal-footer">
          <button onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading}>
            Simpan KPI
          </button>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => {
          setModalOpen(false);
          if (modalType === "finish") onClose();
        }}
      />

      <Modal
        isOpen={loadingModal}
        title="Menyimpan Data"
        message="Mohon tunggu sebentar..."
        type="loading"
        isLoading={true}
        onClose={null}
      />
    </div>
  );
}
