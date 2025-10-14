// src/Scores.js
import React, { useEffect, useState } from "react";
import { fetchScores } from "./api";

export default function Scores() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await fetchScores();
    setGames(Array.isArray(data?.games) ? data.games : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // refresh every 30 s
    return () => clearInterval(id);
  }, []);

  if (loading) return <p style={{ color: "#0ff" }}>Loading live scores…</p>;
  if (!games.length)
    return <p style={{ color: "#999" }}>No live or recent games.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", color: "#fff" }}>
      <h2 style={{ textAlign: "center", marginTop: 30 }}>
        🏈 Live & Recent NFL Scores
      </h2>

      {games.map((g) => {
        const isLive = !g.completed;
        return (
          <div
            key={g.id}
            style={{
              border: "1px solid #333",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "10px",
              background: isLive ? "#222831" : "#111",
            }}
          >
            <h3>
              {g.away_team} @ {g.home_team}{" "}
              <span style={{ color: isLive ? "#0f0" : "#aaa" }}>
                {isLive ? "• LIVE" : "FINAL"}
              </span>
            </h3>

            {(g.scores || []).length ? (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {g.scores.map((s) => (
                  <li key={s.name}>
                    {s.name}: {s.score ?? "-"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No scores yet.</p>
            )}

            {g.last_update && (
              <small>
                Updated {new Date(g.last_update).toLocaleTimeString()}
              </small>
            )}
          </div>
        );
      })}
    </div>
  );
}
