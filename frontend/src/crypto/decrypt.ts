import sodium from "libsodium-wrappers";
import type { EncryptedPayload as EP } from "./encrypt";
import { deriveEncryptionKey } from "./kdf";

// Re-export type
export type EncryptedPayload = EP;

export async function decryptReport(
  payload: EncryptedPayload,
  sharedSecret: Uint8Array
): Promise<Uint8Array> {
  await sodium.ready;

  const encryptionKey = await deriveEncryptionKey(sharedSecret);

  const plaintext = sodium.crypto_secretbox_open_easy(
    payload.ciphertext,
    payload.nonce,
    encryptionKey
  );

  if (!plaintext) throw new Error("Decryption failed or authentication failed");
  return plaintext;
}
