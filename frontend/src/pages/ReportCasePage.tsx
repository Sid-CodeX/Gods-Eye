import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from '../components/layout/Panel';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ReportCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNewCase = async () => {
    setIsLoading(true);
    setStatusMessage('Creating new case...');

    try {
      const response = await fetch(`${API_BASE}/cases/create`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to create case: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const caseId = data.case_id;

      if (!caseId) {
        throw new Error('Invalid response from server: missing case_id');
      }

      // Navigate to submission page with the case ID
      navigate(`/submit/${caseId}`);
    } catch (err: any) {
      console.error('Error creating case:', err);
      setStatusMessage(`Error: ${err.message || 'Failed to create case. Please try again.'}`);
      setIsLoading(false);
    }
  };

  const handleCheckExistingCase = () => {
    navigate('/check-case');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Anonymous Whistleblower Portal
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Create a new case to submit a report, or check the status of an existing case.
        </p>
      </div>

      <Panel
        title="Report Case Options"
        description="Choose an option to get started"
      >
        <div className="space-y-4">
          <button
            onClick={handleCreateNewCase}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Case
              </>
            )}
          </button>

          <button
            onClick={handleCheckExistingCase}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Check Existing Case
          </button>

          {statusMessage && (
            <div
              className={`mt-4 rounded-lg p-3 text-sm ${
                statusMessage.startsWith('Error')
                  ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                  : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
              }`}
              role="alert"
            >
              {statusMessage}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};

export default ReportCasePage;

