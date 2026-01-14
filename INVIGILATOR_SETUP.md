# Invigilator/Investigator Setup Guide

This guide explains how to set up and use the invigilator access system for decrypting whistleblower reports.

## Prerequisites

1. Generate invigilator keypair
2. Configure environment variables
3. Update database schema (if needed)
4. Access the invigilator dashboard

## Step 1: Generate Invigilator Keypair

Run the key generation script:

```bash
cd frontend
npm run generate-keys
```

This will output:
- Public key (array and hex format)
- Private key (array and hex format) - **KEEP THIS SECRET!**

## Step 2: Update Constants

1. Copy the public key array to `frontend/src/crypto/constants.ts`:
   ```typescript
   export const INVIGILATOR_PUBLIC_KEY = new Uint8Array([...]);
   ```

2. The public key should be 32 bytes (256 bits) for X25519.

## Step 3: Configure Environment Variables

### Backend (.env)

Create `backend/.env`:
```env
PORT=3000
INVIGILATOR_TOKEN=your-secure-random-token-here
```

Generate a secure token:
```bash
openssl rand -hex 32
```

### Frontend (.env)

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_INVIGILATOR_TOKEN=your-secure-random-token-here
VITE_INVIGILATOR_PRIVATE_KEY=your-private-key-hex-here
```

**Important:** The `VITE_INVIGILATOR_PRIVATE_KEY` should be the hex-encoded private key (64 hex characters = 32 bytes).

## Step 4: Update Database Schema

If you have an existing database, run the migration:

```sql
-- Add ephemeral_public_key column
ALTER TABLE messages ADD COLUMN ephemeral_public_key TEXT;
```

Or recreate the database using the updated `backend/db/schema.sql`.

## Step 5: Access Invigilator Dashboard

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the invigilator dashboard:
   ```
   http://localhost:5173/inv?token=your-secure-random-token-here
   ```

   Or if the token is set in `.env`, just:
   ```
   http://localhost:5173/inv
   ```

## How It Works

### Encryption Flow (Whistleblower)

1. User creates a case and gets a case ID
2. User writes report and uploads files
3. Frontend generates ephemeral keypair
4. Frontend derives shared secret using:
   - Ephemeral private key
   - Invigilator's public key
5. Frontend encrypts report + files using shared secret
6. Frontend sends to backend:
   - Encrypted ciphertext
   - Nonce
   - Hash of report
   - **Ephemeral public key** (for decryption)
   - Case ID

### Decryption Flow (Invigilator)

1. Invigilator accesses dashboard with token
2. Dashboard lists all cases
3. Invigilator selects a case to view messages
4. For each encrypted message:
   - Dashboard retrieves ephemeral public key from database
   - Dashboard derives shared secret using:
     - Invigilator's private key
     - Ephemeral public key (from message)
   - Dashboard decrypts message using shared secret
   - Dashboard displays decrypted report and file list

## Security Notes

1. **Token Security**: The invigilator token should be:
   - Long and random (use `openssl rand -hex 32`)
   - Stored securely in environment variables
   - Never committed to version control

2. **Private Key Security**: 
   - The invigilator private key is extremely sensitive
   - Store it securely (environment variables, key management system)
   - Never expose it in client-side code in production
   - Consider using a backend key management service for production

3. **Access Control**:
   - The token is verified on every request
   - Invalid tokens return 401 Unauthorized
   - Consider adding rate limiting for production

4. **Database**:
   - Ephemeral public keys are stored in plaintext (this is safe - they're public)
   - Encrypted messages cannot be decrypted without the invigilator's private key
   - Even if the database is compromised, messages remain encrypted

## Troubleshooting

### "sodium.crypto_hash_sha256 is not a function"
- Fixed: Now using Web Crypto API for SHA-256 hashing

### "Decryption failed"
- Ensure the private key in `.env` matches the public key in `constants.ts`
- Verify the ephemeral public key is stored in the database
- Check that the keypair was generated correctly

### "Unauthorized: Invalid token"
- Verify `INVIGILATOR_TOKEN` in backend `.env` matches `VITE_INVIGILATOR_TOKEN` in frontend `.env`
- Check that the token is being sent in the request header

### Messages not decrypting
- Ensure the database has the `ephemeral_public_key` column
- Verify the key derivation is using the correct keys
- Check browser console for detailed error messages


