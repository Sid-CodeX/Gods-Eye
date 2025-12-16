import React from 'react';

interface PanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({ title, description, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
    <div className="mb-4 space-y-1">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {description && <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>}
    </div>
    <div>{children}</div>
  </section>
);

export default Panel;


