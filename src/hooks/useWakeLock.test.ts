import { act, renderHook, waitFor } from '@testing-library/react';
import { useWakeLock } from './useWakeLock';

describe('useWakeLock', () => {
  let releaseMock: jest.Mock;
  let requestMock: jest.Mock;
  let sentinel: WakeLockSentinel;

  beforeEach(() => {
    releaseMock = jest.fn().mockResolvedValue(undefined);
    sentinel = {
      release: releaseMock,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatched: false,
      onrelease: null,
      type: 'screen',
    };

    requestMock = jest.fn().mockResolvedValue(sentinel);

    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: requestMock },
    });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock');
  });

  it('requests a screen wake lock when enabled', async () => {
    renderHook(() => useWakeLock({ enabled: true }));

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledWith('screen');
    });
  });

  it('releases the wake lock when disabled', async () => {
    const { rerender } = renderHook(
      ({ enabled }) => useWakeLock({ enabled }),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalled();
    });

    rerender({ enabled: false });

    await waitFor(() => {
      expect(releaseMock).toHaveBeenCalled();
    });
  });

  it('releases the wake lock on unmount', async () => {
    const { unmount } = renderHook(() => useWakeLock({ enabled: true }));

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(releaseMock).toHaveBeenCalled();
    });
  });

  it('re-acquires the wake lock when the page becomes visible again', async () => {
    renderHook(() => useWakeLock({ enabled: true }));

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledTimes(1);
    });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledTimes(2);
    });
  });

  it('reports unsupported when wakeLock is unavailable', () => {
    Reflect.deleteProperty(navigator, 'wakeLock');

    const { result } = renderHook(() => useWakeLock({ enabled: true }));

    expect(result.current.isSupported).toBe(false);
    expect(result.current.isActive).toBe(false);
  });

  it('re-acquires the wake lock after orientation changes', async () => {
    renderHook(() => useWakeLock({ enabled: true }));

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledTimes(2);
    });
  });
});
