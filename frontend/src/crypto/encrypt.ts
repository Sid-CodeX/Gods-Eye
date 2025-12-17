import type { EphemeralKeyPair } from './keys';

export interface EncryptedPayload {
  /**
   * Opaque ciphertext bytes to be stored on the untrusted backend.
   */
  ciphertext: Uint8Array;
  /**
   * Nonce or initialization vector used during encryption.
   * This must be unique per message and safe to store with the ciphertext.
   */
  nonce: Uint8Array;
  /**
   * Optional associated data that was authenticated but not encrypted,
   * such as protocol version or case identifiers.
   */
  associatedData?: Uint8Array;
}

/**
 * encryptReport
 *
 * TODO: Implement authenticated encryption using libsodium-wrappers.
 *
 * - `plaintext` must contain only binary-safe data (no implicit string encodings).
 * - `keyPair` should be an ephemeral client-side key, never reused across unrelated submissions.
 * - Must not log or persist `plaintext` or private keys.
 * - Returns an `EncryptedPayload` ready to send to an untrusted backend.
 */
export async function encryptReport(
  plaintext: Uint8Array,
  keyPair: EphemeralKeyPair,
  options?: { associatedData?: Uint8Array },
): Promise<EncryptedPayload> {
  void plaintext;
  void keyPair;
  void options;

  // IMPORTANT: This is a placeholder only. Do not implement custom encryption here.
  return {
    ciphertext: new Uint8Array(),
    nonce: new Uint8Array(),
    associatedData: options?.associatedData,
  };
}


