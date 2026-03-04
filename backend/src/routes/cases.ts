import express from "express";
import crypto from "crypto";
import { db } from "../config/db";

const router = express.Router();

router.post("/create", (req, res) => {
  const { wb_static_public } = req.body;
  if (!wb_static_public) {
    return res.status(400).json({ error: "Missing wb_static_public" });
  }

  const caseId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 60 * 60 * 24 * 30; // 30 days

  db.run(
    "INSERT INTO cases (case_id, wb_static_public, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [caseId, wb_static_public, now, expiresAt],
    (err) => {
      if (err) {
        console.error("Database error creating case:", err);
        return res.status(500).json({ error: "Failed to create case" });
      }
      res.json({ case_id: caseId });
    }
  );
});

router.get("/list", (_req, res) => {
  db.all(
    "SELECT case_id, created_at FROM cases ORDER BY created_at DESC",
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


export default router;
