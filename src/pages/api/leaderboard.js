// pages/api/leaderboard.js
import { db } from "../../../firebaseAdmin";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const leaderboardRef = db.collection("leaderboard").orderBy("timestamp", "asc");
      const snapshot = await leaderboardRef.get();
      let leaderboardData = [];
      snapshot.forEach(doc => {
        let data = doc.data();
        // Convert Firestore Timestamp to ISO string if available
        if (data.timestamp && data.timestamp.toDate) {
          data.timestamp = data.timestamp.toDate().toISOString();
        }
        leaderboardData.push(data);
      });
      res.status(200).json(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Error fetching leaderboard" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
