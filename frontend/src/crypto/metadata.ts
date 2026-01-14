/**
 * Remove sensitive metadata from files
 * @param fileData Uint8Array
 * @returns Uint8Array cleaned file data
 */
export async function stripMetadata(fileData: Uint8Array): Promise<Uint8Array> {
  // TODO: Implement EXIF removal, document sanitization, etc.
  // For now we just return the original data
  return fileData;
}
