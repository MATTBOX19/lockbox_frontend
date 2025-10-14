import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [games, setGames] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "https://lockbox-backend-qkx9.onrender.com";

  // ===============================
  // 🧠 FETCH AI GAME PICKS
  // ===============================
  const fetchGames = async () => {
    try {
      setError(false);
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/picks`);
      if (!res.ok) throw new Error("Failed to fetch picks");
      const data = await res.json();
      setGames(data.picks || []);
    } catch (err) {
      console.error("❌ Error fetching picks:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🏈 FETCH SCORES
  // ===============================
  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scores`);
      const data = await res.json();
      setScores(data.games || []);
    } catch (err) {
      console.error("❌ Error fetching scores:", err.message);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchScores();
    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, []);

  // ===============================
  // ⚙️ HELPER: TOP 3 PICKS
  // ===============================
  const getTopPicks = () => {
    const allPicks = games
      .map((g) => ({
        matchup: g.matchup,
        bookmaker: g.bookmaker,
        ml: g.mlPick?.confidence || 0,
        spread: g.spreadPick?.confidence || 0,
        best: Math.max(g.mlPick?.confidence || 0, g.spreadPick?.confidence || 0),
        mlPick: g.mlPick,
        spreadPick: g.spreadPick,
      }))
      .sort((a, b) => b.best - a.best)
      .slice(0, 3);

    return allPicks;
  };

  // ===============================
  // 🎯 RENDER TOP PICKS
  // ===============================
  const renderTopPlays = () => {
    const top = getTopPicks();
    if (top.length === 0) return <p>No top picks available.</p>;

    return (
      <div className="card">
        <h2>🔥 Top 3 AI Picks</h2>
        {top.map((g, i) => (
          <div key={i} className="pick-card glow">
            <h3>{g.matchup}</h3>
            <p>Bookmaker: {g.bookmaker}</p>
            {g.mlPick && (
              <p>
                <strong>💰 ML:</strong> {g.mlPick.pick} ({g.mlPick.confidence}%)
              </p>
            )}
            {g.spreadPick && (
              <p>
                <strong>📏 Spread:</strong> {g.spreadPick.pick} (
                {g.spreadPick.confidence}%)
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ===============================
  // 📊 RENDER ALL GAMES
  // ===============================
  const renderAllGames = () => {
    if (loading) return <p>Loading LockBox AI data...</p>;
    if (error) return <p className="error">Could not connect to AI server.</p>;
    if (!games.length) return <p>No data available.</p>;

    return (
      <>
        <h2>💎 LockBox AI Weekly Model</h2>
        <p>AI-powered confidence edges & recommendations</p>

        {games.map((g, i) => (
          <div key={i} className="card">
            <h3>{g.matchup}</h3>
            <p>📘 Bookmaker: {g.bookmaker}</p>
            {g.start_time && (
              <p>🕒 {new Date(g.start_time).toLocaleString()}</p>
            )}
            {g.mlPick && (
              <p>
                💰 <strong>Moneyline:</strong> {g.mlPick.pick} (
                {g.mlPick.confidence}%)
              </p>
            )}
            {g.spreadPick && (
              <p>
                📏 <strong>Spread:</strong> {g.spreadPick.pick} (
                {g.spreadPick.confidence}%)
              </p>
            )}
          </div>
        ))}
      </>
    );
  };

  // ===============================
  // 🏈 RENDER SCORES
  // ===============================
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
              {new Date(g.last_update).toLocaleTimeString()}
            </p>
          </div>
        ))
      )}
    </div>
  );

  // ===============================
  // 🚀 RETURN
  // ===============================
  return (
    <div className="App">
      <h1>💎 LOCKBOX AI</h1>
      <p>Smarter. Sharper. Predictive.</p>

      <div className="nav">
        <button
          className={activeTab === "analysis" ? "active" : ""}
          onClick={() => setActiveTab("analysis")}
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

      {activeTab === "analysis" ? (
        <>
          {renderTopPlays()}
          {renderAllGames()}
        </>
      ) : (
        renderScores()
      )}
    </div>
  );
}

export default App;
