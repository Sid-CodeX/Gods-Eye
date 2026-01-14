import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Panel from '../components/layout/Panel';
import AnonymityNotice from '../components/submission/AnonymityNotice';
import FileUploadPlaceholder from '../components/submission/FileUploadPlaceholder';
import { generateEphemeralKeyPair, deriveSharedSecret, EphemeralKeyPair } from '../crypto/keys';
import { hashSha256 } from '../crypto/hash';
import { stripMetadata } from '../crypto/metadata';
import { encryptReport, EncryptedPayload } from '../crypto/encrypt';
import { INVIGILATOR_PUBLIC_KEY } from '../crypto/constants';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Utility: convert Uint8Array to base64 for sending via JSON
function uint8ToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

const SubmissionPage: React.FC = () => {
  const [reportText, setReportText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatusMessage('Processing...');

    try {
      const encoder = new TextEncoder();
      const reportBytes = encoder.encode(reportText);

      // 1️⃣ Hash plaintext for integrity / associated data
      const reportHash = await hashSha256(reportBytes);

      // 2️⃣ Scrub file metadata
      if (selectedFiles && selectedFiles.length > 0) {
        for (const file of Array.from(selectedFiles)) {
          const buffer = await file.arrayBuffer();
          const binary = new Uint8Array(buffer);
          await stripMetadata(binary);
        }
      }

      // 3️⃣ Generate ephemeral keypair for this submission
      const keyPair: EphemeralKeyPair = await generateEphemeralKeyPair();

      // 4️⃣ Derive shared secret with invigilator's public key
      const sharedSecret = await deriveSharedSecret(keyPair.privateKey, INVIGILATOR_PUBLIC_KEY);

      // 5️⃣ Encrypt report using the shared secret
      const payload: EncryptedPayload = await encryptReport(reportBytes, sharedSecret, { associatedData: reportHash });

      // 6️⃣ Request new case ID from backend
      const caseResp = await fetch(`${API_BASE}/cases/create`, { method: 'POST' });
      if (!caseResp.ok) throw new Error('Failed to create case');
      const { case_id } = await caseResp.json();

      // 7️⃣ Send encrypted report to backend
      const sendResp = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id,
          ciphertext: uint8ToBase64(payload.ciphertext),
          nonce: uint8ToBase64(payload.nonce),
          hash: uint8ToBase64(reportHash),
          seq: 0
        })
      });

      if (!sendResp.ok) throw new Error('Failed to send message');

      setStatusMessage(`Report submitted securely. Case ID: ${case_id}`);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message}`);
    }
  }

  return (
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
  );
};

export default SubmissionPage;
