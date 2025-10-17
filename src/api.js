// src/api.js
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  "https://lockbox-backend-vcai.onrender.com";

export async function fetchScores() {
  try {
    const res = await fetch(`${API_BASE}/api/scores`);
    return await res.json(); // { totalGames, liveGames, games: [] }
  } catch (err) {
    console.error("âŒ Failed to fetch scores:", err);
    return { games: [], error: err.message };
  }
}

