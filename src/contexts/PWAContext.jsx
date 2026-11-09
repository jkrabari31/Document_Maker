import React, { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext(null);

export function usePWA() {
  return useContext(PWAContext);
}

export function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [platform, setPlatform] = useState('desktop'); // 'android' | 'ios' | 'desktop'
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Detect device platform
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform('ios');
    } else {
      setPlatform('desktop');
    }

    // 2. Check if already running in standalone PWA window
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e) => {
      setIsInstalled(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayChange);
    }

    // 3. Monitor network connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Capture native beforeinstallprompt for Android & Desktop Chrome/Edge
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      const dismissed = sessionStorage.getItem('dastavej_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Track successful install event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      console.log('✓ Dastavej Master PWA successfully installed');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayChange);
      }
    };
  }, []);

  // Trigger browser's native install prompt
  const installApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          setShowInstallBanner(false);
          return true;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else if (platform === 'ios') {
      alert('iPhone / iPad પર ઍપ ઇન્સ્ટોલ કરવા માટે સફારીમાં નીચે શેર (Share) આઇકન દબાવો અને "Add to Home Screen" પસંદ કરો.');
    } else {
      alert('આ બ્રાઉઝરમાં ઍપ પહેલેથી ઇન્સ્ટોલ થયેલ છે અથવા બ્રાઉઝર એડ્રેસ બારમાં આપેલા Install આઇકન પર ક્લિક કરો.');
    }
    return false;
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    try {
      sessionStorage.setItem('dastavej_pwa_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOnline,
        platform,
        showInstallBanner,
        installApp,
        dismissBanner
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

