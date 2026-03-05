import sodium from "libsodium-wrappers";
import { hashSha256 } from "./hash";
import { deriveEncryptionKey } from "./kdf";

export interface EncryptedPayload {
  ciphertext_receiver: Uint8Array;
  nonce_receiver: Uint8Array;
  ciphertext_sender: Uint8Array;
  nonce_sender: Uint8Array;
  fileHash: Uint8Array;
  mimeType: string;
}

export async function encryptDualReport(
  fileData: Uint8Array,
  sharedSecretReceiver: Uint8Array,
  sharedSecretSender: Uint8Array,
  mimeType: string = "application/json"
): Promise<EncryptedPayload> {
  await sodium.ready;

  const fileHash = await hashSha256(fileData);

  const keyReceiver = await deriveEncryptionKey(sharedSecretReceiver);
  const keySender = await deriveEncryptionKey(sharedSecretSender);

  const nonceReceiver = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const nonceSender = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  const ciphertext_receiver = sodium.crypto_secretbox_easy(fileData, nonceReceiver, keyReceiver);
  const ciphertext_sender = sodium.crypto_secretbox_easy(fileData, nonceSender, keySender);

  return {
    ciphertext_receiver,
    nonce_receiver: nonceReceiver,
    ciphertext_sender,
    nonce_sender: nonceSender,
    fileHash,
    mimeType
  };
}