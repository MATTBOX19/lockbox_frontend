import React, { useEffect, useState } from "react";
import axios from "axios";
import "./theme.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://lockbox-backend-qkx9.onrender.com";

function App() {
  const [picks, setPicks] = useState([]);
  const [record, setRecord] = useState({});
  const [view, setView] = useState("picks");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const picksRes = await axios.get(`${API_BASE}/api/picks`);
        setPicks(picksRes.data.picks || []);
        const recordRes = await axios.get(`${API_BASE}/api/record`);
        setRecord(recordRes.data || {});
      } catch (err) {
        console.error("❌ API error:", err.message);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1 className="logo">💎 LOCKBOX AI</h1>
        <h2 className="subtitle">Win Smarter. Not Harder.</h2>
        <div className="record">
          🔥 Record: {record.wins || 0}-{record.losses || 0} ({record.winRate || "0"}%)
        </div>
        <div className="nav">
          <button onClick={() => setView("picks")} className={view === "picks" ? "active" : ""}>
            AI Picks
          </button>
        </div>
      </div>

      <div className="content">
        {view === "picks" && (
          <>
            {picks.length === 0 ? (
              <p className="loading">Loading AI picks…</p>
            ) : (
              picks.map((p, i) => (
                <div key={i} className="card glow">
                  <h3>{p.matchup}</h3>
                  <p><b>AI Pick:</b> {p.pick}</p>
                  <p><b>Odds:</b> {p.awayML} / {p.homeML}</p>
                  <div className="barContainer">
                    <div
                      className="bar"
                      style={{
                        width: `${p.confidence}%`,
                        background: p.confidence >= 65 ? "#00ff88" : "#ffaa00",
                      }}
                    >
                      {p.confidence}% Confidence
                    </div>
                  </div>
                  <p className="edge">🎯 Edge: {p.edge}</p>
                  <p className="modelTag">{p.aiModel}</p>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
