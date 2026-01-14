import React from 'react';

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
  report: string;
  files: Array<{ name: string; data: number[] }>;
}

// Re-export for convenience
export type { Message as MessageType, DecryptedMessage as DecryptedMessageType };

interface MessageCardProps {
  message: Message;
  decrypted: DecryptedMessage | null;
  isDecrypting: boolean;
  canDecrypt: boolean;
  onDecrypt: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  decrypted,
  isDecrypting,
  canDecrypt,
  onDecrypt,
}) => {
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
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {isDecrypting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Decrypting...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Decrypt
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {decrypted ? (
        <div className="space-y-4">
          {/* Decrypted Report */}
          <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Decrypted Content
              </p>
            </div>
            <div className="rounded bg-white p-3 dark:bg-slate-800">
              <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">Report:</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900 dark:text-slate-100">
                {decrypted.report}
              </p>
            </div>
          </div>

          {/* Files */}
          {decrypted.files && decrypted.files.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/50">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Attachments ({decrypted.files.length}):</p>
              </div>
              <ul className="space-y-2">
                {decrypted.files.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs dark:bg-slate-800"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">{file.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {(file.data.length / 1024).toFixed(2)} KB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/50">
          <div className="mb-2 flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Encrypted Content</p>
          </div>
          <code className="block break-all rounded bg-white p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {message.ciphertext.substring(0, 120)}...
          </code>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            Hash: {message.hash.substring(0, 32)}...
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageCard;

