import sodium from "libsodium-wrappers";
import type { EphemeralKeyPair } from "./keys";

/**
 * Encrypted payload returned from encryption
 */
export interface EncryptedPayload {
  /**
   * Ciphertext bytes (encrypted report)
   */
  ciphertext: Uint8Array;

  /**
   * Nonce used for encryption, must be unique per message
   */
  nonce: Uint8Array;

  /**
   * Optional associated data authenticated but not encrypted
   */
  associatedData?: Uint8Array;
}

/**
 * encryptReport
 *
 * Encrypt binary plaintext using a shared secret derived from ephemeral keys.
 *
 * - Uses libsodium secretbox (XSalsa20-Poly1305) authenticated encryption.
 * - The sharedSecret must be 32 bytes (from X25519 key exchange)
 * - Returns ciphertext, nonce, and optional associatedData
 *
 * @param plaintext Uint8Array
 * @param sharedSecret Uint8Array (32-byte shared secret)
 * @param options.associatedData optional Uint8Array
 * @returns EncryptedPayload
 */
export async function encryptReport(
  plaintext: Uint8Array,
  sharedSecret: Uint8Array,
  options?: { associatedData?: Uint8Array }
): Promise<EncryptedPayload> {
  await sodium.ready;

  if (sharedSecret.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new Error(
      `Shared secret must be ${sodium.crypto_secretbox_KEYBYTES} bytes`
    );
  }

  // 1️⃣ Generate a random nonce for this message
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  // 2️ Encrypt plaintext using XSalsa20-Poly1305 (secretbox)
  const ciphertext = sodium.crypto_secretbox_easy(plaintext, nonce, sharedSecret);

  return {
    ciphertext,
    nonce,
    associatedData: options?.associatedData,
  };
}
