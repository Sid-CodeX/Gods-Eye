import React, { useState } from 'react';

interface ReplyBoxProps {
  onSend: (message: string) => void;
}

const ReplyBox: React.FC<ReplyBoxProps> = ({ onSend }) => {
  const [draft, setDraft] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="reply" className="sr-only">
        Reply
      </label>
      <textarea
        id="reply"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="min-h-[80px] w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-primary-400 dark:focus:bg-slate-600"
        placeholder="Write a reply to the whistleblower. Avoid including identifying details about them."
      />
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Messages will be encrypted end-to-end in the browser in production.</span>
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:focus-visible:ring-slate-700 dark:focus-visible:ring-offset-slate-800"
        >
          Send reply (simulated)
        </button>
      </div>
    </form>
  );
};

export default ReplyBox;


