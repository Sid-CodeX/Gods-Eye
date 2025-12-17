import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Panel from '../components/layout/Panel';
import AnonymityNotice from '../components/submission/AnonymityNotice';
import FileUploadPlaceholder from '../components/submission/FileUploadPlaceholder';
import { generateEphemeralKeyPair } from '../crypto/keys';
import { hashSha256 } from '../crypto/hash';
import { scrubMetadata } from '../crypto/metadata';
import { encryptReport } from '../crypto/encrypt';

const SubmissionPage: React.FC = () => {
  const [reportText, setReportText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatusMessage(null);

    // This function demonstrates the intended flow only.
    // It does NOT perform real encryption and does NOT send data anywhere.

    const encoder = new TextEncoder();
    const reportBytes = encoder.encode(reportText);

    // 1. Hash plaintext before encryption for integrity / case identifiers.
    const reportHash = await hashSha256(reportBytes);

    // 2. Scrub file metadata client-side (placeholder).
    if (selectedFiles && selectedFiles.length > 0) {
      for (const file of Array.from(selectedFiles)) {
        const buffer = await file.arrayBuffer();
        const binary = new Uint8Array(buffer);
        await scrubMetadata(binary);
      }
    }

    // 3. Generate ephemeral key material per submission.
    const keyPair = await generateEphemeralKeyPair();

    // 4. Encrypt the report (placeholder, no real crypto yet).
    await encryptReport(reportBytes, keyPair, { associatedData: reportHash });

    // In a real app, the resulting ciphertext and hash would be sent to the untrusted backend here.
    setStatusMessage(
      'Report processed locally (simulation). No data was transmitted. Encryption will be wired in later.',
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Submit an anonymous report
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            This interface is designed for anonymous whistleblowing. Your report will eventually be
            encrypted in your browser before being stored on an untrusted server.
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
            <span>No data leaves your browser in this prototype.</span>
            <span>Later: client-side encryption with vetted libraries only.</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100"
            >
              Submit securely (simulated)
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


