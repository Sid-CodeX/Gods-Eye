import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from '../components/layout/Panel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Message {
  ciphertext: string;
  nonce: string;
  hash: string;
  seq: number;
  created_at: number;
}

const CheckCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [caseId, setCaseId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchMessages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId.trim()) {
      setStatusMessage('Please enter a case ID');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Fetching messages...');

    try {
      const response = await fetch(`${API_BASE}/api/messages/list/${caseId}`);

      if (response.status === 404) {
        setStatusMessage('Case not found. Please check your case ID.');
        setMessages([]);
        setIsLoading(false);
        return;
      }

      if (response.status === 410) {
        setStatusMessage('This case has expired.');
        setMessages([]);
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
          ? `Found ${data.length} message(s) for this case.`
          : 'No messages found for this case yet.'
      );
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message}`);
      setMessages([]);
    } finally {
      setIsLoading(false);
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
        description="Input your case ID to retrieve messages"
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
              className={`rounded-lg p-3 text-sm ${
                statusMessage.startsWith('Error') || statusMessage.includes('not found') || statusMessage.includes('expired')
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
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                  Note: Messages are encrypted. Decryption requires the appropriate keys.
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default CheckCasePage;

