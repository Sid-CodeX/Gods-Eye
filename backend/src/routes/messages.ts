import express from "express";
import { db } from "../config/db";

const router = express.Router();

// Send message
router.post("/send", (req, res) => {
  const { case_id, ciphertext, hash, sender_role, seq } = req.body;
  const createdAt = Math.floor(Date.now() / 1000);

  db.run(
    "INSERT INTO messages (case_id, ciphertext, hash, sender_role, seq, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [case_id, ciphertext, hash, sender_role, seq, createdAt],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true });
    }
  );
});

// List messages for a case
router.get("/list/:case_id", (req, res) => {
  const { case_id } = req.params;

  db.all(
    "SELECT * FROM messages WHERE case_id = ? ORDER BY seq ASC",
    [case_id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    }
  );
});

export default router;
