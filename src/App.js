import React, { useEffect, useState } from "react";
import axios from "axios";
import "./theme.css";

const API_BASE =
  (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim()) ||
  "https://lockbox-backend-qkx9.onrender.com";

console.log("🔍 Using API base:", API_BASE);




function App() {
  const [picks, setPicks] = useState([]);
  const [record, setRecord] = useState({});
  const [scores, setScores] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [view, setView] = useState("picks");

  useEffect(() => {
    axios.get(`${API_BASE}/api/picks`).then(r => setPicks(r.data.picks || []));
    axios.get(`${API_BASE}/api/record`).then(r => setRecord(r.data || {}));

    // leaderboard mockup
    const fakeLeaders = [
      { name: "AI Model Alpha", accuracy: 78 },
      { name: "LockBox Edge", accuracy: 72 },
      { name: "SharpPredict v2", accuracy: 69 },
      { name: "Vegas Pulse", accuracy: 65 },
      { name: "Public Consensus", accuracy: 51 },
    ];
    setLeaders(fakeLeaders);

    const fetchScores = () => {
      axios.get(`${API_BASE}/api/scores`).then(r => setScores(r.data || []));
    };
    fetchScores();
    const timer = setInterval(fetchScores, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1 className="logo">💎 LOCKBOX AI</h1>
        <h2 className="subtitle">Win Smarter. Not Harder.</h2>
        <div className="record">
          🔥 Record: {record.wins || 0}-{record.losses || 0} (
          {record.winRate || "0"}%)
        </div>
        <div className="nav">
          <button onClick={() => setView("picks")} className={view === "picks" ? "active" : ""}>AI Picks</button>
          <button onClick={() => setView("scores")} className={view === "scores" ? "active" : ""}>📡 Live Scores</button>
          <button onClick={() => setView("leaderboard")} className={view === "leaderboard" ? "active" : ""}>🏆 Leaderboard</button>
        </div>
      </div>

      <div className="content">
        {view === "picks" &&
          (picks.length === 0 ? (
            <p className="loading">Loading AI picks…</p>
          ) : (
            picks.map((p, i) => (
              <div key={i} className="card glow">
                <h3>{p.matchup}</h3>
                <p><b>Pick:</b> {p.pick}</p>
                <p><b>Confidence:</b> {p.confidence}%</p>
              </div>
            ))
          ))}

        {view === "scores" &&
          (scores.length === 0 ? (
            <p className="loading">Fetching live scores…</p>
          ) : (
            scores.map((g, i) => (
              <div key={i} className="card glow alt">
                <h3>{g.home} <span>vs</span> {g.away}</h3>
                <p className="score">{g.score}</p>
                <p className="status">{g.status}</p>
              </div>
            ))
          ))}

        {view === "leaderboard" && (
          <div className="leaderboard">
            <h2>🏆 Top AI Performers</h2>
            {leaders.map((l, i) => (
              <div key={i} className="leader glow">
                <span className="rank">#{i + 1}</span>
                <span className="name">{l.name}</span>
                <span className="acc">{l.accuracy}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
