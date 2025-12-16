import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './pages/AppLayout';
import HomePage from './pages/HomePage';
import SubmissionPage from './pages/SubmissionPage';
import CaseDashboardPage from './pages/CaseDashboardPage';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AppLayout />}>
            <Route path="/submit" element={<SubmissionPage />} />
            <Route path="/cases" element={<CaseDashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);


