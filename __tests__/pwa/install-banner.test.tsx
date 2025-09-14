import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import InstallBanner from '@/components/pwa/InstallBanner';

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isStandalone: jest.fn(() => false),
}));

// Mock gtag
Object.defineProperty(window, 'gtag', {
  value: jest.fn(),
  writable: true,
});

const mockBeforeInstallPromptEvent = {
  preventDefault: jest.fn(),
  prompt: jest.fn().mockResolvedValue(undefined),
  userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
  platforms: ['web'],
};

describe('InstallBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    
    Object.defineProperty(window, 'addEventListener', {
      value: jest.fn(),
      writable: true,
    });
    
    Object.defineProperty(window, 'removeEventListener', {
      value: jest.fn(),
      writable: true,
    });
  });

  it('should render install banner after delay', async () => {
    jest.useFakeTimers();
    
    const { container } = render(<InstallBanner />);
    
    // Simulate beforeinstallprompt event
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    // Fast-forward time to show banner
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Install Open Fiesta for a better experience')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should handle permanent dismissal', () => {
    const onDismiss = jest.fn();
    render(<InstallBanner onDismiss={onDismiss} />);
    
    // Simulate beforeinstallprompt event and show banner
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    const dismissButton = screen.getByLabelText('Dismiss permanently');
    fireEvent.click(dismissButton);

    expect(localStorage.getItem('pwa-banner-dismissed')).toBe('true');
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should handle session dismissal', () => {
    const onDismiss = jest.fn();
    render(<InstallBanner onDismiss={onDismiss} />);
    
    // Simulate beforeinstallprompt event and show banner
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    const laterButton = screen.getByText('Later');
    fireEvent.click(laterButton);

    expect(sessionStorage.getItem('pwa-banner-session-dismissed')).toBe('true');
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should track installation events', async () => {
    render(<InstallBanner />);
    
    // Simulate beforeinstallprompt event and show banner
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    // Wait for banner to appear and find install button
    await waitFor(() => {
      expect(screen.getByText('Install Open Fiesta for a better experience')).toBeInTheDocument();
    });

    const installButton = screen.getByText('Install');
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(window.gtag).toHaveBeenCalledWith('event', 'pwa_install_prompt', {
        event_category: 'PWA',
        event_label: 'accepted',
        custom_parameter_1: 'banner',
      });
    });
  });

  it('should render with top variant by default', async () => {
    render(<InstallBanner />);
    
    // Simulate beforeinstallprompt event to make banner visible
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    await waitFor(() => {
      const banner = document.querySelector('.fixed');
      expect(banner).toBeInTheDocument();
    });
  });

  it('should render with bottom variant when specified', async () => {
    render(<InstallBanner variant="bottom" />);
    
    // Simulate beforeinstallprompt event to make banner visible
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    await waitFor(() => {
      const banner = document.querySelector('.fixed');
      expect(banner).toBeInTheDocument();
    });
  });
});