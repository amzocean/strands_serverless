// src/pages/api/submit-score.js
import { db, admin } from "../../../firebaseAdmin";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, score } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 20) {
      return res.status(400).json({ error: "Invalid name" });
    }
    try {
      // Check current leaderboard count
      const snapshot = await db.collection("leaderboard").get();
      if (snapshot.size >= 500) {
        return res.status(400).json({ error: "Leaderboard is full" });
      }
      // Add new entry
      await db.collection("leaderboard").add({
        name: name.trim(),
        score: score || "",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      // Fetch updated leaderboard
      const updatedSnapshot = await db.collection("leaderboard")
        .orderBy("timestamp", "asc").get();
      let leaderboardData = [];
      updatedSnapshot.forEach(doc => {
        let data = doc.data();
        if (data.timestamp && data.timestamp.toDate) {
          data.timestamp = data.timestamp.toDate().toISOString();
        } else {
          data.timestamp = new Date().toISOString();
        }
        leaderboardData.push(data);
      });
      res.status(200).json({ success: true, leaderboard: leaderboardData });
    } catch (error) {
      console.error("Error submitting score:", error);
      res.status(500).json({ error: "Error submitting score" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
