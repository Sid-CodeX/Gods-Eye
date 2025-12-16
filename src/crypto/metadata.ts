/**
 * scrubMetadata
 *
 * TODO: Implement format-aware metadata scrubbing for files.
 *
 * - Input: raw file bytes as Uint8Array.
 * - Output: new Uint8Array with identifying metadata removed where possible.
 * - Must not attempt to infer user identity or track users.
 * - Should be deterministic for a given input.
 */
export async function scrubMetadata(binary: Uint8Array): Promise<Uint8Array> {
  // This is a non-functional placeholder. The production version might:
  // - Strip EXIF from images.
  // - Remove document properties from PDFs and office files.
  // - Normalize timestamps where safe.
  void binary;
  return new Uint8Array();
}


