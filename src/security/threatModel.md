## Threat Model (Draft)

This document is a high-level sketch of anticipated threats and intended mitigations for the GodsEye client.
It is **not** exhaustive and must be reviewed by a qualified security engineer before production use.

### In-Scope Threats

- **Malicious or compromised backend**
  - Backend storage is treated as untrusted.
  - Mitigation (planned): all reports and messages are encrypted end-to-end in the browser using vetted cryptographic libraries.

- **Network attackers (passive and active)**
  - Attackers may observe or modify traffic between client and backend.
  - Mitigation (planned): transport-layer security (HTTPS) plus client-side authenticated encryption.

- **Traffic correlation and metadata leakage**
  - Network-level observers may attempt to correlate submission timing, size, or IP addresses.
  - Mitigation (partial, future): guidance for using Tor or privacy-preserving networks; metadata scrubbing for files; padding strategies where appropriate.

- **Accidental identity disclosure by users**
  - Users may include personal information in report text or attachments.
  - Mitigation: strong UI warnings, metadata stripping tooling, and clear language about what not to share.

### Out-of-Scope (for this frontend scaffold)

- Malware or keyloggers on the user&apos;s device.
- Compromised browsers or plugins.
- Targeted physical attacks against whistleblowers or investigators.

### Core Principles

- **Client-side crypto only**
  - All encryption and decryption occur in the browser.
  - The backend must never see plaintext or key material.

- **No identity, no tracking**
  - No login, cookies, localStorage, analytics, or third-party SDKs.
  - No fingerprinting or behavioral tracking.

- **Ephemeral keys**
  - Keys must be generated per session or per case.
  - Keys must never be reused across unrelated cases or stored long-term.

- **No logging of secrets**
  - Never log keys, plaintext reports, or sensitive metadata to console, files, or monitoring systems.

This file is part of the security scaffold only; it does not implement any crypto itself.


