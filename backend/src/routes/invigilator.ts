import express from "express";
import { db } from "../config/db";

const router = express.Router();

// Middleware to verify invigilator token
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['x-invigilator-token'] || req.query.token;
  const expectedToken = process.env.INVIGILATOR_API_TOKEN;


  if (!expectedToken) {
    console.error("INVIGILATOR_TOKEN not set in environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!token || token !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  next();
};

// Get all cases
router.get("/cases", verifyToken, (_req, res) => {
  db.all(
    `SELECT case_id, wb_static_public, created_at, expires_at 
     FROM cases 
     ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Database error listing cases:", err);
        return res.status(500).json({ error: "Failed to list cases" });
      }
      res.json(rows || []);
    }
  );
});

// Get messages for a specific case
router.get("/cases/:case_id/messages", verifyToken, (req, res) => {
  const { case_id } = req.params;

  db.all(
    `SELECT id, ciphertext_receiver AS ciphertext, nonce_receiver AS nonce, hash, ephemeral_public_key, seq, created_at
     FROM messages
     WHERE case_id = ?
     ORDER BY seq ASC`,
    [case_id],
    (err, rows) => {
      if (err) {
        console.error("Database error fetching messages:", err);
        return res.status(500).json({ error: "Failed to fetch messages" });
      }
      res.json(rows || []);
    }
  );
});

// Get case details
router.get("/cases/:case_id", verifyToken, (req, res) => {
  const { case_id } = req.params;

  db.get(
    `SELECT case_id, wb_static_public, created_at, expires_at 
     FROM cases 
     WHERE case_id = ?`,
    [case_id],
    (err, row) => {
      if (err) {
        console.error("Database error fetching case:", err);
        return res.status(500).json({ error: "Failed to fetch case" });
      }
      if (!row) {
        return res.status(404).json({ error: "Case not found" });
      }
      res.json(row);
    }
  );
});

// Delete a case and its associated messages
router.delete("/cases/:case_id", verifyToken, (req, res) => {
  const { case_id } = req.params;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Delete investigator replies for this case (if table exists)
    db.run(
      `DELETE FROM invigilator_messages WHERE case_id = ?`,
      [case_id],
      (err) => {
        if (err) {
          console.error("Database error deleting invigilator messages:", err);
        }
      }
    );

    // Delete encrypted whistleblower messages for this case
    db.run(
      `DELETE FROM messages WHERE case_id = ?`,
      [case_id],
      (err) => {
        if (err) {
          console.error("Database error deleting case messages:", err);
        }
      }
    );

    // Finally delete the case itself
    db.run(
      `DELETE FROM cases WHERE case_id = ?`,
      [case_id],
      function (err) {
        if (err) {
          console.error("Database error deleting case:", err);
          db.run("ROLLBACK");
          return res.status(500).json({ error: "Failed to delete case" });
        }

        if (this.changes === 0) {
          db.run("ROLLBACK");
          return res.status(404).json({ error: "Case not found" });
        }

        db.run("COMMIT");
        return res.json({ success: true });
      }
    );
  });
});

// Create an investigator reply for a case
router.post("/cases/:case_id/replies", verifyToken, (req, res) => {
  const { case_id } = req.params;
  const { body } = req.body;

  if (!body || typeof body !== "string" || !body.trim()) {
    return res.status(400).json({ error: "Reply body is required" });
  }

  const createdAt = Math.floor(Date.now() / 1000);

  db.run(
    `INSERT INTO invigilator_messages (case_id, body, created_at)
     VALUES (?, ?, ?)`,
    [case_id, body.trim(), createdAt],
    function (err) {
      if (err) {
        console.error("Database error creating reply:", err);
        return res.status(500).json({ error: "Failed to create reply" });
      }

      return res.status(201).json({
        id: this.lastID,
        case_id,
        body: body.trim(),
        created_at: createdAt,
      });
    }
  );
});

export default router;

