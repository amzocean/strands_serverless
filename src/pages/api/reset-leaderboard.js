// pages/api/reset-leaderboard.js
import { db } from "../../../firebaseAdmin";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const leaderboardRef = db.collection("leaderboard");
      const snapshot = await leaderboardRef.get();
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      res.status(200).json({ success: true, message: "Leaderboard has been reset." });
    } catch (error) {
      console.error("Error resetting leaderboard:", error);
      res.status(500).json({ error: "Error resetting leaderboard" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
