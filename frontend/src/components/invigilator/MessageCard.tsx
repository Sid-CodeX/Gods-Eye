import React, { useEffect, useState } from 'react';
import sodium from 'libsodium-wrappers';

export interface Message {
  id: number;
  ciphertext: string;
  nonce: string;
  hash: string;
  ephemeral_public_key: string;
  seq: number;
  created_at: number;
}

export interface DecryptedMessage {
  role?: "wb" | "inv";
  message?: {
    report: string;
    files: Array<{
      name: string;
      data: number[];
      mimeType?: string;
      size?: number;
      hash?: any;
    }>;
  };
  // Backward compatibility fields
  report?: string;
  files?: Array<{
    name: string;
    data: number[];
    mimeType?: string;
    size?: number;
    hash?: any;
  }>;
}

export type { Message as MessageType, DecryptedMessage as DecryptedMessageType };

interface MessageCardProps {
  message: Message;
  decrypted: DecryptedMessage | null;
  isDecrypting: boolean;
  canDecrypt: boolean;
  onDecrypt: () => void;
}

/**
 * A small sub-component to handle Image Preview memory management
 */
const ImagePreview: React.FC<{ data: number[], type: string }> = ({ data, type }) => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const blob = new Blob([new Uint8Array(data)], { type });
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);

    // Clean up memory when the component unmounts or data changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [data, type]);

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <img
        src={url}
        alt="Attachment preview"
        className="max-h-64 w-full object-contain bg-slate-100 dark:bg-slate-900"
      />
    </div>
  );
};

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  decrypted,
  isDecrypting,
  canDecrypt,
  onDecrypt,
}) => {

  const handleFileView = (file: any) => {
    try {
      // 1. Validation and Extraction
      // Ensure we are working with a plain array of numbers
      const rawData = Array.isArray(file.data) ? file.data : Object.values(file.data || {});

      if (!rawData || rawData.length === 0) {
        console.error("File data is empty or missing property 'data':", file);
        alert("Error: Decrypted file data is empty.");
        return;
      }

      // 2. Explicit Conversion
      // Using Uint8Array.from is sometimes more robust for React-proxied arrays
      const byteArray = Uint8Array.from(rawData);

      // 3. Create the Blob
      const blob = new Blob([byteArray], { type: file.mimeType || 'application/octet-stream' });

      // 4. Verify
      if (blob.size === 0) {
        throw new Error("Generated Blob resulted in 0 bytes. Check if data is a valid numeric array.");
      }

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = file.name || 'attachment';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Failed to process file for viewing:", err);
      alert("Could not reconstruct the file. Please check the browser console for technical details.");
    }
  };

  return (
    <div className="rounded-lg border-2 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              #{message.seq}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Message #{message.seq}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(message.created_at * 1000).toLocaleString()}
            </p>
          </div>
        </div>
        {!decrypted && (
          <button
            onClick={onDecrypt}
            disabled={isDecrypting || !canDecrypt}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            {isDecrypting ? 'Decrypting...' : 'Decrypt'}
          </button>
        )}
      </div>

      {/* Content */}
      {decrypted ? (
        <div className="space-y-4">
          <div className={`rounded-lg p-4 ${decrypted.role === 'inv'
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-emerald-50 dark:bg-emerald-900/20'
            }`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${decrypted.role === 'inv'
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-emerald-700 dark:text-emerald-300'
              }`}>
              {decrypted.role === 'inv' ? 'Investigator Reply' : 'Decrypted Report'}
            </p>
            <div className={`rounded p-3 ${decrypted.role === 'inv'
                ? 'bg-blue-50/50 dark:bg-slate-800'
                : 'bg-white dark:bg-slate-800'
              }`}>
              <p className="whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">
                {decrypted.message?.report || decrypted.report}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {(decrypted.message?.files || decrypted.files) && (decrypted.message?.files || decrypted.files)!.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/50">
              <p className="mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Attachments ({(decrypted.message?.files || decrypted.files)!.length})
              </p>
              <ul className="space-y-3">
                {(decrypted.message?.files || decrypted.files)!.map((file, idx) => (
                  <li key={idx} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded bg-slate-100 p-2 dark:bg-slate-700 text-slate-500">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[180px]">
                            {file.name || 'Unnamed File'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {file.mimeType} • {((file.size || file.data.length) / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFileView(file)}
                        className="rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300"
                      >
                        Download
                      </button>
                    </div>

                    {/* IMAGE PREVIEW LOGIC */}
                    {file.mimeType?.startsWith('image/') && (
                      <ImagePreview data={file.data} type={file.mimeType} />
                    )}

                    {file.hash && (
                      <div className="mt-1 border-t border-slate-100 pt-2 dark:border-slate-700">
                        <p className="font-mono text-[9px] text-slate-400 truncate">
                          Hash: {Array.isArray(file.hash) ? sodium.to_hex(new Uint8Array(file.hash)) : file.hash}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-700/50">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Encrypted Content</p>
          <code className="mt-2 block break-all rounded bg-white p-3 text-[10px] text-slate-400 dark:bg-slate-800">
            {message.ciphertext.substring(0, 100)}...
          </code>
        </div>
      )}
    </div>
  );
};

export default MessageCard;