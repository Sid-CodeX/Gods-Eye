-- God’s Eye Database Schema

CREATE TABLE cases (
  case_id TEXT PRIMARY KEY,
  wb_static_public TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT NOT NULL,
  ciphertext BLOB NOT NULL,
  nonce TEXT NOT NULL,
  hash TEXT NOT NULL,
  ephemeral_public_key TEXT NOT NULL,
  seq INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(case_id)
);

-- Preserve message order per case
CREATE INDEX idx_messages_case_seq
ON messages (case_id, seq);
