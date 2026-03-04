import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from '../components/layout/Panel';
import AnonymityNotice from '../components/submission/AnonymityNotice';
import FileUploadPlaceholder from '../components/submission/FileUploadPlaceholder';
import { generateEphemeralKeyPair, deriveSharedSecret } from '../crypto/keys';
import { hashSha256 } from '../crypto/hash';
import { processFile } from '../crypto/metadata';
import { encryptReport } from '../crypto/encrypt';
import { decryptReport } from '../crypto/decrypt';
import { INVIGILATOR_PUBLIC_KEY } from '../crypto/constants';
import { deriveEncryptionKey } from '../crypto/kdf';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function base64ToUint8(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

interface Message {
  ciphertext: string;
  nonce: string;
  hash: string;
  seq: number;
  created_at: number;
}

interface Reply {
  id: number;
  ciphertext: string;
  created_at: number;
}

const CheckCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [caseId, setCaseId] = useState('');
  const [wbPrivateKey, setWbPrivateKey] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<Map<number, any>>(new Map());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [updateFiles, setUpdateFiles] = useState<FileList | null>(null);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  async function uint8ToBase64(bytes: Uint8Array): Promise<string> {
    const blob = new Blob([bytes as any]);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const handleFetchMessages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId.trim() || !wbPrivateKey.trim()) {
      setStatusMessage('Please enter both Case ID and Private Key');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Fetching messages...');

    try {
      const response = await fetch(`${API_BASE}/messages/list/${caseId}`);

      if (response.status === 404) {
        setStatusMessage('Case not found. Please check your case ID.');
        setMessages([]);
        setReplies([]);
        setIsLoading(false);
        return;
      }

      if (response.status === 410) {
        setStatusMessage('This case has expired.');
        setMessages([]);
        setReplies([]);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(data);
      setStatusMessage(
        data.length > 0
          ? `Found ${data.length} message(s) for this case. Decrypting...`
          : 'No messages found for this case yet.'
      );

      setReplies([]);

      // Automatically decrypt messages intended for whistleblower
      const newDecrypted = new Map<number, any>();
      for (let i = 0; i < data.length; i++) {
        const msg = data[i];
        try {
          const sharedSecret = await deriveSharedSecret(
            base64ToUint8(wbPrivateKey.trim()),
            base64ToUint8(msg.ephemeral_public_key)
          );

          const payload = {
            ciphertext: base64ToUint8(msg.ciphertext),
            nonce: base64ToUint8(msg.nonce),
            fileHash: base64ToUint8(msg.hash),
            mimeType: 'application/json'
          };

          const decryptedBytes = await decryptReport(payload, sharedSecret);
          const decryptedJson = uint8ToString(decryptedBytes);
          newDecrypted.set(msg.seq, JSON.parse(decryptedJson));
        } catch (e) {
          // Expected failure for messages whistleblower sent themselves
        }
      }
      setDecryptedMessages(newDecrypted);
      setStatusMessage(
        data.length > 0
          ? `Found ${data.length} message(s). Decrypted ${newDecrypted.size} replies.`
          : 'No messages found for this case yet.'
      );

    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message}`);
      setMessages([]);
      setReplies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caseId.trim()) {
      setStatusMessage('Please enter a case ID and load the case before submitting an update.');
      return;
    }
    if (!updateText.trim() && !updateFiles) {
      setStatusMessage('Please enter some update text or attach at least one file.');
      return;
    }

    setIsSubmittingUpdate(true);
    setStatusMessage('Encrypting update and uploading...');

    try {
      const encoder = new TextEncoder();

      // 1. Process files
      const processedFiles: any[] = [];
      if (updateFiles) {
        for (const file of Array.from(updateFiles)) {
          const { data, mimeType: mime } = await processFile(file);
          const fileHash = await hashSha256(data);

          processedFiles.push({
            name: file.name,
            mime,
            hash: await uint8ToBase64(fileHash),
            data: await uint8ToBase64(data),
          });
        }
      }

      // 2. Build payload
      const payloadData = {
        report: updateText,
        files: processedFiles,
        timestamp: Date.now(),
      };

      const payloadBytes = encoder.encode(JSON.stringify(payloadData));
      const overallHash = await hashSha256(payloadBytes);

      // 3. Crypto – same as case submission
      const keyPair = await generateEphemeralKeyPair();
      const sharedSecret = await deriveSharedSecret(keyPair.privateKey, INVIGILATOR_PUBLIC_KEY);
      const encryptionKey = await deriveEncryptionKey(sharedSecret);

      const encrypted = await encryptReport(
        payloadBytes,
        encryptionKey,
        "application/json"
      );

      // Derive a sequence number based on current messages
      const nextSeq =
        messages.length > 0
          ? Math.max(...messages.map((m) => m.seq)) + 1
          : 0;

      // 4. Send to backend
      const response = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId.trim(),
          ciphertext: await uint8ToBase64(encrypted.ciphertext),
          nonce: await uint8ToBase64(encrypted.nonce),
          hash: await uint8ToBase64(overallHash),
          ephemeral_public_key: await uint8ToBase64(keyPair.publicKey),
          seq: nextSeq,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit update');
      }

      setStatusMessage('Update submitted successfully.');
      setUpdateText('');
      setUpdateFiles(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Check Existing Case
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Enter your case ID to view messages and responses from investigators.
          </p>
        </div>
        <button
          onClick={() => navigate('/report-case')}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <Panel
        title="Enter Case ID"
        description="Input your case ID to retrieve messages and investigator replies"
      >
        <form onSubmit={handleFetchMessages} className="space-y-4">
          <div>
            <label htmlFor="case-id" className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200">
              Case ID
            </label>
            <input
              id="case-id"
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Enter your case ID"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-primary-400 dark:focus:bg-slate-600"
              required
            />
          </div>

          <div>
            <label htmlFor="private-key" className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200">
              Private Key
            </label>
            <input
              id="private-key"
              type="password"
              value={wbPrivateKey}
              onChange={(e) => setWbPrivateKey(e.target.value)}
              placeholder="Enter your private key"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-primary-400 dark:focus:bg-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Fetching...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Check Case
              </>
            )}
          </button>

          {statusMessage && (
            <div
              className={`rounded-lg p-3 text-sm ${statusMessage.startsWith('Error') || statusMessage.includes('not found') || statusMessage.includes('expired')
                ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                : statusMessage.includes('Fetching')
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
                }`}
              role="alert"
              aria-live="polite"
            >
              {statusMessage}
            </div>
          )}
        </form>
      </Panel>

      {messages.length > 0 && (
        <Panel
          title="Messages"
          description={`${messages.length} message(s) found for this case`}
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Message #{message.seq}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {new Date(message.created_at * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="rounded bg-white p-3 dark:bg-slate-800">
                  {decryptedMessages.has(message.seq) ? (
                    <div>
                      <p className="mb-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">Decrypted Content:</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200 mb-4 whitespace-pre-wrap">
                        {decryptedMessages.get(message.seq).report}
                      </p>
                      {decryptedMessages.get(message.seq).files?.length > 0 && (
                        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                          <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Attached Files:</p>
                          <ul className="space-y-2">
                            {decryptedMessages.get(message.seq).files.map((file: any, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <a
                                  href={`data:${file.mime};base64,${file.data}`}
                                  download={file.name}
                                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  📄 {file.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">Encrypted Content:</p>
                      <code className="block break-all text-xs text-slate-600 dark:text-slate-400">
                        {message.ciphertext.substring(0, 100)}...
                      </code>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                        Nonce: {message.nonce?.substring(0, 32) || 'N/A'}...
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                        Hash: {message.hash.substring(0, 32)}...
                      </p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                        Note: Could not decrypt. This may be your own message, which is unreadable due to forward secrecy.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {replies.length > 0 && (
        <Panel
          title="Investigator replies"
          description={`${replies.length} reply(ies) from investigators for this case`}
        >
          <div className="space-y-3">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Investigator message
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(reply.created_at * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="rounded bg-white p-3 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <p className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                    Encrypted reply ciphertext:
                  </p>
                  <code className="block break-all">
                    {reply.ciphertext.substring(0, 120)}...
                  </code>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    Note: This reply is stored encrypted on the server. Decryption strategy for
                    whistleblower-visible replies will depend on future key exchange design.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {caseId && (
        <Panel
          title="Provide an update to investigators"
          description="Answer follow-up questions or add more evidence for this case. Your update is encrypted in the browser before upload."
        >
          <AnonymityNotice />
          <form onSubmit={handleSubmitUpdate} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="update-text"
                className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Update details
              </label>
              <textarea
                id="update-text"
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                className="min-h-[140px] w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-primary-400 dark:focus:bg-slate-600"
                placeholder="Describe your follow-up information or answer the investigator's questions."
              />
            </div>

            <FileUploadPlaceholder onFilesSelected={setUpdateFiles} />

            <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>No data leaves your browser unencrypted.</span>
              <span>Updates are linked to the same case ID.</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingUpdate}
                className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingUpdate ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting update...
                  </>
                ) : (
                  'Submit encrypted update'
                )}
              </button>
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
};

export default CheckCasePage;

