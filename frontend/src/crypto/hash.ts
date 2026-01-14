/**
 * Compute SHA-256 hash of binary data using Web Crypto API.
 * @param input - Data to hash as Uint8Array
 * @returns SHA-256 hash as Uint8Array
 */
export async function hashSha256(input: Uint8Array): Promise<Uint8Array> {
  // Use Web Crypto API for SHA-256 hashing
  // Create a new ArrayBuffer from the Uint8Array to ensure compatibility
  const buffer = new Uint8Array(input).buffer;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return new Uint8Array(hashBuffer);
}
