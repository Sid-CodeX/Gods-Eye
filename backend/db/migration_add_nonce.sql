-- Migration: Add nonce column to messages table
-- Run this if your database already exists and needs the nonce field

-- Add nonce column (TEXT to store base64-encoded nonce)
ALTER TABLE messages ADD COLUMN nonce TEXT;

-- For existing rows without nonce, set a placeholder (these won't be decryptable)
-- In production, you might want to handle this differently
UPDATE messages SET nonce = '' WHERE nonce IS NULL;

-- Make nonce NOT NULL after updating existing rows
-- Note: SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- This is a destructive operation - backup your data first!

-- If you need to make it NOT NULL, use this approach:
-- 1. Create new table with nonce NOT NULL
-- 2. Copy data from old table
-- 3. Drop old table
-- 4. Rename new table

-- For now, we'll allow NULL for existing databases and handle it in the application


