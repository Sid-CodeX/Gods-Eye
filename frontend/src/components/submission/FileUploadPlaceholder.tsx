import React from 'react';

interface FileUploadPlaceholderProps {
  onFilesSelected: (files: FileList | null) => void;
}

const FileUploadPlaceholder: React.FC<FileUploadPlaceholderProps> = ({ onFilesSelected }) => {
  return (
    <div className="mt-4">
      <label
        htmlFor="file-upload"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-600 transition hover:border-primary-500 hover:bg-primary-50/70 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-100 dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:bg-primary-900/30 dark:focus-within:ring-offset-slate-800"
      >
        <span className="font-medium text-slate-800 dark:text-slate-200">Attach supporting files (optional)</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Drag and drop files here, or click to select.</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Files will later be scrubbed of metadata and encrypted in your browser.
        </span>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => onFilesSelected(event.target.files)}
        />
      </label>
    </div>
  );
};

export default FileUploadPlaceholder;


