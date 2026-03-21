import express from "express";
import { db } from "../config/db";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify first factor (secret token)
const verifyFirstFactor = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// Middleware to verify 2FA Session (JWT)
const verify2FASession = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: Missing session token" });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing session token" });
  }

  try {
    const jwtSecret = process.env.INVIGILATOR_API_TOKEN || "secret";
    jwt.verify(token, jwtSecret as string);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid session token" });
  }
};

// --- Rate Limiter for OTP ---
const otpAttempts: Record<string, { count: number, resetAt: number }> = {};

// --- 2FA Endpoints ---

router.get("/2fa/status", verifyFirstFactor, (req, res) => {
  db.get("SELECT is_2fa_setup_complete FROM admin_settings WHERE id = 1", [], (err, row: any) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ isSetupComplete: row?.is_2fa_setup_complete === 1 });
  });
});

router.post("/2fa/setup", verifyFirstFactor, (req, res) => {
  db.get("SELECT totp_secret, is_2fa_setup_complete FROM admin_settings WHERE id = 1", [], async (err, row: any) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (row?.is_2fa_setup_complete === 1) {
      return res.status(400).json({ error: "2FA is already set up" });
    }

    // Reuse existing unverified secret to handle repeated network calls from React strict-mode
    if (row && row.totp_secret && row.is_2fa_setup_complete === 0) {
      try {
        const otpauth_url = speakeasy.otpauthURL({ secret: row.totp_secret, label: encodeURIComponent("Gods-Eye Invigilator"), encoding: "base32" });
        const qrCode = await qrcode.toDataURL(otpauth_url);
        return res.json({ qrCode });
      } catch (err) {
        return res.status(500).json({ error: "Failed to generate QR code for existing secret" });
      }
    }

    // Generate new secret if missing
    const secret = speakeasy.generateSecret({ name: "Gods-Eye Invigilator" });
    const otpauth_url = secret.otpauth_url;
    if (!otpauth_url) return res.status(500).json({ error: "Failed to generate OTP URL" });

    try {
      const qrCode = await qrcode.toDataURL(otpauth_url);

      db.run(
        `INSERT INTO admin_settings (id, totp_secret, is_2fa_setup_complete) 
         VALUES (1, ?, 0) 
         ON CONFLICT(id) DO UPDATE SET totp_secret=excluded.totp_secret, is_2fa_setup_complete=0`,
        [secret.base32],
        (err) => {
          if (err) return res.status(500).json({ error: "Failed to save secret" });
          res.json({ qrCode });
        }
      );
    } catch (err) {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });
});

router.post("/2fa/verify", verifyFirstFactor, (req, res) => {
  const ipId = req.ip || "unknown";
  const now = Date.now();

  if (otpAttempts[ipId] && otpAttempts[ipId].resetAt > now) {
    if (otpAttempts[ipId].count >= 5) {
      return res.status(429).json({ error: "Too many attempts. Try again in 5 minutes." });
    }
  } else {
    otpAttempts[ipId] = { count: 0, resetAt: now + 5 * 60 * 1000 };
  }

  const { otp } = req.body;

  if (!otp) {
    otpAttempts[ipId].count++;
    return res.status(400).json({ error: "OTP is required" });
  }

  db.get("SELECT totp_secret, is_2fa_setup_complete FROM admin_settings WHERE id = 1", [], (err, row: any) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row || !row.totp_secret) return res.status(400).json({ error: "2FA not set up" });

    const isValid = speakeasy.totp.verify({
      secret: row.totp_secret,
      encoding: 'base32',
      token: String(otp).replace(/\D/g, ''),
      window: 5
    });

    // Debugging details to track if we're hitting clock desync
    const expectedToken = speakeasy.totp({ secret: row.totp_secret, encoding: 'base32' });
    console.log(`[2FA Debug] Attempted OTP: ${otp}, Current Server Time matches Server Generated OTP: ${expectedToken}. Valid? ${isValid}`);

    if (isValid) {
      if (row.is_2fa_setup_complete === 0) {
        db.run("UPDATE admin_settings SET is_2fa_setup_complete = 1 WHERE id = 1");
      }
      delete otpAttempts[ipId];
      const sessionToken = jwt.sign({ admin: true }, (process.env.INVIGILATOR_API_TOKEN as string) || "secret", { expiresIn: '1h' });
      res.json({ success: true, token: sessionToken });
    } else {
      if (otpAttempts[ipId]) {
        otpAttempts[ipId].count++;
      }
      res.status(401).json({ error: "Invalid OTP" });
    }
  });
});

// --- Protected Endpoints ---

// Get all cases
router.get("/cases", verify2FASession, (_req, res) => {
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
router.get("/cases/:case_id/messages", verify2FASession, (req, res) => {
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
router.get("/cases/:case_id", verify2FASession, (req, res) => {
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
router.delete("/cases/:case_id", verify2FASession, (req, res) => {
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
router.post("/cases/:case_id/replies", verify2FASession, (req, res) => {
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
