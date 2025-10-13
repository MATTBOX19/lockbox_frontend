import React, { useEffect, useState } from "react";
import axios from "axios";
import Login from "./Login";
import Signup from "./Signup";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://lockbox-backend-qkx9.onrender.com";
console.log("🔍 Using API base:", API_BASE);

function App() {
  const [user, setUser] = useState(null);
  const [picks, setPicks] = useState([]);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get public AI picks
        const res = await axios.get(`${API_BASE}/api/picks`);
        setPicks(res.data.picks || []);

        // Get record
        const rec = await axios.get(`${API_BASE}/api/record`);
        setRecord(rec.data || {});
      } catch (err) {
        console.error("❌ Error fetching data:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper to format odds
  const fmt = (n) => (n > 0 ? `+${n}` : n);

  // Show login/signup if not logged in
  if (!user) {
    return (
      <div className="auth">
        <h1>🔒 LockBox Login</h1>
        <Login onLogin={setUser} />
        <Signup onSignup={setUser} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1 className="logo">💎 LOCKBOX AI</h1>
        <h2 className="subtitle">Win Smarter. Not Harder.</h2>
        <div className="record">
          🔥 Record: {record.wins}-{record.losses} ({record.winRate}%)
        </div>
      </div>

      <div className="content">
        {loading ? (
          <p className="loading">Loading AI Picks...</p>
        ) : (
          picks.map((p, i) => (
            <div key={i} className="card glow">
              <h3>{p.matchup}</h3>
              <p><b>AI Pick:</b> {p.pick}</p>
              <p><b>Confidence:</b> {p.confidence}%</p>
              <p>
                <b>Odds:</b>{" "}
                {p.awayML && p.homeML
                  ? `${fmt(p.awayML)} / ${fmt(p.homeML)}`
                  : "/"}
              </p>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
      >
        🔒 Logout
      </button>
    </div>
  );
}

export default App;
