import sodium from "libsodium-wrappers";

/**
 * Derive a 32-byte symmetric key from X25519 shared secret
 */
export async function deriveEncryptionKey(
  sharedSecret: Uint8Array
): Promise<Uint8Array> {
  await sodium.ready;

  // Domain separation via prefix
  const context = new TextEncoder().encode("gods-eye-secretbox-v1");

  const material = new Uint8Array(
    context.length + sharedSecret.length
  );

  material.set(context, 0);
  material.set(sharedSecret, context.length);

  return sodium.crypto_generichash(
    sodium.crypto_secretbox_KEYBYTES,
    material
  );
}
