// src/pages/api/resetSubmissions.js
import { db } from "../../../firebaseAdmin";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const submissionsRef = db.collection("gameSubmissions");
      const snapshot = await submissionsRef.get();

      if (snapshot.empty) {
        return res.status(200).json({ success: true, message: "No submissions to delete." });
      }

      // Batch delete all documents (assuming less than 500 documents)
      let batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return res.status(200).json({ success: true, message: "Submissions reset." });
    } catch (error) {
      console.error("Error resetting submissions:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
}
