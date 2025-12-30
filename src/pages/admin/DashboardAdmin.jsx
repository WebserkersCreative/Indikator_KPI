import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE_URL || "";

const DashboardAdmin = () => {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKPI();
  }, []);

  const fetchKPI = async () => {
    try {
      const response = await axios.get(`${API}/api/admin/kpi-all`);
      if (response.data.result === "success") {
        setKpiData(response.data.message || []);
      } else {
        setError(response.data.message || "Gagal memuat data");
      }
    } catch (err) {
      setError("Server tidak merespons");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard - KPI</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && <KpiTable data={kpiData} />}
    </div>
  );
};

// Tabel Komponen untuk menampilkan data KPI
const KpiTable = ({ data }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tanggal</th>
            <th>Divisi</th>
            <th>Nama</th>
            <th>Unit</th>
            <th>Area</th>
            <th>Indikator</th>
            <th>Target</th>
            <th>Satuan</th>
            <th>Actual</th>
            <th>Bukti</th>
            <th>TTD</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.tanggal}</td>
              <td>{item.divisi}</td>
              <td>{item.nama}</td>
              <td>{item.unit}</td>
              <td>{item.area_kinerja}</td>
              <td>{item.indikator_kpi}</td>
              <td>{item.target}</td>
              <td>{item.satuan}</td>
              <td>{item.actual}</td>
              <td>
                {item.bukti ? (
                  <button
                    className="btn-link"
                    onClick={() => window.open(item.bukti, "_blank")}
                  >
                    Lihat
                  </button>
                ) : (
                  "-"
                )}
              </td>
              <td>
                {item.tanda_tangan ? (
                  <button
                    className="btn-link"
                    onClick={() => window.open(item.tanda_tangan, "_blank")}
                  >
                    Lihat
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardAdmin;
