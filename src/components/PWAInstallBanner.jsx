import React from 'react';
import { usePWA } from '../contexts/PWAContext';
import { Download, Smartphone, X, WifiOff, Sparkles, CheckCircle } from 'lucide-react';

export default function PWAInstallBanner() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    platform, 
    showInstallBanner, 
    installApp, 
    dismissBanner 
  } = usePWA();

  return (
    <>
      {/* Offline Status Alert Pill */}
      {!isOnline && (
        <aside className="pwa-offline-pill" role="status" aria-live="polite">
          <WifiOff size={15} />
          <span>ઑફલાઇન મોડ — ઇન્ટરનેટ વિના પણ દસ્તાવેજ મુસદ્દો તૈયાર કરી શકો છો.</span>
        </aside>
      )}

      {/* Floating Mobile Android/iOS Install Bar */}
      {!isInstalled && showInstallBanner && (
        <aside className="pwa-install-banner" role="banner" aria-label="Install App Banner">
          <div className="pwa-banner-content">
            <div className="pwa-banner-icon-badge">
              <img src="/pwa-icon.svg" alt="App Icon" width="34" height="34" />
            </div>
            <div className="pwa-banner-text">
              <div className="pwa-banner-title">
                <strong>દસ્તાવેજ માસ્ટર ઍપ</strong>
                <span className="pwa-banner-tag">PWA</span>
              </div>
              <p className="pwa-banner-desc">
                {platform === 'ios'
                  ? 'હોમ સ્ક્રીન પર ઍપ તરીકે ઉમેરો'
                  : 'ઝડપી ઉપયોગ અને ઑફલાઇન કામ માટે ઍપ ઇન્સ્ટોલ કરો'}
              </p>
            </div>
          </div>

          <div className="pwa-banner-actions">
            <button 
              type="button" 
              className="pwa-banner-install-btn"
              onClick={installApp}
              title="ઍપ ઇન્સ્ટોલ કરો"
            >
              <Download size={14} />
              <span>ઇન્સ્ટોલ</span>
            </button>
            <button 
              type="button" 
              className="pwa-banner-close-btn"
              onClick={dismissBanner}
              title="બંધ કરો"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

