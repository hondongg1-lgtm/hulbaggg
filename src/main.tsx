import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AppUserFlow from './AppUserFlow.tsx';
import DashboardApp from './DashboardApp.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const path = window.location.pathname;
const search = window.location.search;

const isUserFlow = path === '/user' || search.includes('user=true');
const isDashboardFlow = path === '/admin' || path === '/advertiser' ||
                        search.includes('admin=true') || search.includes('advertiser=true');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isUserFlow ? (
      <AppUserFlow />
    ) : isDashboardFlow ? (
      <DashboardApp />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>
);
