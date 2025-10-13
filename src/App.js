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
    <div className="header">
      <h1 className="logo">💎 LOCKBOX AI</h1>
      <h2 className="subtitle">Win Smarter. Not Harder.</h2>
      <div className="record">🔥 Record: {record.wins}-{record.losses} ({record.winRate}%)</div>
    </div>

    <div className="content">
      {picks.length === 0 ? (
        <p className="loading">Loading AI Picks...</p>
      ) : (
        picks.map((p, i) => (
          <div key={i} className="card glow">
            <h3>{p.matchup}</h3>
            <p><b>AI Pick:</b> {p.pick}</p>
            <p><b>Confidence:</b> {p.confidence}%</p>
            <p style={{ color: "#00ffcc" }}>
              <b>Odds:</b> {p.odds?.awayML ?? "?"} / {p.odds?.homeML ?? "?"}
            </p>
            {/* Optional: Show more odds info like spreads/totals if needed */}
          </div>
        ))
      )}
    </div>

    <button onClick={() => { localStorage.clear(); window.location.reload(); }}>
      🔒 Logout
    </button>
  </div>
);
