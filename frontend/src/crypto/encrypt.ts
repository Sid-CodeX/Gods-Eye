import sodium from "libsodium-wrappers";
import { hashSha256 } from "./hash";

export interface EncryptedPayload {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  fileHash: Uint8Array; // Added for tamper detection
  mimeType: string;    // Necessary to reconstruct the file (audio/pdf/etc)
}

export async function encryptReport(
  fileData: Uint8Array,
  sharedSecret: Uint8Array, 
  mimeType: string = "application/json"
): Promise<EncryptedPayload> {
  await sodium.ready;

  const fileHash = await hashSha256(fileData);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  
  // Ensure sharedSecret is a Uint8Array
  const ciphertext = sodium.crypto_secretbox_easy(fileData, nonce, sharedSecret);

  return {
    ciphertext,
    nonce,
    fileHash,
    mimeType
  };
}