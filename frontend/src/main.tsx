import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './pages/AppLayout';
import HomePage from './pages/HomePage';
import SubmissionPage from './pages/SubmissionPage';
import CaseDashboardPage from './pages/CaseDashboardPage';
import ReportCasePage from './pages/ReportCasePage';
import CaseSubmissionPage from './pages/CaseSubmissionPage';
import CheckCasePage from './pages/CheckCasePage';
import InvigilatorPage from './pages/InvigilatorPage';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AppLayout />}>
            <Route path="/report-case" element={<ReportCasePage />} />
            <Route path="/submit/:caseId" element={<CaseSubmissionPage />} />
            <Route path="/check-case" element={<CheckCasePage />} />
            <Route path="/submit" element={<SubmissionPage />} />
            <Route path="/cases" element={<CaseDashboardPage />} />
            <Route path="/inv" element={<InvigilatorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);


