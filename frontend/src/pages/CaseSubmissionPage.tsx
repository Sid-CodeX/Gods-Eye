import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Panel from '../components/layout/Panel';
import AnonymityNotice from '../components/submission/AnonymityNotice';
import FileUploadPlaceholder from '../components/submission/FileUploadPlaceholder';
import { generateEphemeralKeyPair, deriveSharedSecret, EphemeralKeyPair } from '../crypto/keys';
import { hashSha256 } from '../crypto/hash';
import { stripMetadata, processFile } from '../crypto/metadata';
import { encryptDualReport, EncryptedPayload } from '../crypto/encrypt';
import { INVIGILATOR_PUBLIC_KEY } from '../crypto/constants';
import sodium from "libsodium-wrappers";


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function base64ToUint8(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Utility: convert Uint8Array to base64 for sending via JSON
async function uint8ToBase64(bytes: Uint8Array): Promise<string> {
  const blob = new Blob([bytes as any]);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // remove the "data:application/octet-stream;base64," prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Utility: copy text to clipboard
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

const CaseSubmissionPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const wbPrivateKey = location.state?.wbPrivateKey;
  const [reportText, setReportText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (!caseId || !wbPrivateKey) {
      navigate('/report-case');
    }
  }, [caseId, wbPrivateKey, navigate]);

  const handleCopyCaseId = async () => {
    if (!caseId) return;
    const success = await copyToClipboard(caseId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setStatusMessage('Failed to copy case ID. Please copy it manually.');
    }
  };

  const handleCopyPrivateKey = async () => {
    if (!wbPrivateKey) return;
    const success = await copyToClipboard(wbPrivateKey);
    if (success) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setStatusMessage('Failed to copy private key. Please copy it manually.');
    }
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!caseId) return;
    setIsSubmitting(true);
    setStatusMessage('Stripping metadata and encrypting...');

    try {
      const encoder = new TextEncoder();

      // 1. Process Files with Sanitization
      const processedFiles = [];
      if (selectedFiles) {
        for (const file of Array.from(selectedFiles)) {
          const { data, mimeType: mime } = await processFile(file);
          const fileHash = await hashSha256(data); // Tamper detection hash

          processedFiles.push({
            name: file.name,
            mime: mime,
            hash: await uint8ToBase64(fileHash),
            data: await uint8ToBase64(data)
          });
        }
      }

      // 2. Build the Comprehensive Payload
      const payloadData = {
        role: "wb",
        message: {
          report: reportText,
          files: processedFiles,
          timestamp: Date.now(),
        }
      };

      const payloadBytes = encoder.encode(JSON.stringify(payloadData));
      const overallHash = await hashSha256(payloadBytes);

      // 3. Cryptography
      await sodium.ready;
      const keyPair = await generateEphemeralKeyPair();

      const wbPrivateKeyBytes = base64ToUint8(wbPrivateKey);
      const sender_static_public = sodium.crypto_scalarmult_base(wbPrivateKeyBytes);

      const sharedSecretReceiver = await deriveSharedSecret(keyPair.privateKey, INVIGILATOR_PUBLIC_KEY);
      const sharedSecretSender = await deriveSharedSecret(keyPair.privateKey, sender_static_public);

      const encrypted = await encryptDualReport(
        payloadBytes,
        sharedSecretReceiver,
        sharedSecretSender,
        "application/json" // mimeType
      );

      // 4. Send to Backend
      setStatusMessage('Uploading to secure vault...');
      const response = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          ciphertext_receiver: await uint8ToBase64(encrypted.ciphertext_receiver),
          nonce_receiver: await uint8ToBase64(encrypted.nonce_receiver),
          ciphertext_sender: await uint8ToBase64(encrypted.ciphertext_sender),
          nonce_sender: await uint8ToBase64(encrypted.nonce_sender),
          hash: await uint8ToBase64(overallHash),
          ephemeral_public_key: await uint8ToBase64(keyPair.publicKey),
          seq: 0,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      setStatusMessage('Report & Files submitted successfully.');
      setReportText('');
      setSelectedFiles(null);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!caseId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Submit an anonymous report
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Your case ID and private key have been generated. Save them securely to check for responses later.
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

      {/* Case ID Display */}
      <Panel
        title="Your Case Credentials"
        description="Save your Case ID and Private Key securely. You will need BOTH to check for responses from investigators. The private key is NEVER saved on our servers."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Case ID</label>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                {caseId}
              </code>
              <button
                onClick={handleCopyCaseId}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Private Key</label>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-lg border border-red-300 outline outline-2 outline-offset-2 outline-red-200 bg-red-50/50 px-4 py-3 text-sm font-mono text-slate-900 dark:border-red-900/50 dark:outline-red-900/30 dark:bg-slate-900 dark:text-slate-100 break-all">
                {wbPrivateKey}
              </code>
              <button
                onClick={handleCopyPrivateKey}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 self-stretch"
              >
                {copiedKey ? (
                  <>
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Key
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50">
            <strong>CRITICAL:</strong> Store your private key in a safe place immediately. It will <strong>never</strong> be shown again and we cannot recover it. Without your private key, you will not be able to read replies from investigators.
          </div>
        </div>
      </Panel>

      <AnonymityNotice />

      <Panel
        title="Secure report composer"
        description="Write your disclosure and attach any supporting evidence. Avoid including personal identifiers."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="report" className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200">
              Report details
            </label>
            <textarea
              id="report"
              required
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              className="min-h-[180px] w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-primary-400 dark:focus:bg-slate-600"
              placeholder="Describe what happened, where, and when. Omit names or personal identifiers unless strictly necessary for your case."
            />
          </div>

          <FileUploadPlaceholder onFilesSelected={setSelectedFiles} />

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700">
              <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">Selected files:</p>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {Array.from(selectedFiles).map((file, index) => (
                  <li key={index}>• {file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>No data leaves your browser unencrypted.</span>
            <span>Client-side encryption only.</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                'Submit securely'
              )}
            </button>
          </div>

          {statusMessage && (
            <div
              className={`rounded-lg p-3 text-sm ${statusMessage.startsWith('Error')
                ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                : statusMessage === 'Processing...' || statusMessage.includes('Submitting')
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
    </div>
  );
};

export default CaseSubmissionPage;

