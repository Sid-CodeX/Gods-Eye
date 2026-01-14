import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Panel from '../components/layout/Panel';
import CaseList, { Case } from '../components/invigilator/CaseList';
import MessageList from '../components/invigilator/MessageList';
import StatusMessage from '../components/invigilator/StatusMessage';
import { Message, DecryptedMessage } from '../components/invigilator/MessageCard';
import { decryptReport, EncryptedPayload } from '../crypto/decrypt';
import { deriveSharedSecret } from '../crypto/keys';
import sodium from 'libsodium-wrappers';

/**
 * ============================
 * Environment Configuration
 * ============================
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const INVIGILATOR_API_TOKEN = import.meta.env.VITE_INVIGILATOR_API_TOKEN;
const INVIGILATOR_UI_SECRET = import.meta.env.VITE_INVIGILATOR_UI_SECRET;

/**
 * ============================
 * Utilities
 * ============================
 */
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

/**
 * ============================
 * Types
 * ============================
 */
// Types are now imported from components

/**
 * ============================
 * Component
 * ============================
 */
const InvigilatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uiSecretFromUrl = searchParams.get('secret');

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<Map<number, DecryptedMessage>>(new Map());

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState<number | null>(null);

  /** ⚠️ MVP ONLY — do NOT keep private keys in frontend for production */
  const [invigilatorPrivateKey, setInvigilatorPrivateKey] = useState<Uint8Array | null>(null);

  /**
   * ============================
   * Authorization & Init
   * ============================
   */
  useEffect(() => {
    if (!INVIGILATOR_UI_SECRET) {
      setStatusMessage('Error: UI secret not configured');
      return;
    }
    if (!uiSecretFromUrl || uiSecretFromUrl !== INVIGILATOR_UI_SECRET) {
      setStatusMessage('Error: Invalid UI secret. Access denied.');
      setIsAuthorized(false);
      return;
    }
    if (!INVIGILATOR_API_TOKEN) {
      setStatusMessage('Error: API token not configured');
      return;
    }
    setIsAuthorized(true);
    loadCases();
    loadPrivateKey();
  }, [uiSecretFromUrl]);

  /**
   * ============================
   * Load Private Key (MVP)
   * ============================
   */
  const loadPrivateKey = () => {
    const privateKeyHex = import.meta.env.VITE_INVIGILATOR_PRIVATE_KEY;
    if (!privateKeyHex) {
      setStatusMessage('Warning: Private key not configured. Decryption disabled.');
      return;
    }
    const keyBytes = new Uint8Array(
      privateKeyHex.match(/.{1,2}/g)?.map((b: string) => parseInt(b, 16)) || []
    );
    setInvigilatorPrivateKey(keyBytes);
  };


  /**
   * ============================
   * API Calls
   * ============================
   */
  const loadCases = async () => {
    setIsLoading(true);
    setStatusMessage('Loading cases...');
    try {
      const res = await fetch(`${API_BASE}/inv/cases`, {
        headers: { 'X-Invigilator-Token': INVIGILATOR_API_TOKEN },
      });
      if (!res.ok) throw new Error(`Failed to load cases: ${res.statusText}`);
      const data = await res.json();
      setCases(data);
      setStatusMessage(`Loaded ${data.length} case(s)`);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (caseId: string) => {
    setIsLoadingMessages(true);
    setStatusMessage('Loading messages...');
    try {
      const res = await fetch(`${API_BASE}/inv/cases/${caseId}/messages`, {
        headers: { 'X-Invigilator-Token': INVIGILATOR_API_TOKEN },
      });
      if (!res.ok) throw new Error(`Failed to load messages: ${res.statusText}`);
      const data = await res.json();
      setMessages(data);
      setStatusMessage(`Loaded ${data.length} message(s)`);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  /**
   * ============================
   * Decrypt Message
   * ============================
   */
  const decryptMessage = async (message: Message) => {
    if (!invigilatorPrivateKey) {
      setStatusMessage('Error: Private key unavailable. Check VITE_INVIGILATOR_PRIVATE_KEY in .env');
      return;
    }

    if (!message.ephemeral_public_key) {
      setStatusMessage('Error: Ephemeral public key missing from message');
      return;
    }

    setIsDecrypting(message.id);
    setStatusMessage(`Decrypting message #${message.seq}...`);

    try {
      await sodium.ready;

      // Convert base64 strings to Uint8Array
      const ciphertext = base64ToUint8(message.ciphertext);
      const nonce = base64ToUint8(message.nonce);
      const ephemeralPublicKey = base64ToUint8(message.ephemeral_public_key);

      // Derive shared secret using invigilator's private key and ephemeral public key
      // This produces the same shared secret that was used during encryption
      const sharedSecret = await deriveSharedSecret(invigilatorPrivateKey, ephemeralPublicKey);

      // Create encrypted payload
      const payload: EncryptedPayload = {
        ciphertext,
        nonce,
      };

      // Decrypt (this internally uses KDF to derive encryption key)
      const decryptedBytes = await decryptReport(payload, sharedSecret);
      const decryptedJson = uint8ToString(decryptedBytes);
      const decrypted: DecryptedMessage = JSON.parse(decryptedJson);

      // Store decrypted message
      setDecryptedMessages(prev => new Map(prev).set(message.id, decrypted));
      setStatusMessage(`✓ Message #${message.seq} decrypted successfully`);
    } catch (err: any) {
      console.error('Decryption error:', err);
      setStatusMessage(`Error: Decryption failed - ${err.message}`);
    } finally {
      setIsDecrypting(null);
    }
  };

  /**
   * ============================
   * Access Denied
   * ============================
   */
  if (!isAuthorized) {
    return (
      <Panel title="Access Denied">
        <p className="text-red-600">{statusMessage}</p>
        <p className="text-sm mt-2">
          Visit: <code className="ml-2 px-2 py-1 bg-slate-200 rounded">/inv?secret=YOUR_UI_SECRET</code>
        </p>
      </Panel>
    );
  }

  /**
   * ============================
   * Render Dashboard
   * ============================
   */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Invigilator Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage and decrypt whistleblower cases. All data is encrypted end-to-end.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
      </div>

      {/* Status Message */}
      <StatusMessage message={statusMessage} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cases List */}
        <Panel
          title="Cases"
          description={`${cases.length} case(s) found`}
        >
          <CaseList
            cases={cases}
            selectedCase={selectedCase}
            isLoading={isLoading}
            onCaseSelect={(caseItem) => {
              setSelectedCase(caseItem);
              setMessages([]);
              setDecryptedMessages(new Map());
              loadMessages(caseItem.case_id);
            }}
          />
        </Panel>

        {/* Messages for Selected Case */}
        {selectedCase ? (
          <Panel
            title={`Messages - Case ${selectedCase.case_id.substring(0, 8)}...`}
            description={isLoadingMessages ? 'Loading...' : `${messages.length} message(s)`}
          >
            <MessageList
              messages={messages}
              decryptedMessages={decryptedMessages}
              isLoading={isLoadingMessages}
              isDecrypting={isDecrypting}
              canDecrypt={!!invigilatorPrivateKey}
              onDecrypt={decryptMessage}
            />
          </Panel>
        ) : (
          <Panel title="Select a Case" description="Choose a case from the list to view messages">
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Select a case from the left to view and decrypt messages
              </p>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
};

export default InvigilatorPage;
