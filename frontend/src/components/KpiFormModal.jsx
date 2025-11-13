import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "./Modal";
import "../styles/KpiFormModal.css";
import "../styles/Modal.css";

export default function InputKPIModal({ user, onClose }) {
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

  const [buktiNilaiPreview, setBuktiNilaiPreview] = useState(null);
  const [buktiNilaiName, setBuktiNilaiName] = useState("");
  const [buktiNilaiBase64, setBuktiNilaiBase64] = useState("");
  const [tandaTanganData, setTandaTanganData] = useState("");
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredNames, setFilteredNames] = useState([]);
  const [filteredIndicators, setFilteredIndicators] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  // Modal state
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

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/indikator-data")
      .then((res) => {
        if (res.data.result === "success") {
          setIndikatorData(res.data.message);
        }
      })
      .catch((err) => console.error("Error load data:", err));
  }, []);

  const uniqueNames = [
    ...new Set(indikatorData.map((item) => item.nama).filter(Boolean)),
  ];

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

    if (data) {
      setForm({
        ...form,
        area_kinerja: data.area_kinerja,
        indikator_kpi: data.indikator_kpi,
        target: data.target,
        satuan: data.satuan,
      });
    } else {
      setForm({ ...form, indikator_kpi: indikator });
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setBuktiNilaiPreview(null);
      setBuktiNilaiName("");
      setBuktiNilaiBase64("");
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setBuktiNilaiPreview(url);
      setBuktiNilaiName(file.name);
    } catch (err) {
      setBuktiNilaiPreview(null);
      setBuktiNilaiName(file.name || "");
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setBuktiNilaiBase64(ev.target.result);
    };
    reader.onerror = () => {
      setBuktiNilaiBase64("");
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e) => {
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setDrawing(true);
    };

    const draw = (e) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDrawing = () => {
      if (!drawing) return;
      setDrawing(false);
      setTandaTanganData(canvas.toDataURL());
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mouseleave", endDrawing);

    const startTouch = (e) => {
      e.preventDefault();
      startDrawing(e.touches ? e.touches[0] : e);
    };
    const moveTouch = (e) => {
      e.preventDefault();
      draw(e.touches ? e.touches[0] : e);
    };
    const endTouch = (e) => {
      e.preventDefault();
      endDrawing();
    };

    canvas.addEventListener("touchstart", startTouch, { passive: false });
    canvas.addEventListener("touchmove", moveTouch, { passive: false });
    canvas.addEventListener("touchend", endTouch);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDrawing);
      canvas.removeEventListener("mouseleave", endDrawing);

      canvas.removeEventListener("touchstart", startTouch);
      canvas.removeEventListener("touchmove", moveTouch);
      canvas.removeEventListener("touchend", endTouch);
    };
  }, [drawing]);

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
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTandaTanganData("");
  };

  const handleSubmit = async () => {
    if (!form.nama || batchList.length === 0) {
      showModal("Perhatian", "Pilih nama dan tambahkan minimal 1 indikator", "error");
      return;
    }

    if (!tandaTanganData) {
      showModal("Perhatian", "Tanda tangan wajib diisi.", "error");
      return;
    }

    // pastikan semua bukti nilai ada
    const missingBukti = batchList.some((b) => !b.bukti_nilai);
    if (missingBukti) {
      showModal("Perhatian", "Semua indikator harus memiliki bukti nilai.", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: user.email,
        password: user.password,
        nama: form.nama,
        divisi: form.divisi,
        unit: form.unit,
        tanda_tangan: tandaTanganData || "",
        indikator_list: batchList,
      };

      const res = await axios.post("http://localhost:5000/api/kpi-batch", payload);

      if (res.data.result === "success") {
        showModal("Berhasil", res.data.message, "success");
        onClose();
      } else {
        showModal("Gagal", res.data.message, "error");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message
        ? ` — ${err.response.data.message}`
        : "";
      showModal("Gagal", "Error input KPI: " + err.message + serverMsg, "error");
      console.error("Submit payload:", {
        email: user.email,
        nama: form.nama,
        divisi: form.divisi,
        unit: form.unit,
        tanda_tangan: tandaTanganData ? "[base64]" : "",
        indikator_list: batchList,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rsia-modal-backdrop">
      <div className="rsia-modal" role="dialog" aria-modal="true" aria-labelledby="kpi-title">
        <div className="rsia-modal-header">
          <h5 id="kpi-title">Input Indikator KPI</h5>
          <button className="rsia-modal-close" onClick={onClose} aria-label="Tutup modal" disabled={loading}>
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
              <input value={form.divisi} placeholder="Divisi" readOnly />
            </div>
            <div className="rsia-form-group">
              <label>Unit</label>
              <input value={form.unit} placeholder="Unit" readOnly />
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
                .filter((f) => !batchList.some((b) => b.indikator_kpi === f.indikator_kpi))
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
            <input
              name="area_kinerja"
              value={form.area_kinerja}
              placeholder="Area Kinerja"
              readOnly
            />
          </div>
          <div className="rsia-form-row">
            <div className="rsia-form-group">
              <label>Target</label>
              <input name="target" value={form.target} placeholder="Target" readOnly />
            </div>
            <div className="rsia-form-group">
              <label>Satuan</label>
              <input name="satuan" value={form.satuan} placeholder="Satuan" readOnly />
            </div>
            <div className="rsia-form-group">
              <label>Actual</label>
              <input
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
            <label>Bukti Nilai</label>
            <input type="file" onChange={handleFileChange} disabled={loading} />
            {buktiNilaiPreview && (
              <div className="rsia-preview-wrap">
                <div style={{ flex: "1 1 200px" }}>
                  <div className="rsia-preview-title">Preview ({buktiNilaiName})</div>
                  <div>
                    {buktiNilaiName && buktiNilaiName.toLowerCase().endsWith(".pdf") ? (
                      <embed
                        src={buktiNilaiPreview}
                        width="100%"
                        height="200px"
                        type="application/pdf"
                        className="rsia-preview"
                      />
                    ) : (
                      <img
                        src={buktiNilaiPreview}
                        alt="preview"
                        className="rsia-preview"
                      />
                    )}
                  </div>
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
                      </div>
                    </div>

                    <div className="right-actions">
                      <button
                        type="button"
                        className="delete-batch"
                        onClick={() =>
                          setBatchList((prev) => prev.filter((_, idx) => idx !== i))
                        }
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
            <canvas ref={canvasRef} width={600} height={300} />
            <span className="rsia-sign-hint">Gambar tanda tangan di atas</span>

            <div className="rsia-canvas-footer">
              <button
                type="button"
                className="clear-sign"
                onClick={clearSignature}
                disabled={loading}
              >
                Hapus Tanda Tangan
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="rsia-modal-footer">
          <button onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              "Simpan KPI"
            )}
          </button>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
