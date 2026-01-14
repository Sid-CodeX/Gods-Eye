# Quick Start: Invigilator Access

## 🚀 Quick Setup (5 minutes)

### 1. Generate Keys
```bash
cd frontend
npm run generate-keys
```

Copy the output:
- **Public Key Array** → `frontend/src/crypto/constants.ts`
- **Private Key Hex** → `frontend/.env` (as `VITE_INVIGILATOR_PRIVATE_KEY`)

### 2. Set Environment Variables

**`frontend/.env`**:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_INVIGILATOR_TOKEN=your-token-here
VITE_INVIGILATOR_PRIVATE_KEY=your-64-hex-characters-here
VITE_INVIGILATOR_SECRET=your-secret-key-here
```

**`backend/.env`**:
```env
PORT=3000
INVIGILATOR_TOKEN=your-token-here
```

### 3. Generate Secure Tokens
```bash
# Generate token
openssl rand -hex 32

# Generate secret
openssl rand -hex 32
```

### 4. Update Database
```sql
ALTER TABLE messages ADD COLUMN ephemeral_public_key TEXT;
```

### 5. Access Dashboard
```
http://localhost:5173/inv?secret=YOUR_SECRET_KEY
```

## 📝 How It Works

1. **Whistleblower submits**:
   - Generates ephemeral keypair
   - Derives shared secret with your public key
   - Encrypts report
   - Sends: ciphertext + nonce + **ephemeral public key**

2. **You decrypt**:
   - Retrieve ephemeral public key from database
   - Derive same shared secret using your private key
   - Decrypt message
   - View report

## 🔑 Key Files

- **Public Key**: `frontend/src/crypto/constants.ts`
- **Private Key**: `frontend/.env` (VITE_INVIGILATOR_PRIVATE_KEY)
- **Secret**: `frontend/.env` (VITE_INVIGILATOR_SECRET)
- **Token**: Both `.env` files (must match)

## ✅ Test It

1. Submit a test report as whistleblower
2. Access `/inv?secret=YOUR_SECRET`
3. Select the case
4. Click "Decrypt" on the message
5. View decrypted report!


