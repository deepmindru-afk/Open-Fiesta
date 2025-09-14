/**
 * PWA Configuration utilities
 * Handles PWA-specific settings and environment variables
 */

export interface PWAConfig {
  name: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  startUrl: string;
  scope: string;
  disableInDev: boolean;
}

export interface ServiceWorkerConfig {
  updateCheckInterval: number;
  skipWaiting: boolean;
  clientsClaim: boolean;
}

export interface PushNotificationConfig {
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
  vapidSubject?: string;
}

/**
 * Get PWA configuration from environment variables
 */
export function getPWAConfig(): PWAConfig {
  return {
    name: process.env.NEXT_PUBLIC_PWA_NAME || 'Open Fiesta - AI Chat Platform',
    shortName: process.env.NEXT_PUBLIC_PWA_SHORT_NAME || 'Open Fiesta',
    themeColor: process.env.NEXT_PUBLIC_PWA_THEME_COLOR || '#000000',
    backgroundColor: process.env.NEXT_PUBLIC_PWA_BACKGROUND_COLOR || '#000000',
    display: (process.env.NEXT_PUBLIC_PWA_DISPLAY as PWAConfig['display']) || 'standalone',
    startUrl: process.env.NEXT_PUBLIC_PWA_START_URL || '/',
    scope: process.env.NEXT_PUBLIC_PWA_SCOPE || '/',
    disableInDev: process.env.NEXT_PUBLIC_PWA_DISABLE_DEV === 'true',
  };
}

/**
 * Get service worker configuration
 */
export function getServiceWorkerConfig(): ServiceWorkerConfig {
  return {
    updateCheckInterval: parseInt(process.env.NEXT_PUBLIC_SW_UPDATE_CHECK_INTERVAL || '60000', 10),
    skipWaiting: true,
    clientsClaim: true,
  };
}

/**
 * Get push notification configuration
 */
export function getPushNotificationConfig(): PushNotificationConfig {
  return {
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidSubject: process.env.VAPID_SUBJECT,
  };
}

/**
 * Check if PWA features should be enabled
 */
export function isPWAEnabled(): boolean {
  const config = getPWAConfig();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Disable PWA in development if configured to do so
  if (isDevelopment && config.disableInDev) {
    return false;
  }
  
  return true;
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check if the app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if the app can be installed (beforeinstallprompt is available)
 */
export function canInstall(): boolean {
  if (typeof window === 'undefined') return false;
  
  // This will be set by the beforeinstallprompt event handler
  return !!(window as any).deferredPrompt;
}

/**
 * Get the app installation source
 */
export function getInstallSource(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  if (isStandalone()) {
    return 'installed';
  }
  
  if (canInstall()) {
    return 'installable';
  }
  
  return 'browser';
}

/**
 * PWA feature detection utilities
 */
export const PWAFeatures = {
  serviceWorker: isServiceWorkerSupported,
  pushNotifications: isPushNotificationSupported,
  standalone: isStandalone,
  installable: canInstall,
} as const;

/**
 * Default PWA manifest data
 */
export const DEFAULT_MANIFEST = {
  name: 'Open Fiesta - AI Chat Platform',
  short_name: 'Open Fiesta',
  description: 'A powerful AI chat platform supporting multiple models with offline capabilities',
  start_url: '/',
  display: 'standalone' as const,
  background_color: '#000000',
  theme_color: '#000000',
  orientation: 'portrait-primary' as const,
  scope: '/',
  lang: 'en',
  categories: ['productivity', 'utilities', 'education'],
} as const;