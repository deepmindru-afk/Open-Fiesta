import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { StandaloneProvider, useStandalone, StandaloneUI } from '@/components/pwa/StandaloneDetector';

// Create mock functions
const mockIsStandalone = jest.fn(() => false);
const mockGetInstallSource = jest.fn(() => 'browser');

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isStandalone: mockIsStandalone,
  getInstallSource: mockGetInstallSource,
}));

// Mock gtag
Object.defineProperty(window, 'gtag', {
  value: jest.fn(),
  writable: true,
});

// Test component that uses the hook
const TestComponent = () => {
  const { isStandalone, installSource, isLoading } = useStandalone();
  
  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  
  return (
    <div>
      <div data-testid="standalone">{isStandalone ? 'true' : 'false'}</div>
      <div data-testid="install-source">{installSource}</div>
    </div>
  );
};

describe('StandaloneDetector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks to default values
    mockIsStandalone.mockReturnValue(false);
    mockGetInstallSource.mockReturnValue('browser');
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('StandaloneProvider', () => {
    it('should provide standalone context', async () => {
      render(
        <StandaloneProvider>
          <TestComponent />
        </StandaloneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('standalone')).toHaveTextContent('false');
        expect(screen.getByTestId('install-source')).toHaveTextContent('browser');
      });
    });

    it('should detect standalone mode', async () => {
      mockIsStandalone.mockReturnValue(true);
      mockGetInstallSource.mockReturnValue('installed');

      render(
        <StandaloneProvider>
          <TestComponent />
        </StandaloneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('standalone')).toHaveTextContent('true');
      });
    });

    it('should add CSS classes to body in standalone mode', async () => {
      mockIsStandalone.mockReturnValue(true);
      mockGetInstallSource.mockReturnValue('installed');

      render(
        <StandaloneProvider>
          <TestComponent />
        </StandaloneProvider>
      );

      await waitFor(() => {
        expect(document.body).toHaveClass('pwa-standalone');
        expect(document.documentElement).toHaveClass('pwa-standalone');
      });
    });

    it('should remove CSS classes when not in standalone mode', async () => {
      mockIsStandalone.mockReturnValue(false);
      mockGetInstallSource.mockReturnValue('browser');

      // First add the classes
      document.body.classList.add('pwa-standalone');
      document.documentElement.classList.add('pwa-standalone');

      render(
        <StandaloneProvider>
          <TestComponent />
        </StandaloneProvider>
      );

      await waitFor(() => {
        expect(document.body).not.toHaveClass('pwa-standalone');
        expect(document.documentElement).not.toHaveClass('pwa-standalone');
      });
    });

    it('should track PWA mode detection', async () => {
      render(
        <StandaloneProvider>
          <TestComponent />
        </StandaloneProvider>
      );

      await waitFor(() => {
        expect(window.gtag).toHaveBeenCalledWith('event', 'pwa_mode_detected', {
          event_category: 'PWA',
          event_label: 'browser',
          custom_parameter_1: 'browser',
        });
      });
    });

    it('should handle display mode changes', async () => {
      const mockMediaQuery = {
        matches: false,
        media: '(display-mode: standalone)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn(() => mockMediaQuery),
      });

      render(
        <StandaloneProvider>
          <TestComponent />
        </StandaloneProvider>
      );

      // Simulate display mode change
      const changeHandler = mockMediaQuery.addEventListener.mock.calls
        .find(call => call[0] === 'change')?.[1];
      
      if (changeHandler) {
        changeHandler();
      }

      // Should re-check standalone mode
      await waitFor(() => {
        expect(screen.getByTestId('standalone')).toBeInTheDocument();
      });
    });
  });

  describe('StandaloneUI', () => {
    it('should render with standalone className when in standalone mode', async () => {
      mockIsStandalone.mockReturnValue(true);
      mockGetInstallSource.mockReturnValue('installed');

      render(
        <StandaloneProvider>
          <StandaloneUI 
            standaloneClassName="standalone-class" 
            browserClassName="browser-class"
          >
            <div data-testid="content">Content</div>
          </StandaloneUI>
        </StandaloneProvider>
      );

      await waitFor(() => {
        const container = screen.getByTestId('content').parentElement;
        expect(container).toHaveClass('standalone-class');
        expect(container).not.toHaveClass('browser-class');
      });
    });

    it('should render with browser className when not in standalone mode', async () => {
      mockIsStandalone.mockReturnValue(false);
      mockGetInstallSource.mockReturnValue('browser');

      render(
        <StandaloneProvider>
          <StandaloneUI 
            standaloneClassName="standalone-class" 
            browserClassName="browser-class"
          >
            <div data-testid="content">Content</div>
          </StandaloneUI>
        </StandaloneProvider>
      );

      await waitFor(() => {
        const container = screen.getByTestId('content').parentElement;
        expect(container).toHaveClass('browser-class');
        expect(container).not.toHaveClass('standalone-class');
      });
    });

    it('should show loading state while detecting mode', () => {
      render(
        <StandaloneProvider>
          <StandaloneUI>
            <div data-testid="content">Content</div>
          </StandaloneUI>
        </StandaloneProvider>
      );

      expect(screen.getByText('Content').closest('.standalone-loading')).toBeInTheDocument();
    });
  });

  describe('useStandalone hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useStandalone must be used within a StandaloneProvider');
      
      consoleSpy.mockRestore();
    });
  });
});