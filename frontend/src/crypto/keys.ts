import sodium from "libsodium-wrappers";

export interface EphemeralKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

/**
 * Generate a fresh ephemeral keypair (X25519) for a session or message.
 */
export async function generateEphemeralKeyPair(): Promise<EphemeralKeyPair> {
  await sodium.ready;

  // Generate X25519 keypair for key exchange
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Derive a shared secret using X25519 ephemeral keys.
 * Uses crypto_box_beforenm to compute the shared secret.
 * - senderPrivateKey: your private key
 * - receiverPublicKey: recipient's public key
 */
export async function deriveSharedSecret(
  senderPrivateKey: Uint8Array,
  receiverPublicKey: Uint8Array
): Promise<Uint8Array> {
  await sodium.ready;
  
  // Use crypto_box_beforenm to derive shared secret from keypair
  // This computes the shared secret for encryption
  const sharedSecret = sodium.crypto_box_beforenm(receiverPublicKey, senderPrivateKey);
  
  return sharedSecret;
}
