import React, { useState } from 'react';
import { getFileTypeIcon, formatFileSize, isValidFileSize } from '../../utils/fileUtils';

interface FileUploadPlaceholderProps {
  onFilesSelected: (files: FileList | null) => void;
  selectedFiles?: FileList | null;
  maxSizeMB?: number;
}

const FileUploadPlaceholder: React.FC<FileUploadPlaceholderProps> = ({
  onFilesSelected,
  selectedFiles,
  maxSizeMB = 50,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(e.target.files);
    }
  };

  const validateAndSetFiles = (files: FileList) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (!isValidFileSize(file, maxSizeBytes)) {
        invalidFiles.push(`${file.name} (exceeds ${maxSizeMB}MB limit)`);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`Some files are too large: ${invalidFiles.join(', ')}`);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setError(null);
    onFilesSelected(files);
  };

  const removeFile = (index: number) => {
    if (!selectedFiles) return;
    
    const dt = new DataTransfer();
    Array.from(selectedFiles).forEach((file, i) => {
      if (i !== index) {
        dt.items.add(file);
      }
    });
    onFilesSelected(dt.files.length > 0 ? dt.files : null);
  };

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition ${
          dragActive
            ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
            : 'border-slate-300 bg-slate-50/60 dark:border-slate-600 dark:bg-slate-700/60'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-8 w-8 text-slate-400 dark:text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            Attach supporting files (optional)
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Drag and drop files here, or click to select
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Supports: Images, PDFs, Documents, Audio, Video (max {maxSizeMB}MB per file)
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Metadata will be stripped and files encrypted in your browser
          </span>
        </div>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          multiple
          className="sr-only"
          onChange={handleFileInput}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,audio/*,video/*"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          Select Files
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {selectedFiles && selectedFiles.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700">
          <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            Selected files ({selectedFiles.length}):
          </p>
          <ul className="space-y-2">
            {Array.from(selectedFiles).map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs dark:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{getFileTypeIcon(file.type)}</span>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{file.name}</span>
                    <span className="ml-2 text-slate-500 dark:text-slate-400">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="rounded p-1 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploadPlaceholder;


