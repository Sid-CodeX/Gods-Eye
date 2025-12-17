import express from "express";
import crypto from "crypto";
import { db } from "../config/db";

const router = express.Router();

router.post("/create", (_req, res) => {
  const caseId = crypto.randomUUID();
  const createdAt = Math.floor(Date.now() / 1000);

  db.run(
    "INSERT INTO cases (case_id, created_at) VALUES (?, ?)",
    [caseId, createdAt],
    (err) => {
      if (err) {
        // No detailed errors → avoid leaking internals
        return res.status(500).end();
      }

      // Return ONLY what the frontend needs
      res.json({ case_id: caseId });
    }
  );
});

export default router;
