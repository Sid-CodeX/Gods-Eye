import express from "express";
import { db } from "../config/db";

const router = express.Router();

// -----------------------------
// Send encrypted message
// -----------------------------
router.post("/send", (req, res) => {
  const { case_id, ciphertext, nonce, hash, ephemeral_public_key, seq } = req.body;
  const createdAt = Math.floor(Date.now() / 1000);

  if (!case_id || !ciphertext || !nonce || !hash || !ephemeral_public_key || typeof seq !== "number") {
    return res.status(400).json({ error: "Missing required fields: case_id, ciphertext, nonce, hash, ephemeral_public_key, seq" });
  }

  const MAX_SIZE = 1024 * 1024; // 1MB
  if (ciphertext.length > MAX_SIZE) {
    return res.status(413).json({ error: "Message too large" });
  }

  db.get(
    "SELECT expires_at FROM cases WHERE case_id = ?",
    [case_id],
    (err, row: { expires_at: number | null } | undefined) => {
      if (err || !row) {
        return res.status(404).json({ error: "Case not found" });
      }

      const now = Math.floor(Date.now() / 1000);
      if (row.expires_at && row.expires_at < now) {
        return res.status(410).json({ error: "Case has expired" });
      }

      db.run(
        `INSERT INTO messages
         (case_id, ciphertext, nonce, hash, ephemeral_public_key, seq, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [case_id, ciphertext, nonce, hash, ephemeral_public_key, seq, createdAt],
        (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to save message" });
          }
          res.json({ success: true });
        }
      );
    }
  );
});

// -----------------------------
// List messages for a case
// WARNING: Investigator-side only.
// Must never be exposed to public / whistleblower UI.
// -----------------------------
router.get("/list/:case_id", (req, res) => {
  const { case_id } = req.params;

  db.all(
    `SELECT ciphertext, nonce, hash, ephemeral_public_key, seq, created_at
     FROM messages
     WHERE case_id = ?
     ORDER BY seq ASC`,
    [case_id],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to fetch messages" });
      }
      res.json(rows || []);
    }
  );
});

export default router;
