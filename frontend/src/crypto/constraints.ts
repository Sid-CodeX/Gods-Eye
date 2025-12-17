// Central place to document high-level security assumptions for the client.
// These are imported by UI code to avoid accidental violations.

export const SECURITY_CONSTRAINTS = {
  // Backend must be treated as untrusted, append-only storage.
  backendIsUntrusted: true,
  // All cryptography must be performed in the browser using vetted libraries (e.g. libsodium).
  clientSideCryptoOnly: true,
  // No user accounts, cookies, localStorage, or other persistent identifiers.
  noIdentityOrTracking: true,
  // Cryptographic keys must be ephemeral and never stored globally or reused across sessions.
  ephemeralKeysOnly: true,
} as const;


