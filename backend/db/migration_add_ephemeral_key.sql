-- Migration: Add ephemeral_public_key column to messages table
-- Run this if your database already exists and needs the ephemeral_public_key field

-- Add ephemeral_public_key column (TEXT to store base64-encoded ephemeral public key)
ALTER TABLE messages ADD COLUMN ephemeral_public_key TEXT;

-- For existing rows without ephemeral_public_key, these cannot be decrypted
-- You may want to handle this differently in production
UPDATE messages SET ephemeral_public_key = '' WHERE ephemeral_public_key IS NULL;


