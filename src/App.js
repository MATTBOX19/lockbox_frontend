import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("picks");
  const [picks, setPicks] = useState([]);
  const [scores, setScores] = useState([]);
  const [topPlays, setTopPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "https://lockbox-backend-qkx9.onrender.com";

  // ===========================
  // 📊 FETCH PICKS
  // ===========================
  const fetchPicks = async () => {
    try {
      setError(false);
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/picks`);
      if (!res.ok) throw new Error("Failed to fetch AI data");
      const data = await res.json();
      const allPicks = data.picks || [];
      setPicks(allPicks);

      // 🧠 Get Top 3 Recommended Plays
      const allRecommended = allPicks
        .map((g) => ({
          matchup: g.matchup || "Unknown Matchup",
          ...(g.recommendedPlay || {}),
        }))
        .filter((p) => p.pick)
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
        .slice(0, 3);

      setTopPlays(allRecommended);
    } catch (err) {
      console.error("❌ LockBox AI fetch error:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // 🏈 FETCH SCORES
  // ===========================
  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scores`);
      const data = await res.json();
      setScores(data.games || []);
    } catch (err) {
      console.error("❌ /api/scores error:", err.message);
    }
  };

  // ===========================
  // ⏱ INITIAL LOAD
  // ===========================
  useEffect(() => {
    fetchPicks();
    fetchScores();
    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, []);

  // ===========================
  // 🧭 TABS
  // ===========================
  const renderTabs = () => (
    <div className="tabs">
      <button
        className={activeTab === "picks" ? "active" : ""}
        onClick={() => setActiveTab("picks")}
      >
        🧠 AI Analysis
      </button>
      <button
        className={activeTab === "scores" ? "active" : ""}
        onClick={() => setActiveTab("scores")}
      >
        🏈 Scores
      </button>
    </div>
  );

  // ===========================
  // 💎 TOP 3 PLAYS
  // ===========================
  const renderTopPlays = () => (
    <div className="top-plays">
      <h2>💎 Top 3 AI Plays of the Week</h2>
      {topPlays.length === 0 ? (
        <p>No AI plays available yet.</p>
      ) : (
        topPlays.map((p, i) => (
          <div key={i} className="top-card">
            <h3>#{i + 1} – {p.matchup || "Unknown Matchup"}</h3>
            <p>
              <strong>{(p.type ? p.type.toUpperCase() : "N/A")}</strong> —{" "}
              {p.pick || "No Pick"}{" "}
              {p.line ? `(${p.line})` : ""} — {p.confidence || 0}% Confidence
            </p>
          </div>
        ))
      )}
    </div>
  );

  // ===========================
  // 🧠 PICKS TAB
  // ===========================
  const renderPicks = () => (
    <div className="ai-analysis">
      <h2>💎 LockBox AI Weekly Model</h2>
      <p className="subtext">AI-powered confidence edges & recommendations</p>

      {error && <p className="error">Could not connect to LockBox AI backend.</p>}
      {loading && <p>Loading AI analysis...</p>}

      {!loading && picks.length === 0 && <p>No upcoming games available.</p>}

      {!loading && topPlays.length > 0 && renderTopPlays()}

      {picks.map((p, i) => (
        <div key={i} className="card glow">
          <h3>{p.matchup || "Unknown Matchup"}</h3>
          <p className="book">📘 Bookmaker: {p.bookmaker || "N/A"}</p>
          <p className="time">
            🕒{" "}
            {p.commence_time
              ? new Date(p.commence_time).toLocaleString("en-US", {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </p>
          <div className="lines">
            {p.mlPick && (
              <p>
                💰 <b>Moneyline:</b> {p.mlPick.pick} ({p.mlPick.confidence}%)
              </p>
            )}
            {p.spreadPick && (
              <p>
                📏 <b>Spread:</b> {p.spreadPick.pick} ({p.spreadPick.confidence}%)
              </p>
            )}
            {p.totalPick && (
              <p>
                🔢 <b>Total:</b> {p.totalPick.pick} {p.totalPick.line} (
                {p.totalPick.confidence}%)
              </p>
            )}
          </div>
          {p.recommendedPlay && (
            <p className="edge">
              🎯 <b>Recommended Play:</b> {p.recommendedPlay.pick}{" "}
              {p.recommendedPlay.type === "total"
                ? `(${p.recommendedPlay.line})`
                : ""}{" "}
              — {p.recommendedPlay.confidence}% confidence
            </p>
          )}
        </div>
      ))}
    </div>
  );

  // ===========================
  // 🏈 SCORES TAB
  // ===========================
  const renderScores = () => (
    <div className="scores-section">
      <h2>🏈 Live & Recent NFL Scores</h2>
      {scores.length === 0 ? (
        <p>No live or recent games available.</p>
      ) : (
        scores.map((g, i) => (
          <div key={i} className="score-card">
            <h3>
              {g.away_team} @ {g.home_team}
            </h3>
            <p>
              {g.scores?.length > 0
                ? `${g.scores[0].name}: ${g.scores[0].score} | ${g.scores[1].name}: ${g.scores[1].score}`
                : "No score data"}
            </p>
            <p>
              {g.completed ? "✅ FINAL" : "⏱ LIVE"} |{" "}
              {g.last_update
                ? new Date(g.last_update).toLocaleTimeString()
                : ""}
            </p>
          </div>
        ))
      )}
    </div>
  );

  // ===========================
  // ⚙️ MAIN RENDER
  // ===========================
  return (
    <div className="App">
      <header>
        <h1>💎 LOCKBOX AI</h1>
        <p>Smarter. Sharper. Predictive.</p>
      </header>
      {renderTabs()}
      {activeTab === "picks" ? renderPicks() : renderScores()}
    </div>
  );
}

export default App;
