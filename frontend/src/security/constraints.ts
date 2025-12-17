// Central list of security assumptions for the frontend.
// Import this module where decisions might affect security to avoid accidental drift.

export const SECURITY_ASSUMPTIONS = {
  // All sensitive data must be encrypted in the browser before being sent anywhere.
  clientSideOnlyEncryption: true,
  // Backend is treated as untrusted storage and may be observed or modified by attackers.
  backendIsUntrustedStorage: true,
  // No user accounts or long-lived identifiers are allowed.
  noAuthenticationOrIdentity: true,
  // No analytics, third-party SDKs, or external CDNs are permitted.
  noThirdPartyOrTracking: true,
  // Cryptographic keys must be ephemeral and never reused across unrelated cases.
  neverReuseKeys: true,
} as const;


