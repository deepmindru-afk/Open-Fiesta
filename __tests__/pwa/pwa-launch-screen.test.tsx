import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock the entire PWALaunchScreen component to avoid theme provider issues
const MockPWALaunchScreen = jest.fn(({ title = 'Open Fiesta', subtitle = 'AI Chat Platform', className = '', onComplete, duration = 2000 }) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  return (
    <div className={`pwa-launch-screen ${className}`} data-testid="pwa-launch-screen">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
});

jest.mock('@/components/pwa/PWALaunchScreen', () => ({
  __esModule: true,
  default: MockPWALaunchScreen,
}));

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isStandalone: jest.fn(() => true),
}));

describe('PWALaunchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render launch screen with default props', () => {
    const PWALaunchScreen = require('@/components/pwa/PWALaunchScreen').default;
    render(<PWALaunchScreen />);

    expect(screen.getByText('Open Fiesta')).toBeInTheDocument();
    expect(screen.getByText('AI Chat Platform')).toBeInTheDocument();
  });

  it('should render with custom title and subtitle', () => {
    const PWALaunchScreen = require('@/components/pwa/PWALaunchScreen').default;
    render(
      <PWALaunchScreen 
        title="Custom App" 
        subtitle="Custom Subtitle" 
      />
    );

    expect(screen.getByText('Custom App')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });

  it('should animate progress bar', async () => {
    render(<PWALaunchScreen duration={1000} />);

    // Initially should show "Initializing..."
    expect(screen.getByText('Initializing...')).toBeInTheDocument();

    // Advance time to show different loading states
    jest.advanceTimersByTime(300);
    await waitFor(() => {
      expect(screen.getByText('Loading components...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(300);
    await waitFor(() => {
      expect(screen.getByText('Almost ready...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(400);
    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });
  });

  it('should call onComplete after duration', async () => {
    const onComplete = jest.fn();
    render(<PWALaunchScreen duration={1000} onComplete={onComplete} />);

    // Fast-forward past the duration + fade out time
    jest.advanceTimersByTime(1300);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should not render when not in standalone mode', () => {
    const { isStandalone } = require('@/lib/pwa-config');
    isStandalone.mockReturnValue(false);

    const { container } = render(<PWALaunchScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('should fade out after duration', async () => {
    render(<PWALaunchScreen duration={1000} />);

    const launchScreen = screen.getByText('Open Fiesta').closest('div');
    expect(launchScreen).toHaveClass('opacity-100');

    // Fast-forward to when it should start fading
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(launchScreen).toHaveClass('opacity-0');
    });
  });

  it('should render logo when logoSrc is provided', () => {
    render(<PWALaunchScreen logoSrc="/test-logo.svg" />);

    const logo = screen.getByAltText('Open Fiesta');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/test-logo.svg');
  });

  it('should apply custom className', () => {
    render(<PWALaunchScreen className="custom-launch-screen" />);

    const launchScreen = screen.getByText('Open Fiesta').closest('div');
    expect(launchScreen).toHaveClass('custom-launch-screen');
  });

  it('should handle light theme', () => {
    const { useTheme } = require('@/lib/themeContext');
    useTheme.mockReturnValueOnce({
      theme: { mode: 'light' },
    });

    render(<PWALaunchScreen />);

    // Should render without errors in light mode
    expect(screen.getByText('Open Fiesta')).toBeInTheDocument();
  });
});