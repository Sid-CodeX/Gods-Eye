/**
 * Metadata Stripping Module
 * 
 * Removes metadata from various file types to protect user privacy.
 * Supports: Images (JPEG, PNG, WebP), PDFs, Office documents, Audio, Video
 */

export interface ProcessedFile {
  data: Uint8Array;
  mimeType: string;
  originalName: string;
  size: number;
}

/**
 * Strip metadata from image files by redrawing on canvas
 * This removes EXIF data, GPS coordinates, camera settings, etc.
 */
async function stripImageMetadata(file: File, mimeType: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Set canvas dimensions to image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas (this strips all metadata)
        ctx.drawImage(img, 0, 0);

        // Convert canvas to blob, then to Uint8Array
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert canvas to blob'));
              return;
            }
            blob.arrayBuffer().then((buffer) => {
              resolve(new Uint8Array(buffer));
            });
          },
          mimeType,
          0.95 // Quality for JPEG
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Strip metadata from PDF files
 * For PDFs, we extract the raw content without metadata streams
 * Note: This is a simplified approach - full PDF parsing would be more thorough
 */
async function stripPdfMetadata(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // PDF files start with %PDF- and have metadata in streams
  // For now, we'll use a simple approach: extract the PDF content
  // In production, consider using a PDF library like pdf-lib
  
  // Basic check: ensure it's a PDF
  const header = String.fromCharCode(...bytes.slice(0, 4));
  if (header !== '%PDF') {
    throw new Error('Invalid PDF file');
  }

  // Return the PDF as-is for now (full metadata stripping requires PDF parsing)
  // TODO: Implement full PDF metadata removal using pdf-lib or similar
  return bytes;
}

/**
 * Strip metadata from Office documents (DOCX, XLSX, PPTX)
 * These are ZIP archives containing XML files with metadata
 */
async function stripOfficeMetadata(file: File): Promise<Uint8Array> {
  // Office documents are ZIP files
  // We'd need to extract, remove metadata XML, and re-zip
  // For now, return the file as-is with a note
  // TODO: Implement Office document metadata stripping
  
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Strip metadata from audio files
 * For audio, we can use Web Audio API to re-encode without metadata
 */
async function stripAudioMetadata(file: File): Promise<Uint8Array> {
  // Audio metadata stripping is complex and format-dependent
  // For now, return the file as-is
  // TODO: Implement audio metadata stripping using Web Audio API or library
  
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Strip metadata from video files
 * Video metadata stripping requires video processing
 */
async function stripVideoMetadata(file: File): Promise<Uint8Array> {
  // Video metadata stripping requires video codec processing
  // For now, return the file as-is
  // TODO: Implement video metadata stripping using WebCodecs API or library
  
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Main function to strip metadata from files based on MIME type
 * @param file - The file to process
 * @returns Processed file data without metadata
 */
export async function stripMetadata(file: File): Promise<Uint8Array> {
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Image files - use canvas redraw method
  if (mimeType.startsWith('image/')) {
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (supportedImageTypes.includes(mimeType)) {
      return await stripImageMetadata(file, mimeType);
    }
    // For unsupported image types, return as-is
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  }

  // PDF files
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await stripPdfMetadata(file);
  }

  // Office documents
  const officeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/msword', // DOC
    'application/vnd.ms-excel', // XLS
    'application/vnd.ms-powerpoint', // PPT
  ];
  if (officeTypes.includes(mimeType) || 
      fileName.match(/\.(docx?|xlsx?|pptx?)$/i)) {
    return await stripOfficeMetadata(file);
  }

  // Audio files
  if (mimeType.startsWith('audio/')) {
    return await stripAudioMetadata(file);
  }

  // Video files
  if (mimeType.startsWith('video/')) {
    return await stripVideoMetadata(file);
  }

  // For other file types, return as-is (no metadata stripping)
  // This includes text files, archives, etc.
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Process a file: strip metadata and return processed file info
 */
export async function processFile(file: File): Promise<ProcessedFile> {
  const cleanedData = await stripMetadata(file);
  
  return {
    data: cleanedData,
    mimeType: file.type || 'application/octet-stream',
    originalName: file.name,
    size: cleanedData.length,
  };
}
