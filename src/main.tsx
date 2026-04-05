import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import RootRouter from './RootRouter';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[main.tsx] Root element not found');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <LanguageProvider>
          <RootRouter />
        </LanguageProvider>
      </AuthProvider>
    </StrictMode>
  );
}
