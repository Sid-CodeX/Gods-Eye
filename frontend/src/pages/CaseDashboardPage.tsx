import React, { useMemo, useState } from 'react';
import Panel from '../components/layout/Panel';
import CaseList, { CaseSummary } from '../components/cases/CaseList';
import MessageThread, { ThreadMessage } from '../components/messaging/MessageThread';
import ReplyBox from '../components/messaging/ReplyBox';
import { generateEphemeralKeyPair } from '../crypto/keys';
import { decryptReport } from '../crypto/decrypt';
import { hashSha256 } from '../crypto/hash';

interface CaseWithMessages extends CaseSummary {
  encryptedSummary: Uint8Array;
  thread: ThreadMessage[];
}

// Dummy seed data. In a real app, this would be ciphertext from the backend.
const MOCK_CASES: CaseWithMessages[] = [
  {
    id: 'case-001',
    title: 'Potential financial irregularities in Q4 reporting',
    createdAt: '2025-11-02 14:21 UTC',
    status: 'in_review',
    encryptedSummary: new Uint8Array(),
    thread: [
      {
        id: 'm1',
        sender: 'whistleblower',
        body:
          'I noticed discrepancies between internal ledgers and what was reported externally. Several large transactions were reclassified without explanation.',
        sentAt: '2025-11-02 14:20 UTC',
      },
      {
        id: 'm2',
        sender: 'investigator',
        body:
          'Thank you for reporting this. Can you safely access any documentation that shows the original classifications?',
        sentAt: '2025-11-03 09:07 UTC',
      },
    ],
  },
  {
    id: 'case-002',
    title: 'Safety concerns in manufacturing facility',
    createdAt: '2025-11-10 08:05 UTC',
    status: 'new',
    encryptedSummary: new Uint8Array(),
    thread: [
      {
        id: 'm3',
        sender: 'whistleblower',
        body:
          'Protective equipment is not being replaced according to policy, and incident reports are being discouraged.',
        sentAt: '2025-11-10 08:02 UTC',
      },
    ],
  },
];

const CaseDashboardPage: React.FC = () => {
  const [cases, setCases] = useState<CaseWithMessages[]>(MOCK_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(MOCK_CASES[0]?.id ?? null);

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) ?? null,
    [cases, selectedCaseId],
  );

  async function ensureDecryptedSummary(_encrypted: Uint8Array): Promise<string> {
    // This function sketches the future flow for decrypting case metadata.
    // It does not actually decrypt anything yet.

    const ephemeralKeys = await generateEphemeralKeyPair();
    await decryptReport(
      {
        ciphertext: _encrypted,
        nonce: new Uint8Array(),
      },
      ephemeralKeys,
    );

    // Later, the return value would be the recovered plaintext summary.
    return '[decrypted case summary placeholder]';
  }

  async function handleSendReply(messageBody: string) {
    if (!selectedCase) return;

    const nowLabel = new Date().toISOString();

    // In the real system, this reply would be:
    // - encoded to bytes
    // - hashed with hashSha256
    // - encrypted with an ephemeral key
    const encoder = new TextEncoder();
    const bodyBytes = encoder.encode(messageBody);
    await hashSha256(bodyBytes);

    const newMessage: ThreadMessage = {
      id: `m-${Date.now()}`,
      sender: 'investigator',
      body: messageBody,
      sentAt: nowLabel,
    };

    setCases((current) =>
      current.map((caseItem) =>
        caseItem.id === selectedCase.id
          ? {
              ...caseItem,
              status: caseItem.status === 'new' ? 'in_review' : caseItem.status,
              thread: [...caseItem.thread, newMessage],
            }
          : caseItem,
      ),
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
      <Panel
        title="Cases"
        description="List of anonymous reports available to this investigator. Data shown here is mock only."
      >
        <CaseList
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={setSelectedCaseId}
        />
      </Panel>

      <Panel
        title="Case details"
        description="Two-way, end-to-end encrypted messaging will be wired here. This view assumes the backend is untrusted storage only."
      >
        {selectedCase ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{selectedCase.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Case ID {selectedCase.id} · Created {selectedCase.createdAt}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Summary will be decrypted client-side from ciphertext retrieved from the backend.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <p className="font-medium text-slate-800 dark:text-slate-200">Decryption flow (simulated)</p>
              <p className="mt-1">
                When this case is opened, the client will fetch ciphertext, derive or load the
                appropriate ephemeral keys, and call a function similar to{' '}
                <code className="rounded bg-slate-900 px-1 py-0.5 text-[11px] text-slate-100 dark:bg-slate-600 dark:text-slate-100">
                  decryptReport
                </code>{' '}
                to recover plaintext, never exposing it to the backend.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-700/70">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Message thread
              </div>
              <MessageThread messages={selectedCase.thread} />
            </div>

            <ReplyBox onSend={handleSendReply} />
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Select a case from the list to view details.</p>
        )}
      </Panel>
    </div>
  );
};

export default CaseDashboardPage;


