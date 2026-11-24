// EDU CLICK – Desktop Bridge & Platform Services (Tauri + Windows PWA)

declare global {
  interface Window {
    __TAURI__?: {
      invoke: (cmd: string, args?: any) => Promise<any>;
    };
  }
}

export interface DesktopSystemInfo {
  platform: 'WINDOWS' | 'MACOS' | 'LINUX' | 'WEB';
  osVersion: string;
  appVersion: string;
  deviceName: string;
  isStandalone: boolean;
  isTauri: boolean;
}

// 1. Detect if running inside Tauri native runtime
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && !!window.__TAURI__;
};

// 2. Detect if running inside Windows Installable PWA (Standalone window)
export const isPwa = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

// 3. Retrieve system hardware & device info for cross-device synchronization
export const getDesktopSystemInfo = async (): Promise<DesktopSystemInfo> => {
  const isStandalone = isPwa();
  const tauriActive = isTauri();

  if (tauriActive && window.__TAURI__) {
    try {
      const info = await window.__TAURI__.invoke('get_system_info');
      return {
        platform: info.platform || 'WINDOWS',
        osVersion: info.os_version || 'Windows 10/11',
        appVersion: info.app_version || '4.0.0',
        deviceName: info.device_name || 'Windows Desktop PC',
        isStandalone: true,
        isTauri: true,
      };
    } catch (e) {
      console.warn('Failed to invoke Tauri get_system_info', e);
    }
  }

  // Fallback to browser navigator detection
  const ua = navigator.userAgent;
  let os = 'Windows 10/11 PC';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11 64-bit';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux Desktop';

  return {
    platform: 'WINDOWS',
    osVersion: os,
    appVersion: '4.0.0',
    deviceName: `${os} (${isStandalone ? 'Installed PWA' : 'Web App'})`,
    isStandalone,
    isTauri: false,
  };
};

// 4. Send Desktop Action Center Notification
export const sendDesktopNotification = async (title: string, body: string): Promise<void> => {
  if (isTauri() && window.__TAURI__) {
    try {
      await window.__TAURI__.invoke('send_desktop_notification', {
        payload: { title, body },
      });
      return;
    } catch (e) {
      console.warn('Tauri notification error, falling back to Web API', e);
    }
  }

  // Web / PWA Notification API
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/brand/icon-192.png',
        badge: '/brand/badge-72.png',
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/brand/icon-192.png',
          badge: '/brand/badge-72.png',
        });
      }
    }
  }
};

// 5. Native File Handling – Save PDF receipts / notes to Downloads folder
export const saveFileToDesktop = async (filename: string, content: string): Promise<string> => {
  if (isTauri() && window.__TAURI__) {
    try {
      const savedPath = await window.__TAURI__.invoke('save_file_to_desktop', {
        filename,
        content,
      });
      return savedPath;
    } catch (e) {
      console.warn('Tauri save file error, falling back to browser download', e);
    }
  }

  // Web / PWA Download fallback
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return `Downloads/${filename}`;
};

// 6. Fullscreen Video Classroom Mode
export const toggleLiveFullscreen = async (): Promise<boolean> => {
  if (isTauri() && window.__TAURI__) {
    try {
      return await window.__TAURI__.invoke('toggle_live_fullscreen');
    } catch (e) {
      console.warn('Tauri fullscreen error', e);
    }
  }

  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    return true;
  } else {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
    return false;
  }
};
