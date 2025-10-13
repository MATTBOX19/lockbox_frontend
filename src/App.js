import React, { useEffect, useState } from "react";
import axios from "axios";
import Login from "./Login";
import Signup from "./Signup";
import "./theme.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://lockbox-backend-qkx9.onrender.com";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [picks, setPicks] = useState([]);
  const [record, setRecord] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/api/picks/protected`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setPicks(r.data.picks || []))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
    axios.get(`${API_BASE}/api/record`).then(r => setRecord(r.data || {}));
  }, [token]);

  if (!token) {
    return view === "login" ? (
      <Login onLogin={setUser} />
    ) : (
      <Signup onSignup={setUser} />
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
              <p><b>Odds:</b> {p.awayML} / {p.homeML}</p>
            </div>
          ))
        )}
      </div>
      <button onClick={() => { localStorage.clear(); window.location.reload(); }}>
        🔒 Logout
      </button>
    </div>
  );
}

export default App;
