import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE_URL || "";

const KpiTeam = ({ nama }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewer, setViewer] = useState(null);
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    if (!nama) return;

    const fetchTeamKPI = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.post(`${API}/api/team-kpi`, { nama });

        if (response.data?.result === "success") {
          const payload = response.data.message || {};
          setViewer(payload.viewer || null);
          setTeamData(payload.data || []);
        } else {
          setError(response.data?.message || "Data KPI team tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetch KPI team:", err);
        setError("Gagal mengambil data KPI team");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamKPI();
  }, [nama]);

  if (loading) return <div>Loading KPI Team...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      {/* VIEWER INFO */}
      {viewer && (
        <div style={{ marginBottom: 20 }}>
          <h2>KPI Team</h2>
          <p><strong>Nama:</strong> {viewer.Name}</p>
          <p><strong>Divisi:</strong> {viewer.Divisi}</p>
          <p><strong>Unit:</strong> {viewer.Unit}</p>
          <p><strong>Level:</strong> {viewer.Level}</p>
        </div>
      )}

      {/* TEAM KPI TABLE */}
      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>Divisi</th>
            <th>Nama</th>
            <th>Unit</th>
            <th>Area Kinerja</th>
            <th>Indikator KPI</th>
            <th>Target</th>
            <th>Satuan</th>
            <th>Actual</th>
            <th>Bukti</th>
            <th>Tanda Tangan</th>
          </tr>
        </thead>
        <tbody>
          {teamData.length === 0 ? (
            <tr>
              <td colSpan="10" align="center">
                Tidak ada data bawahan
              </td>
            </tr>
          ) : (
            teamData.map((item, index) => (
              <tr key={index}>
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
                    <a href={item.bukti} target="_blank" rel="noopener noreferrer">
                      Lihat
                    </a>
                  ) : "-"}
                </td>
                <td>
                  {item.tanda_tangan ? (
                    <a href={item.tanda_tangan} target="_blank" rel="noopener noreferrer">
                      Lihat
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default KpiTeam;
