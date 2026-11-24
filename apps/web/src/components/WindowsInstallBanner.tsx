import React, { useState, useEffect } from 'react';
import { Monitor, Download, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { isPwa, isTauri } from '../services/desktop';

export const WindowsInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone desktop app
    if (isPwa() || isTauri()) {
      return;
    }

    // Check if Windows OS
    const isWindows = navigator.userAgent.includes('Windows');
    if (!isWindows) {
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      console.log('EDU CLICK PWA installed successfully on Windows');
    });

    // Also show banner on Windows if prompt hasn't fired yet
    const dismissed = localStorage.getItem('educlick_windows_banner_dismissed');
    if (!dismissed) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // In Edge/Chrome without direct event, inform how to install or launch desktop script
      alert('To install EDU CLICK on Windows:\n1. Click the "Install" or "App Available" icon in your browser address bar (Edge or Chrome).\n2. Or run launch_windows.ps1 in the apps/desktop folder.');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('educlick_windows_banner_dismissed', 'true');
  };

  if (!showBanner || installed) return null;

  return (
    <div className="bg-gradient-to-r from-[#142B4F] via-[#1E3A8A] to-[#0F1E36] text-white border-b border-blue-500/30 px-4 py-2.5 transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0 shadow">
            <Monitor className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wide text-white">EDU CLICK for Windows 10 & 11</span>
              <span className="px-1.5 py-0.5 rounded bg-[#14B8A6]/20 text-[#14B8A6] font-bold text-[10px]">
                Desktop App
              </span>
            </div>
            <p className="text-slate-300 text-[11px] hidden md:block">
              Enjoy high-performance live classes, native notifications, and offline timetable access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install on Windows</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
