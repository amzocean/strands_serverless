// src/pages/api/getAnswers.js
import { db } from "../../../firebaseAdmin";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const snapshot = await db
        .collection("gameSubmissions")
        .orderBy("timestamp", "asc")
        .get();
      let submissions = [];
      snapshot.forEach((doc) => {
        let data = doc.data();
        // Convert Firestore timestamp to ISO
        if (data.timestamp && data.timestamp.toDate) {
          data.timestamp = data.timestamp.toDate().toISOString();
        } else {
          data.timestamp = new Date().toISOString();
        }
        submissions.push(data);
      });
      res.status(200).json({ submissions });
    } catch (error) {
      console.error("Error retrieving submissions:", error);
      res.status(500).json({ error: "Error retrieving submissions" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
