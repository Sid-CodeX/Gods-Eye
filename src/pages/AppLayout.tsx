import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
              GE
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight dark:text-white">GodsEye Platform</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Anonymous whistleblowing interface</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4 text-sm">
              <NavLink
                to="/submit"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                  }`
                }
              >
                Submit report
              </NavLink>
              <NavLink
                to="/cases"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                  }`
                }
              >
                Case dashboard
              </NavLink>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/80 py-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <span>Client-side only prototype. No data is actually transmitted.</span>
          <span>Do not use for real disclosures.</span>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;


