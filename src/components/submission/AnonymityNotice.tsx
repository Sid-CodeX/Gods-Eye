import React from 'react';

const AnonymityNotice: React.FC = () => {
  return (
    <div className="space-y-2 rounded-xl border border-amber-300/70 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-600/50 dark:bg-amber-900/20 dark:text-amber-200">
      <div className="font-semibold tracking-tight">Stay anonymous</div>
      <ul className="list-disc space-y-1 pl-4">
        <li>Do not include your name, email, or any direct identifiers in the report text or files.</li>
        <li>Remove metadata from documents and images before uploading. This UI will later help automate that step.</li>
        <li>Avoid sending reports from work or home networks if possible.</li>
        <li>
          This prototype does not transmit data. In production, reports will be encrypted in your browser before
          leaving your device.
        </li>
      </ul>
    </div>
  );
};

export default AnonymityNotice;


