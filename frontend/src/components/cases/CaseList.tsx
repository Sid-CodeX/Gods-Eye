import React from 'react';

export interface CaseSummary {
  id: string;
  title: string;
  createdAt: string;
  status: 'new' | 'in_review' | 'closed';
}

interface CaseListProps {
  cases: CaseSummary[];
  selectedCaseId: string | null;
  onSelectCase: (id: string) => void;
}

const statusStyles: Record<CaseSummary['status'], string> = {
  new: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800',
  in_review: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800',
  closed: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600',
};

const CaseList: React.FC<CaseListProps> = ({ cases, selectedCaseId, onSelectCase }) => {
  return (
    <div className="space-y-2">
      {cases.map((caseItem) => {
        const isActive = caseItem.id === selectedCaseId;
        return (
          <button
            key={caseItem.id}
            type="button"
            onClick={() => onSelectCase(caseItem.id)}
            className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
              isActive
                ? 'border-primary-500 bg-primary-50/80 shadow-sm dark:bg-primary-900/30 dark:border-primary-400'
                : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-slate-900 dark:text-white">{caseItem.title}</div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                  statusStyles[caseItem.status]
                }`}
              >
                {caseItem.status === 'new'
                  ? 'New'
                  : caseItem.status === 'in_review'
                  ? 'In review'
                  : 'Closed'}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Received {caseItem.createdAt}</div>
          </button>
        );
      })}
      {cases.length === 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">No cases yet. New reports will appear here.</p>
      )}
    </div>
  );
};

export default CaseList;


