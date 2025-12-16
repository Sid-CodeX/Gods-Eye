import type { EphemeralKeyPair } from './keys';
import type { EncryptedPayload } from './encrypt';

/**
 * decryptReport
 *
 * TODO: Implement authenticated decryption using libsodium-wrappers.
 *
 * - Accepts an `EncryptedPayload` previously produced by `encryptReport`.
 * - Uses the appropriate private key material from `keyPair` to recover the plaintext.
 * - Must fail closed: if authentication fails, never return partial plaintext.
 * - Must not log ciphertext, keys, or recovered plaintext.
 */
export async function decryptReport(
  payload: EncryptedPayload,
  keyPair: EphemeralKeyPair,
): Promise<Uint8Array> {
  void payload;
  void keyPair;

  // Placeholder only. The real implementation will verify authenticity
  // and either return the original plaintext bytes or throw on failure.
  return new Uint8Array();
}


