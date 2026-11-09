import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { PWAProvider } from './contexts/PWAContext.jsx';
import { PricingProvider } from './contexts/PricingContext.jsx';

// Register PWA Service Worker for offline capability & instant caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✓ PWA Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('PWA Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PWAProvider>
        <PricingProvider>
          <App />
        </PricingProvider>
      </PWAProvider>
    </AuthProvider>
  </StrictMode>,
);
