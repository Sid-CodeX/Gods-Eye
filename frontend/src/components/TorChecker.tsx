import React, { useEffect, useState } from 'react';
import Panel from './layout/Panel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const TorChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTor, setIsTor] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkTor = async () => {
      try {
        const res = await fetch(`${API_BASE}/tor-check`);
        if (!res.ok) throw new Error("Failed to check Tor status");
        const data = await res.json();
        setIsTor(data.IsTor === true);
      } catch (err: any) {
        // Safe default: if we can't verify, deny access
        setIsTor(false);
      } finally {
        setLoading(false);
      }
    };
    checkTor();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <svg className="h-8 w-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
           </svg>
           <p className="text-slate-600 dark:text-slate-400">Verifying secure connection...</p>
        </div>
      </div>
    );
  }

  if (isTor === false) {
    return (
      <div className="max-w-2xl mx-auto mt-12 px-6">
        <Panel 
          title="Access Denied: Vulnerable Connection" 
          description="We detected that you are not using the Tor network."
        >
          <div className="flex flex-col items-center text-center p-6 space-y-6">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
              <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300">
              For your safety, identity protection, and anonymity, we require all connections to use the Tor Browser. Navigating this portal via standard browsers leaves traces that can compromise your identity.
            </p>
            
            <div className="w-full rounded-lg bg-orange-50 border border-orange-200 p-5 dark:bg-orange-900/20 dark:border-orange-800/50">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3 block text-left">How to Proceed:</h3>
              <ol className="text-sm text-left list-decimal list-inside space-y-2 text-orange-700 dark:text-orange-400">
                <li>Download the Tor Browser from <a href="https://torproject.org" target="_blank" rel="noreferrer" className="underline font-bold">torproject.org</a></li>
                <li>Install and open the Tor Browser</li>
                <li>Copy and paste our .onion address into the address bar</li>
              </ol>
            </div>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 rounded-lg bg-slate-200 px-6 py-2 font-semibold text-slate-800 hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Back to Home
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  return <>{children}</>;
};

export default TorChecker;
