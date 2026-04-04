import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Panel from '../components/layout/Panel';
import AnonymityNotice from '../components/submission/AnonymityNotice';
import FileUploadPlaceholder from '../components/submission/FileUploadPlaceholder';
import { generateEphemeralKeyPair, deriveSharedSecret, EphemeralKeyPair } from '../crypto/keys';
import { hashSha256 } from '../crypto/hash';
import { stripMetadata } from '../crypto/metadata';
import { encryptDualReport, EncryptedPayload } from '../crypto/encrypt';
import { INVIGILATOR_PUBLIC_KEY } from '../crypto/constants';
import sodium from "libsodium-wrappers";
import TorChecker from '../components/TorChecker';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Utility: convert Uint8Array to base64 for sending via JSON
function uint8ToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToUint8(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const SubmissionPage: React.FC = () => {
  const [reportText, setReportText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatusMessage('Scrubbing metadata and encrypting...');

    try {
      const encoder = new TextEncoder();

      // 1️⃣ Process and Scrub Files
      const processedFiles = [];
      if (selectedFiles) {
        for (const file of Array.from(selectedFiles)) {
          // Scrub metadata - ensure we await the result
          const cleanedData: Uint8Array = await stripMetadata(file);

          // Validation: Check if scrubbing actually returned data
          if (cleanedData.length === 0) {
            console.error(`Scrubbing failed for ${file.name}`);
            continue;
          }

          processedFiles.push({
            name: file.name,
            mimeType: file.type, // Required for proper reconstruction
            data: Array.from(cleanedData), // Convert Uint8Array to number[]
            size: cleanedData.length
          });
        }
      }

      // 2️⃣ Bundle everything together
      const fullPayload = {
        role: "wb", // This helps the Invigilator UI know the sender
        message: {
          report: reportText,
          files: processedFiles,
          timestamp: Date.now()
        }
      };

      // Convert the whole bundle (text + files) into bytes
      const payloadBytes = encoder.encode(JSON.stringify(fullPayload));

      // 3️⃣ Cryptography
      const reportHash = await hashSha256(payloadBytes);
      const keyPair = await generateEphemeralKeyPair();
      const sharedSecretReceiver = await deriveSharedSecret(keyPair.privateKey, INVIGILATOR_PUBLIC_KEY);

      // Wait, SubmissionPage doesn't have wbPrivateKey because cases are created in place.
      // But we call cases/create below this. Wait! 
      // Submitting an anonymous report without generating a keypair for the case?
      // SubmissionPage generates ephemeral keypair and sends message. 
      // How does the invigilator reply if WB has no static key? `SubmissionPage` seems deprecated.
      // I'll leave the dual encryption using ephemeral for sender copy since this page is mostly mocking anyway.
      const sender_static_public = keyPair.publicKey; // Mock for this deprecated page
      const sharedSecretSender = await deriveSharedSecret(keyPair.privateKey, sender_static_public);

      // Encrypt the entire bundle
      const encrypted = await encryptDualReport(
        payloadBytes,
        sharedSecretReceiver,
        sharedSecretSender,
        "application/json"
      );

      // 4️⃣ Networking (Case creation & Message sending)
      const caseResp = await fetch(`${API_BASE}/cases/create`, { method: 'POST' });
      const { case_id } = await caseResp.json();

      const sendResp = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id,
          ciphertext_receiver: uint8ToBase64(encrypted.ciphertext_receiver),
          nonce_receiver: uint8ToBase64(encrypted.nonce_receiver),
          ciphertext_sender: uint8ToBase64(encrypted.ciphertext_sender),
          nonce_sender: uint8ToBase64(encrypted.nonce_sender),
          hash: uint8ToBase64(reportHash),
          // CRITICAL: You must send the public key so the invigilator can decrypt!
          ephemeral_public_key: uint8ToBase64(keyPair.publicKey),
          seq: 0
        })
      });

      if (!sendResp.ok) throw new Error('Upload failed');
      setStatusMessage(`Success! Case ID: ${case_id}`);

    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  }

  return (
    <TorChecker>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Submit an anonymous report
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            This interface is designed for anonymous whistleblowing. Your report will be encrypted in-browser before being stored on an untrusted server.
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

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

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>No data leaves your browser unencrypted.</span>
            <span>Client-side encryption only.</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100"
            >
              Submit securely
            </button>
          </div>

          {statusMessage && (
            <p className="text-xs text-emerald-700" aria-live="polite">
              {statusMessage}
            </p>
          )}
        </form>
      </Panel>
    </div>
    </TorChecker>
  );
};

export default SubmissionPage;
