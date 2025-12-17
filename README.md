# GodsEye - Anonymous Whistleblowing Platform

A secure, anonymous whistleblowing web application frontend built with React, TypeScript, and Tailwind CSS.

Privacy-preserving, Tor-based anonymous submission and two-way communication system with end-to-end encrypted storage.

## ⚠️ Security Notice

**This is a frontend scaffold only.** All cryptographic functions are placeholders. Do not use this in production until proper client-side encryption is implemented using vetted libraries (e.g., libsodium-wrappers).

## Prerequisites

- **Node.js** 18+ and **npm** (or **yarn** / **pnpm**)
- A modern web browser

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - The dev server will display a local URL (typically `http://localhost:5173`)
   - Open that URL in your browser

## Available Scripts

- `npm run dev` - Start the Vite development server with hot reload
- `npm run build` - Build the project for production (outputs to `dist/`)
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── cases/          # Case list components
│   ├── layout/         # Layout components (Panel, etc.)
│   ├── messaging/      # Message thread and reply components
│   └── submission/     # Submission form components
├── crypto/             # Cryptographic function placeholders
│   ├── keys.ts         # Ephemeral key generation
│   ├── encrypt.ts      # Message/file encryption
│   ├── decrypt.ts      # Message/file decryption
│   ├── hash.ts         # SHA-256 hashing
│   └── metadata.ts     # Metadata stripping
├── pages/              # Page components
│   ├── AppLayout.tsx   # Main app layout with navigation
│   ├── SubmissionPage.tsx      # Whistleblower submission page
│   └── CaseDashboardPage.tsx   # Investigator case dashboard
├── security/           # Security documentation
│   ├── constraints.ts  # Security assumptions
│   ├── threatModel.md  # Threat model documentation
│   └── README.md       # Security layer overview
└── types.d.ts          # TypeScript type definitions
```

## Routes

- `/` - Home page (landing page)
- `/submit` - Whistleblower submission page
- `/cases` - Case dashboard (investigator view)

## Security Constraints

This project adheres to strict security principles:

- ✅ **No authentication** - No login, signup, or cookies
- ✅ **No tracking** - No analytics, third-party SDKs, or fingerprinting
- ✅ **No external CDNs** - All assets are self-hosted
- ✅ **Client-side encryption** - All crypto happens in the browser (when implemented)
- ✅ **Untrusted backend** - Frontend assumes backend is untrusted storage only

## Development Notes

- All cryptographic functions in `src/crypto/` are **placeholders** with TODO comments
- The UI is fully functional but **no data is actually encrypted or transmitted**
- Dummy data is used for the case dashboard
- System fonts only (no external font loading)

## Next Steps

Before production use:

1. Implement real cryptographic functions using `libsodium-wrappers`
2. Add proper error handling and user feedback
3. Implement actual backend API integration
4. Add comprehensive testing
5. Security audit of all crypto implementations

## License

This project is for educational/development purposes only.
