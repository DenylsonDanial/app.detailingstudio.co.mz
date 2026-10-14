import { useCallback, useEffect, useState } from 'react';

// ----------------------------------------------------------------------

const DISMISS_KEY = 'ds-pwa-install-dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return mediaStandalone || iosStandalone;
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/.test(ua);

  return isIos && isSafari;
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneDisplay);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    setIsInstalled(isStandaloneDisplay());
    setIsIos(isIosSafari());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !isInstalled;

  const showIosInstallHelp = isIos && !isInstalled;

  const showSuggestion = (canInstall || showIosInstallHelp) && !dismissed && !isInstalled;

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (outcome === 'accepted') {
      setIsInstalled(true);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  const dismissSuggestion = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore quota / private mode
    }
    setDismissed(true);
  }, []);

  return {
    canInstall,
    isInstalled,
    isIos,
    showIosInstallHelp,
    showSuggestion,
    promptInstall,
    dismissSuggestion,
  };
}
