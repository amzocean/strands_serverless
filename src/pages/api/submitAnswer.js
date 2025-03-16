// src/pages/api/submitAnswer.js
import { db, admin } from "../../../firebaseAdmin";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, answer } = req.body;

    // Require a nonempty name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }
    // Validate answer
    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return res.status(400).json({ error: "Answer is required" });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 20) {
      return res.status(400).json({ error: "Name too long" });
    }

    try {
      // Add submission to "gameSubmissions" collection
      await db.collection("gameSubmissions").add({
        name: trimmedName,
        answer: answer.trim(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Retrieve updated submissions, ordered by timestamp
      const snapshot = await db
        .collection("gameSubmissions")
        .orderBy("timestamp", "asc")
        .get();
      let submissions = [];
      snapshot.forEach((doc) => {
        let data = doc.data();
        if (data.timestamp && data.timestamp.toDate) {
          data.timestamp = data.timestamp.toDate().toISOString();
        } else {
          data.timestamp = new Date().toISOString();
        }
        submissions.push(data);
      });

      // Send updated list back
      res.status(200).json({ success: true, submissions });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ error: "Error submitting answer" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
