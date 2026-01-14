import React from 'react';

export interface Case {
  case_id: string;
  created_at: number;
  expires_at: number | null;
}

interface CaseListProps {
  cases: Case[];
  selectedCase: Case | null;
  isLoading: boolean;
  onCaseSelect: (caseItem: Case) => void;
}

const CaseList: React.FC<CaseListProps> = ({ cases, selectedCase, isLoading, onCaseSelect }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading cases...</span>
        </div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">No cases found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {cases.map((caseItem) => (
        <button
          key={caseItem.case_id}
          onClick={() => onCaseSelect(caseItem)}
          className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
            selectedCase?.case_id === caseItem.case_id
              ? 'border-primary-500 bg-primary-50 shadow-md dark:border-primary-400 dark:bg-primary-900/20'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  selectedCase?.case_id === caseItem.case_id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <code className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {caseItem.case_id.substring(0, 8)}...
                </code>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Created {new Date(caseItem.created_at * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            {selectedCase?.case_id === caseItem.case_id && (
              <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default CaseList;


