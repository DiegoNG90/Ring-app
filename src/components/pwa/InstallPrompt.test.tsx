import { act, render, screen, waitFor } from '@testing-library/react';
import InstallPrompt from './InstallPrompt';

describe('InstallPrompt', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
        onchange: null,
      })),
    });
  });

  afterEach(() => {
    delete document.body.dataset.trainingExpanded;
  });

  it('hides the install banner while training fullscreen is active', async () => {
    render(<InstallPrompt />);

    act(() => {
      const event = new Event('beforeinstallprompt', {
        cancelable: true,
      }) as Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: 'dismissed' }>;
      };

      event.prompt = jest.fn().mockResolvedValue(undefined);
      event.userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(event);
    });

    expect(screen.getByText(/Instalar Ring Training/i)).toBeInTheDocument();

    await act(async () => {
      document.body.dataset.trainingExpanded = 'true';
    });

    await waitFor(() => {
      expect(screen.queryByText(/Instalar Ring Training/i)).not.toBeInTheDocument();
    });
  });
});
