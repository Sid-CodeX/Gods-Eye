# Invigilator Access and Decryption Guide

This guide explains how the encryption/decryption process works and how to access the invigilator dashboard.

## 🔐 Encryption/Decryption Flow

### Step 1: Whistleblower Submits Report

1. **User creates a case** → Gets a unique case ID
2. **User writes report + uploads files** → Combined into JSON payload
3. **Frontend generates ephemeral keypair**:
   ```typescript
   keyPair = generateEphemeralKeyPair()  // X25519 keypair
   ```
   - `ephemeralPrivateKey` (stays in browser, never sent)
   - `ephemeralPublicKey` (sent to backend with message)

4. **Derive shared secret**:
   ```typescript
   sharedSecret = deriveSharedSecret(ephemeralPrivateKey, INVIGILATOR_PUBLIC_KEY)
   ```
   - Uses X25519 key exchange
   - Combines: `ephemeralPrivateKey` + `INVIGILATOR_PUBLIC_KEY`
   - Result: 32-byte shared secret

5. **Derive encryption key from shared secret**:
   ```typescript
   encryptionKey = deriveEncryptionKey(sharedSecret)
   ```
   - Uses KDF (Key Derivation Function) with domain separation
   - Context: `"gods-eye-secretbox-v1"`
   - Uses `crypto_generichash` to derive 32-byte key

6. **Encrypt payload**:
   ```typescript
   encryptedPayload = encryptReport(payloadBytes, encryptionKey, { associatedData: reportHash })
   ```
   - Uses libsodium `crypto_secretbox_easy` (XSalsa20-Poly1305)
   - Generates random nonce
   - Returns: `{ ciphertext, nonce }`

7. **Send to backend**:
   - `case_id`
   - `ciphertext` (base64)
   - `nonce` (base64)
   - `hash` (base64, SHA-256 of report)
   - `ephemeral_public_key` (base64) ← **Critical for decryption**
   - `seq` (sequence number)

### Step 2: Invigilator Decrypts Report

1. **Access dashboard** with secret key:
   ```
   http://localhost:5173/inv?secret=YOUR_SECRET_KEY
   ```

2. **Select a case** → Loads all messages for that case

3. **Click "Decrypt" on a message**:

   a. **Retrieve ephemeral public key** from database
   
   b. **Derive shared secret**:
      ```typescript
      sharedSecret = deriveSharedSecret(INVIGILATOR_PRIVATE_KEY, ephemeralPublicKey)
      ```
      - Uses X25519 key exchange
      - Combines: `INVIGILATOR_PRIVATE_KEY` + `ephemeralPublicKey`
      - **This produces the SAME shared secret** as step 4 above!
      - X25519 is commutative: `ECDH(privA, pubB) = ECDH(privB, pubA)`

   c. **Derive encryption key**:
      ```typescript
      encryptionKey = deriveEncryptionKey(sharedSecret)
      ```
      - Uses the **same KDF** as encryption
      - Same context: `"gods-eye-secretbox-v1"`
      - **This produces the SAME encryption key** as step 5 above!

   d. **Decrypt**:
      ```typescript
      plaintext = decryptReport({ ciphertext, nonce }, encryptionKey)
      ```
      - Uses libsodium `crypto_secretbox_open_easy`
      - Verifies authentication tag (Poly1305)
      - Returns decrypted payload

   e. **Parse and display**:
      ```typescript
      decrypted = JSON.parse(plaintext)
      // Shows: { report: "...", files: [...] }
      ```

## 🔑 Key Management

### Invigilator Keys

The invigilator has a **long-term keypair**:

1. **Public Key** (`INVIGILATOR_PUBLIC_KEY`):
   - Stored in: `frontend/src/crypto/constants.ts`
   - **Public** - can be in source code
   - Used by whistleblowers to encrypt

2. **Private Key** (`VITE_INVIGILATOR_PRIVATE_KEY`):
   - Stored in: `frontend/.env` (as hex string)
   - **SECRET** - never commit to git!
   - Used by invigilator to decrypt
   - Format: 64 hex characters (32 bytes)

### Ephemeral Keys

Each whistleblower submission generates a **new ephemeral keypair**:

- **Ephemeral Private Key**: Never leaves the browser, discarded after encryption
- **Ephemeral Public Key**: Stored in database with the message
- Purpose: Provides forward secrecy (each message uses different keys)

## 🚪 Access Control

### Frontend Secret Key

The invigilator page is protected by a **secret key** in the URL:

1. **Set in `.env`**:
   ```env
   VITE_INVIGILATOR_SECRET=your-super-secret-key-here
   ```

2. **Access URL**:
   ```
   http://localhost:5173/inv?secret=your-super-secret-key-here
   ```

3. **If secret doesn't match**: Page shows "Access Denied"

### Backend Token

API calls require a **token** in the header:

1. **Set in backend `.env`**:
   ```env
   INVIGILATOR_TOKEN=your-api-token-here
   ```

2. **Set in frontend `.env`**:
   ```env
   VITE_INVIGILATOR_TOKEN=your-api-token-here
   ```

3. **Sent in request header**:
   ```typescript
   headers: {
     'X-Invigilator-Token': token
   }
   ```

## 📋 Setup Checklist

### 1. Generate Invigilator Keypair

```bash
cd frontend
npm run generate-keys
```

Output:
- Public key array → Copy to `constants.ts`
- Private key hex → Copy to `.env`

### 2. Configure Environment Variables

**Backend `.env`**:
```env
PORT=3000
INVIGILATOR_TOKEN=generate-with-openssl-rand-hex-32
```

**Frontend `.env`**:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_INVIGILATOR_TOKEN=same-as-backend-token
VITE_INVIGILATOR_PRIVATE_KEY=64-hex-characters-from-key-generation
VITE_INVIGILATOR_SECRET=your-secret-key-for-url-access
```

### 3. Update Database Schema

If database exists, add columns:
```sql
ALTER TABLE messages ADD COLUMN ephemeral_public_key TEXT;
```

Or recreate using `backend/db/schema.sql`.

### 4. Access Dashboard

```
http://localhost:5173/inv?secret=VITE_INVIGILATOR_SECRET
```

## 🔍 How Keys Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                    ENCRYPTION (Whistleblower)                │
├─────────────────────────────────────────────────────────────┤
│ 1. Generate ephemeral keypair                                │
│    ephemeralPrivateKey (secret, stays in browser)           │
│    ephemeralPublicKey (sent to server)                       │
│                                                              │
│ 2. Derive shared secret                                      │
│    sharedSecret = ECDH(ephemeralPrivateKey, INVIGILATOR_PUBLIC_KEY) │
│                                                              │
│ 3. Derive encryption key                                     │
│    encryptionKey = KDF(sharedSecret, "gods-eye-secretbox-v1") │
│                                                              │
│ 4. Encrypt payload                                            │
│    encrypted = secretbox(payload, encryptionKey, nonce)      │
│                                                              │
│ 5. Send to server:                                           │
│    - ciphertext                                              │
│    - nonce                                                   │
│    - ephemeralPublicKey ← CRITICAL                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DECRYPTION (Invigilator)                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Retrieve from database:                                  │
│    - ciphertext                                              │
│    - nonce                                                   │
│    - ephemeralPublicKey ← Retrieved from DB                 │
│                                                              │
│ 2. Derive shared secret (SAME as encryption!)              │
│    sharedSecret = ECDH(INVIGILATOR_PRIVATE_KEY, ephemeralPublicKey) │
│    ↑ This produces the SAME shared secret!                   │
│                                                              │
│ 3. Derive encryption key (SAME as encryption!)              │
│    encryptionKey = KDF(sharedSecret, "gods-eye-secretbox-v1") │
│    ↑ This produces the SAME encryption key!                │
│                                                              │
│ 4. Decrypt                                                   │
│    payload = secretbox_open(ciphertext, nonce, encryptionKey) │
│                                                              │
│ 5. Display decrypted report                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Security Properties

1. **Forward Secrecy**: Each message uses a new ephemeral keypair
2. **End-to-End Encryption**: Server never sees plaintext
3. **Authenticated Encryption**: Poly1305 MAC prevents tampering
4. **Key Derivation**: KDF ensures proper key material
5. **Access Control**: Secret key + token protect dashboard

## ⚠️ Important Notes

1. **Private Key Security**:
   - Never commit `VITE_INVIGILATOR_PRIVATE_KEY` to git
   - Store securely (env vars, key management system)
   - If compromised, regenerate keypair and update constants

2. **Secret Key Security**:
   - `VITE_INVIGILATOR_SECRET` should be long and random
   - Use: `openssl rand -hex 32`
   - Don't share the URL with the secret

3. **Token Security**:
   - `INVIGILATOR_TOKEN` should be long and random
   - Use: `openssl rand -hex 32`
   - Must match between frontend and backend

4. **Database Security**:
   - Ephemeral public keys are safe to store (they're public)
   - Encrypted messages cannot be decrypted without private key
   - Even if DB is compromised, messages remain encrypted


