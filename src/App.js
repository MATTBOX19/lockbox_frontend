import React, { useEffect, useState, useMemo } from "react";
import "./App.css";

const API = process.env.REACT_APP_API_BASE_URL;

// === Helper functions ===
const fmtML = (v) => (typeof v === "number" ? (v > 0 ? `+${v}` : `${v}`) : "?");
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function App() {
  const [picks, setPicks] = useState([]);
  const [scores, setScores] = useState([]);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        const [picksRes, scoresRes, recordRes, propsRes] = await Promise.all([
          fetch(`${API}/api/picks`),
          fetch(`${API}/api/scores`),
          fetch(`${API}/api/record`),
          fetch(`${API}/api/props`),
        ]);
        const picksData = await picksRes.json();
        const scoresData = await scoresRes.json();
        const recordData = await recordRes.json();
        const propsData = await propsRes.json();

        setPicks(picksData.picks || []);
        setScores(Array.isArray(scoresData) ? scoresData : []);
        setRecord(recordData || {});
        setProps(propsData.props || []);
      } catch (e) {
        console.error("❌ Load error:", e);
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const scoreMap = useMemo(() => {
    const m = new Map();
    for (const g of scores) {
      const key1 = `${g.away_team} @ ${g.home_team}`;
      const key2 = `${g.home_team} vs ${g.away_team}`;
      m.set(key1, g);
      m.set(key2, g);
    }
    return m;
  }, [scores]);

  if (loading) return <div className="app"><h2 className="loading">Loading LockBox AI…</h2></div>;
  if (err) return <div className="app"><h2 style={{ color: "red" }}>⚠️ {err}</h2></div>;

  const total = (record.wins || 0) + (record.losses || 0);
  const streakBadge = total >= 5 ? "🔥 Hot" : total > 0 ? "🟢 Live" : "🆕 New";

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <h1 className="logo">💎 LOCKBOX AI</h1>
          <p className="subtitle">Win Smarter. Not Harder.</p>
        </div>
        <div className="stats">
          <span className="badge">{streakBadge}</span>
          <div className="record">
            🔥 Record:&nbsp;
            <strong>{record.wins}-{record.losses}</strong>&nbsp;
            ({record.winRate || 0}%)
          </div>
        </div>
      </header>

      {/* Game Picks */}
      <section className="section">
        <h2 className="section-title">🏈 AI Game Picks</h2>
        <div className="grid">
          {picks.map((p, i) => {
            const game = scoreMap.get(p.matchup);
            const conf = clamp(Number(p.confidence || 0), 0, 100);
            const scoreLine = game?.scores
              ? game.scores.map((s) => s.score ?? "—").join(" - ")
              : "—";
            const status = game?.completed
              ? "Final"
              : game?.scores
              ? "Live"
              : "Upcoming";

            return (
              <div key={i} className="card glow">
                <h3 className="matchup">{p.matchup}</h3>
                <div className="book">{p.bookmaker}</div>
                <div className="ai-row">
                  <span className="ai-label">AI Pick:</span>
                  <span className="ai-choice">{p.pick}</span>
                </div>
                <div className="info-row">
                  <span><b>Confidence:</b> {conf}%</span>
                  <span><b>Odds:</b> {fmtML(p.awayML)} / {fmtML(p.homeML)}</span>
                </div>
                <div className="meter"><div className="meter-fill" style={{ width: `${conf}%` }} /></div>
                <div className={`score ${status.toLowerCase()}`}>
                  <b>{status}:</b> {scoreLine}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Player Props */}
      <section className="section">
        <h2 className="section-title">🎯 AI Player Props</h2>
        <div className="grid props-grid">
          {props.length === 0 && <p>No player props available right now.</p>}
          {props.map((pp, i) => (
            <div key={i} className="card prop-card">
              <div className="prop-head">
                <div className="player">{pp.player}</div>
                <div className="market">{prettyMarket(pp.market)}</div>
              </div>
              <div className="prop-body">
                <div><b>Line:</b> {pp.line ?? "—"}</div>
                <div><b>Over:</b> {fmtML(pp.over)} | <b>Under:</b> {fmtML(pp.under)}</div>
                <div className="match-mini">{pp.matchup}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.reload(); }}>🔒 Logout</button>
        <p className="footnote">⚡ Powered by LockBox AI — Live Odds & Results</p>
      </footer>
    </div>
  );
}

function prettyMarket(key) {
  switch (key) {
    case "player_pass_tds": return "Passing TDs";
    case "player_pass_yards": return "Passing Yards";
    case "player_rush_yds": return "Rushing Yards";
    case "player_rec_yds": return "Receiving Yards";
    case "player_receptions": return "Receptions";
    default: return key;
  }
}
