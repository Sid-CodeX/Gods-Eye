-- God’s Eye Database Schema

CREATE TABLE cases (
  case_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT NOT NULL,
  ciphertext BLOB NOT NULL,
  hash TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  seq INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(case_id)
);

-- Preserve message order per case
CREATE INDEX idx_messages_case_seq
ON messages (case_id, seq);
