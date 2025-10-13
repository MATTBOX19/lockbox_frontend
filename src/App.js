import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_BASE_URL;

export default function App() {
  const [picks, setPicks] = useState([]);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        console.log("[LockBox] Fetching from:", API);
        const [picksRes, recordRes, scoresRes] = await Promise.all([
          fetch(`${API}/api/picks`),
          fetch(`${API}/api/record`),
          fetch(`${API}/api/scores`),
        ]);

        if (!picksRes.ok) throw new Error("Failed to load picks");
        if (!recordRes.ok) throw new Error("Failed to load record");
        if (!scoresRes.ok) throw new Error("Failed to load scores");

        const picksData = await picksRes.json();
        const recordData = await recordRes.json();
        const scoresData = await scoresRes.json();

        console.log("[LockBox] Picks response:", picksData);
        console.log("[LockBox] Record response:", recordData);
        console.log("[LockBox] Scores response:", scoresData);

        setPicks(picksData.picks || []);
        setRecord(recordData);
        setScores(scoresData || {});
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
        <h2 style={{ textAlign: "center", color: "#00f3c3" }}>
          Loading AI Picks...
        </h2>
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
        <div className="record">
          🔥 Record: {record.wins}-{record.losses} ({record.winRate}%)
        </div>
      </div>

      <div className="content">
        {picks.length === 0 ? (
          <p className="loading">Loading AI Picks...</p>
        ) : (
          picks.map((p, i) => {
            const score =
              scores[p.matchup] ||
              scores[`${p.teamA} vs ${p.teamB}`] ||
              scores[`${p.teamB} vs ${p.teamA}`];

            return (
              <div key={i} className="card glow">
                <h3>{p.matchup}</h3>
                <p>
                  <b>AI Pick:</b>{" "}
                  <span className="highlight">{p.pick}</span>
                </p>
                <p>
                  <b>Confidence:</b> {p.confidence}%
                </p>
                <p className="odds">
                  <b>Odds:</b>{" "}
                  {p.odds?.awayML
                    ? `${p.odds.awayML > 0 ? "+" : ""}${p.odds.awayML}`
                    : "?"}{" "}
                  /{" "}
                  {p.odds?.homeML
                    ? `${p.odds.homeML > 0 ? "+" : ""}${p.odds.homeML}`
                    : "?"}
                </p>

                {score ? (
                  <p className="score">
                    <b>Score:</b> {score.scoreA} - {score.scoreB}{" "}
                    <span className="status">({score.status})</span>
                  </p>
                ) : (
                  <p className="no-score">No live score available</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <button
        className="logout-btn"
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
