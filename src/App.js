import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "https://lockbox-backend-qkx9.onrender.com";

  // Fetch AI Game Data
  const fetchAIGames = async () => {
    try {
      setError(false);
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/picks`);
      if (!res.ok) throw new Error("Server connection failed");
      const data = await res.json();
      setGames(data.picks || []);
    } catch (err) {
      console.error("❌ LockBox AI fetch error:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Convert American odds → implied probability
  const impliedProb = (odds) =>
    odds < 0 ? (-odds) / ((-odds) + 100) * 100 : 100 / (odds + 100) * 100;

  useEffect(() => {
    fetchAIGames();
  }, []);

  return (
    <div className="App">
      <h1>💎 LOCKBOX AI</h1>
      <p>AI-Driven NFL Game Analysis</p>

      {error && <p className="error">Could not connect to LockBox AI server.</p>}
      {loading && <p>Analyzing games...</p>}

      {!loading && !error && (
        <div className="ai-analysis">
          {games.length === 0 ? (
            <p>No upcoming NFL games found.</p>
          ) : (
            games.map((g, i) => {
              const home = g.home_team;
              const away = g.away_team;
              const ml = g.mlPick || {};
              const spread = g.spreadPick || {};
              const marketHomeProb = impliedProb(ml.homeML || 0).toFixed(1);
              const marketAwayProb = impliedProb(ml.awayML || 0).toFixed(1);
              const edge =
                ml.confidence -
                (ml.pick === home ? marketHomeProb : marketAwayProb);
              const advColor =
                edge > 10 ? "#00e6b0" : edge > 5 ? "#ffcc00" : "#ff4444";

              return (
                <div key={i} className="card glow">
                  <div
                    className="advantage-badge"
                    style={{ backgroundColor: advColor }}
                    onClick={() =>
                      setSelectedGame({
                        ...g,
                        edge: edge.toFixed(1),
                        marketHomeProb,
                        marketAwayProb,
                      })
                    }
                  >
                    ⚡ {edge.toFixed(1)}%
                  </div>

                  <h2>🏈 {g.matchup}</h2>
                  <p>📘 Book: {g.bookmaker}</p>

                  <div className="section">
                    <h3>💰 Moneyline Prediction</h3>
                    <div className="barContainer">
                      <div
                        className="bar"
                        style={{
                          width: `${ml.confidence}%`,
                          background: "#00e6b0",
                        }}
                      >
                        {ml.pick} ({ml.confidence}%)
                      </div>
                    </div>
                    <p className="edge">
                      Market: {away} {marketAwayProb}% vs {home} {marketHomeProb}%
                      <br />
                      Edge: <strong>{edge.toFixed(1)} pts</strong>
                    </p>
                  </div>

                  {spread && spread.pick && (
                    <div className="section">
                      <h3>📏 Spread Prediction</h3>
                      <div className="barContainer">
                        <div
                          className="bar"
                          style={{
                            width: `${spread.confidence}%`,
                            background: "#a020f0",
                          }}
                        >
                          {spread.pick} ({spread.confidence}%)
                        </div>
                      </div>
                      <p className="edge">
                        Edge over market:{" "}
                        <strong>{(spread.confidence - 50).toFixed(1)}%</strong>
                      </p>
                    </div>
                  )}

                  <button
                    className="analyze-btn"
                    onClick={() =>
                      setSelectedGame({
                        ...g,
                        edge: edge.toFixed(1),
                        marketHomeProb,
                        marketAwayProb,
                      })
                    }
                  >
                    🧠 Analyze Entire Game
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal */}
      {selectedGame && (
        <div className="modal-overlay" onClick={() => setSelectedGame(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>🧠 AI Breakdown</h2>
            <h3>{selectedGame.matchup}</h3>
            <p>
              <strong>Moneyline:</strong> {selectedGame.mlPick.pick} (
              {selectedGame.mlPick.confidence}%)
            </p>
            <p>
              <strong>Spread:</strong>{" "}
              {selectedGame.spreadPick?.pick || "N/A"} (
              {selectedGame.spreadPick?.confidence || 0}%)
            </p>
            <p>
              <strong>Market Probabilities:</strong>
              <br />
              Home: {selectedGame.marketHomeProb}% | Away:{" "}
              {selectedGame.marketAwayProb}%
            </p>
            <p>
              <strong>Model Edge:</strong> {selectedGame.edge} points
            </p>
            <p className="note">
              💡 AI uses probabilistic market modeling with
              <br /> line efficiency & momentum bias correction.
            </p>
            <button
              className="close-btn"
              onClick={() => setSelectedGame(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
