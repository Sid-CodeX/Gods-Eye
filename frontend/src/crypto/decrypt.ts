import sodium from "libsodium-wrappers";
import { hashSha256 } from "./hash";
import { deriveEncryptionKey } from "./kdf";

export async function decryptReport(
  payload: { ciphertext: Uint8Array; nonce: Uint8Array; fileHash: Uint8Array },
  sharedSecret: Uint8Array
): Promise<Uint8Array> {
  await sodium.ready;

  const encryptionKey = await deriveEncryptionKey(sharedSecret);

  const decrypted = sodium.crypto_secretbox_open_easy(
    payload.ciphertext,
    payload.nonce,
    encryptionKey
  );

  if (!decrypted) throw new Error("Decryption/Auth failed");

  // Tamper Detection: Verify hash matches
  const integrityHash = await hashSha256(decrypted);
  if (sodium.compare(integrityHash, payload.fileHash) !== 0) {
    throw new Error("Integrity check failed: File has been tampered with!");
  }

  return decrypted;
}