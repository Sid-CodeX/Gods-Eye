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
    `SELECT case_id, created_at, expires_at 
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
    `SELECT id, ciphertext, nonce, hash, ephemeral_public_key, seq, created_at
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
    `SELECT case_id, created_at, expires_at 
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

export default router;

