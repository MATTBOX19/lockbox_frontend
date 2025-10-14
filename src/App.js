import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("nfl");
  const [picks, setPicks] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "https://lockbox-backend-qkx9.onrender.com";

  // Fetch picks for selected sport
  const fetchPicks = async (sport) => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`${API_BASE}/api/picks/${sport}`);
      if (!res.ok) throw new Error("Failed to fetch picks");
      const data = await res.json();
      setPicks(data.picks || []);
    } catch (err) {
      console.error("❌ fetchPicks error:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live & recent scores
  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scores`);
      const data = await res.json();
      setScores(data.games || []);
    } catch (err) {
      console.error("❌ fetchScores error:", err.message);
      setScores([]);
    }
  };

  // On first load & when tab changes
  useEffect(() => {
    if (activeTab !== "scores") {
      fetchPicks(activeTab);
    } else {
      fetchScores();
    }
  }, [activeTab]);

  // =============== 🌐 NAV TABS ===============
  const renderTabs = () => (
    <div className="tabs">
      {["nfl", "mlb", "nhl", "ncaaf", "scores"].map((tab) => (
        <button
          key={tab}
          className={activeTab === tab ? "active" : ""}
          onClick={() => setActiveTab(tab)}
        >
          {tab === "scores"
            ? "🏈 Scores"
            : tab.toUpperCase()}
        </button>
      ))}
    </div>
  );

  // =============== 🎯 PICKS TAB ===============
  const renderPicks = () => (
    <div className="picks-section">
      {loading && <p>Loading AI analysis...</p>}
      {error && (
        <p className="error">
          Could not connect to LockBox AI server.
        </p>
      )}
      {!loading && !error && picks.length === 0 && (
        <p>No picks found for this sport today.</p>
      )}

      {!loading &&
        picks.map((p, i) => (
          <div key={i} className="card">
            <h3>{p.matchup}</h3>
            <p>Bookmaker: {p.bookmaker}</p>
            <p>
              <strong>Moneyline Pick:</strong>{" "}
              {p.moneyline?.pick || "—"} (
              {p.moneyline?.confidence || 0}%)
            </p>
            {p.spread && (
              <p>
                <strong>Spread Pick:</strong>{" "}
                {p.spread.pick} ({p.spread.confidence}%)
              </p>
            )}
          </div>
        ))}
    </div>
  );

  // =============== 🏈 SCORES TAB ===============
  const renderScores = () => (
    <div className="scores-section">
      <h2>🏈 Live & Recent NFL Scores</h2>
      {scores.length === 0 ? (
        <p>No live or recent games.</p>
      ) : (
        scores.map((g, i) => (
          <div key={i} className="card">
            <h3>
              {g.away_team} @ {g.home_team}
            </h3>
            <p>
              {g.scores?.length > 0
                ? `${g.scores[0].name}: ${g.scores[0].score} | ${g.scores[1].name}: ${g.scores[1].score}`
                : "No score data"}
            </p>
            <p>{g.completed ? "✅ FINAL" : "⏱ LIVE"}</p>
          </div>
        ))
      )}
    </div>
  );

  // =============== 🧠 MAIN RENDER ===============
  return (
    <div className="App">
      <header className="header">
        <h1 className="logo">💎 LOCKBOX AI</h1>
        <p className="subtitle">Smart AI Sports Analysis</p>
      </header>

      {renderTabs()}

      <div className="content">
        {activeTab === "scores" ? renderScores() : renderPicks()}
      </div>
    </div>
  );
}

export default App;
