import { act, renderHook, waitFor } from '@testing-library/react';
import { mockMatchMedia } from '@/test-helpers/mockMatchMedia';
import { useViewportOrientation } from './useViewportOrientation';

describe('useViewportOrientation', () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia(false);
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 844,
    });
  });

  afterEach(() => {
    media.restore();
  });

  it('starts in portrait when matchMedia reports portrait', async () => {
    const { result } = renderHook(() => useViewportOrientation());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('updates to landscape when orientation changes', async () => {
    const { result } = renderHook(() => useViewportOrientation());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    act(() => {
      media.setLandscape(true);
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('falls back to viewport dimensions when matchMedia is unavailable', async () => {
    media.restore();
    window.matchMedia = undefined as unknown as typeof window.matchMedia;

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 400,
    });

    const { result } = renderHook(() => useViewportOrientation());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('cleans up listeners on unmount', () => {
    const removeEventListener = jest.fn();
    const addEventListener = jest.fn();

    media.restore();
    window.matchMedia = jest.fn(() => ({
      matches: false,
      media: '(orientation: landscape)',
      addEventListener,
      removeEventListener,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
      onchange: null,
    })) as unknown as typeof window.matchMedia;

    const { unmount } = renderHook(() => useViewportOrientation());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });
});
