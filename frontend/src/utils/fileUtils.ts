/**
 * File Utility Functions
 * 
 * Helper functions for file handling, validation, and display
 */

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  hash: string; // SHA-256 hash
}

/**
 * Get file type icon based on MIME type
 */
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return '🖼️';
  }
  if (mimeType.startsWith('video/')) {
    return '🎥';
  }
  if (mimeType.startsWith('audio/')) {
    return '🎵';
  }
  if (mimeType === 'application/pdf') {
    return '📄';
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return '📝';
  }
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return '📊';
  }
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return '📽️';
  }
  if (mimeType.includes('zip') || mimeType.includes('archive')) {
    return '📦';
  }
  return '📎';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes?: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) {
    return true; // Allow all types if none specified
  }
  
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      // Wildcard match (e.g., 'image/*')
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a document (PDF, Office, etc.)
 */
export function isDocumentFile(file: File): boolean {
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
  ];
  
  return docTypes.some(type => file.type.includes(type)) ||
         /\.(pdf|docx?|xlsx?|pptx?)$/i.test(file.name);
}

/**
 * Check if file is media (audio/video)
 */
export function isMediaFile(file: File): boolean {
  return file.type.startsWith('audio/') || file.type.startsWith('video/');
}


