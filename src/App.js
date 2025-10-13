import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_BASE_URL;

export default function App() {
  const [picks, setPicks] = useState([]);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        console.log("[LockBox] Fetching from:", API);
        const picksRes = await fetch(`${API}/api/picks`);
        const recordRes = await fetch(`${API}/api/record`);

        if (!picksRes.ok) throw new Error("Failed to load picks");
        if (!recordRes.ok) throw new Error("Failed to load record");

        const picksData = await picksRes.json();
        const recordData = await recordRes.json();

        console.log("[LockBox] Picks response:", picksData);
        console.log("[LockBox] Record response:", recordData);

        setPicks(picksData.picks || []);
        setRecord(recordData);
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <h2 style={{ textAlign: "center", color: "#00f3c3" }}>Loading AI Picks...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app" style={{ textAlign: "center", color: "red" }}>
        <h2>⚠️ Error: {error}</h2>
        <p>Check the console for details.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header" style={{ textAlign: "center", margin: "20px 0" }}>
        <h1>💎 LOCKBOX AI</h1>
        <h2 style={{ color: "#00f3c3" }}>Win Smarter. Not Harder.</h2>
        <p style={{ fontSize: "1.1rem", color: "orange" }}>
          🔥 Record: {record.wins}-{record.losses} ({record.winRate}%)
        </p>
      </div>

      <div className="content" style={{ padding: "10px", display: "grid", gap: "20px" }}>
        {picks.length === 0 ? (
          <p style={{ textAlign: "center" }}>No active games right now.</p>
        ) : (
          picks.map((p, i) => (
            <div
              key={i}
              className="card"
              style={{
                background: "#111",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 0 10px #00f3c322",
              }}
            >
              <h3>{p.matchup}</h3>
              <p><b>AI Pick:</b> {p.pick}</p>
              <p><b>Confidence:</b> {p.confidence}%</p>
              <p><b>Odds:</b> {p.oddsText || `${p.awayML ?? ""} / ${p.homeML ?? ""}`}</p>
              <p><b>Bookmaker:</b> {p.bookmaker || "N/A"}</p>
              <p><b>Model:</b> {p.aiModel}</p>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            background: "#00f3c3",
            color: "#000",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔒 Logout
        </button>
      </div>
    </div>
  );
}
