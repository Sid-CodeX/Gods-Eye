import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:text-white bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/80 border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight dark:text-white text-slate-900">GodsEye</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors dark:text-slate-300 dark:hover:text-white text-slate-600 hover:text-slate-900" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
            <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors dark:text-slate-300 dark:hover:text-white text-slate-600 hover:text-slate-900" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How it Works</a>
            <a href="#security" className="text-sm text-slate-300 hover:text-white transition-colors dark:text-slate-300 dark:hover:text-white text-slate-600 hover:text-slate-900" onClick={(e) => { e.preventDefault(); document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' }); }}>Security</a>
          </nav>

          {/* Status & CTA */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1.5 dark:bg-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-xs font-medium text-green-400">SYSTEM SECURE</span>
            </div>
            <Link
              to="/submit"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/50"
            >
              Secure Submit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-16 md:py-24 dark:bg-transparent bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-10 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(147, 197, 253, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Protocol Status */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-600/30 px-4 py-1.5 backdrop-blur-sm dark:bg-blue-600/30 bg-blue-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 dark:text-blue-300 text-blue-700">V3.0 ENCRYPTION PROTOCOL ACTIVE</span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl dark:text-white text-slate-900">
            Truth in the{' '}
            <span className="text-slate-400 dark:text-slate-400 text-slate-600">Shadows</span>. Security in the{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Light</span>.
          </h1>

          {/* Tagline */}
          <p className="mb-8 text-lg text-slate-300 md:text-xl dark:text-slate-300 text-slate-600">
            The world's most secure platform for anonymous whistleblowing. End-to-end encrypted. Zero logs. 100% confidential. Your identity never leaves your device.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/submit"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white transition-all hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Start Secure Submission
            </Link>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-slate-500 hover:bg-slate-700/50 dark:border-slate-600 dark:bg-slate-800/50 dark:text-white dark:hover:border-slate-500 dark:hover:bg-slate-700/50 border-slate-300 bg-slate-100 text-slate-900 hover:border-slate-400 hover:bg-slate-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Key Metrics Bar */}
      <section className="border-y border-slate-700/50 bg-slate-800/30 px-6 py-8 dark:border-slate-700/50 dark:bg-slate-800/30 border-slate-200 bg-slate-100">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-white md:text-4xl dark:text-white text-slate-900">AES-256</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600">ENCRYPTION STANDARD</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-white md:text-4xl dark:text-white text-slate-900">0</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600">LOGS KEPT</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-white md:text-4xl dark:text-white text-slate-900">100%</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600">UPTIME RELIABILITY</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-white md:text-4xl dark:text-white text-slate-900">Global</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600">SERVER DISTRIBUTION</div>
          </div>
        </div>
      </section>

      {/* Core Infrastructure Section */}
      <section id="features" className="relative px-6 py-16 md:py-24 dark:bg-transparent bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-start justify-between">
            <div>
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400 dark:text-blue-400 text-blue-600">CORE INFRASTRUCTURE</div>
              <h2 id="security" className="mb-4 text-3xl font-bold md:text-4xl dark:text-white text-slate-900">Ironclad Security Architecture</h2>
              <p className="max-w-2xl text-slate-300 dark:text-slate-300 text-slate-600">
                We utilize military-grade encryption protocols and a decentralized network structure to ensure your identity remains completely anonymous, even from us.
              </p>
            </div>
            <button className="hidden rounded-lg border border-red-500/50 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-900/30 md:flex items-center gap-2 dark:border-red-500/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border-red-300 bg-red-50 text-red-600 hover:bg-red-100">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Quick Exit
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 border-slate-200 bg-slate-50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20 dark:bg-blue-600/20 bg-blue-100">
                <svg className="h-6 w-6 text-blue-400 dark:text-blue-400 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold dark:text-white text-slate-900">Total Anonymity</h3>
              <p className="text-sm text-slate-300 dark:text-slate-300 text-slate-600">
                We utilize Tor onion routing and do not log IP addresses, browser fingerprints, or metadata. Your identity is mathematically unprovable.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 border-slate-200 bg-slate-50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20 dark:bg-purple-600/20 bg-purple-100">
                <svg className="h-6 w-6 text-purple-400 dark:text-purple-400 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold dark:text-white text-slate-900">End-to-End Encryption</h3>
              <p className="text-sm text-slate-300 dark:text-slate-300 text-slate-600">
                Data is encrypted on your device before transmission using AES-256. Only the recipient with the private key can decrypt your submission.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 border-slate-200 bg-slate-50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/20 dark:bg-green-600/20 bg-green-100">
                <svg className="h-6 w-6 text-green-400 dark:text-green-400 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold dark:text-white text-slate-900">Legal Shielding</h3>
              <p className="text-sm text-slate-300 dark:text-slate-300 text-slate-600">
                Our system is designed to provide plausible deniability. We offer resources and encrypted channels to verify legal aid for whistleblowers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-16 md:py-24 dark:bg-transparent bg-slate-50">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl dark:text-white text-slate-900">How It Works</h2>
            <p className="text-slate-300 dark:text-slate-300 text-slate-600">A simplified three-step process to ensure your safety.</p>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 hidden w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-blue-600 md:block dark:from-blue-600 dark:via-purple-600 dark:to-blue-600 from-blue-400 via-purple-400 to-blue-400"></div>

            {/* Steps */}
            <div className="space-y-12">
              <div className="relative flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-slate-800 dark:border-blue-600 dark:bg-slate-800 border-blue-500 bg-slate-100">
                  <svg className="h-6 w-6 text-blue-400 dark:text-blue-400 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300 dark:bg-slate-700 dark:text-slate-300 bg-slate-200 text-slate-700">Step 01</span>
                    <h3 className="text-lg font-semibold dark:text-white text-slate-900">Connect Securely</h3>
                  </div>
                  <p className="text-slate-300 dark:text-slate-300 text-slate-600">
                    Access our SecureDrop interface. For maximum security, we recommend using the Tor Browser. No javascript is required for submission.
                  </p>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-purple-600 bg-slate-800 dark:border-purple-600 dark:bg-slate-800 border-purple-500 bg-slate-100">
                  <svg className="h-6 w-6 text-purple-400 dark:text-purple-400 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300 dark:bg-slate-700 dark:text-slate-300 bg-slate-200 text-slate-700">Step 02</span>
                    <h3 className="text-lg font-semibold dark:text-white text-slate-900">Upload Evidence</h3>
                  </div>
                  <p className="text-slate-300 dark:text-slate-300 text-slate-600">
                    Drag and drop documents, images, or audio files. Our system automatically scrubs metadata (EXIF, author data) before encryption begins.
                  </p>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-slate-800 dark:border-blue-600 dark:bg-slate-800 border-blue-500 bg-slate-100">
                  <svg className="h-6 w-6 text-blue-400 dark:text-blue-400 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300 dark:bg-slate-700 dark:text-slate-300 bg-slate-200 text-slate-700">Step 03</span>
                    <h3 className="text-lg font-semibold dark:text-white text-slate-900">Receive Secure Key</h3>
                  </div>
                  <p className="text-slate-300 dark:text-slate-300 text-slate-600">
                    You will receive a randomly generated cryptographic key. This is the ONLY way to check for responses or updates on your case. Do not lose it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="px-6 py-16 md:py-24 dark:bg-transparent bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl dark:text-white text-slate-900">Ready to break the silence?</h2>
          <p className="mb-8 text-lg text-slate-300 dark:text-slate-300 text-slate-600">
            Your voice matters. Your identity is safe. Take the first step towards transparency.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/submit"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white transition-all hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/50"
            >
              Submit a Report
            </Link>
            <button className="rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-slate-500 hover:bg-slate-700/50 dark:border-slate-600 dark:bg-slate-800/50 dark:text-white dark:hover:border-slate-500 dark:hover:bg-slate-700/50 border-slate-300 bg-slate-100 text-slate-900 hover:border-slate-400 hover:bg-slate-200">
              Download PGP Key
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-400 dark:text-slate-400 text-slate-500">
            For higher security, access this site via Tor Browser at{' '}
            <span className="font-mono text-blue-400 dark:text-blue-400 text-blue-600">godseyexyz...onion</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/80 px-6 py-8 dark:border-slate-700/50 dark:bg-slate-900/80 border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold dark:text-white text-slate-900">GodsEye</div>
              <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500">
                © 2023 GodsEye Platform. All rights reserved. This platform is operated by an independent non-profit organization dedicated to transparency.
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-400 dark:text-slate-400 text-slate-500">
            <a href="#" className="hover:text-white transition-colors dark:hover:text-white hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors dark:hover:text-white hover:text-slate-900">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors dark:hover:text-white hover:text-slate-900">Canary</a>
            <a href="#" className="hover:text-white transition-colors dark:hover:text-white hover:text-slate-900">PGP Key</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
