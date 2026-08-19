import { act, renderHook, waitFor } from '@testing-library/react';
import { mockMatchMedia } from '@/test-helpers/mockMatchMedia';
import { useLandscapeExpanded } from './useLandscapeExpanded';

describe('useLandscapeExpanded', () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia(false);
  });

  afterEach(() => {
    media.restore();
  });

  it('does not expand before the routine starts', async () => {
    act(() => {
      media.setLandscape(true);
    });

    const { result } = renderHook(() =>
      useLandscapeExpanded({ hasStarted: false }),
    );

    await waitFor(() => {
      expect(result.current.isExpanded).toBe(false);
    });
  });

  it('expands in landscape after the routine starts', async () => {
    const { result, rerender } = renderHook(
      ({ hasStarted }) => useLandscapeExpanded({ hasStarted }),
      { initialProps: { hasStarted: false } },
    );

    rerender({ hasStarted: true });

    act(() => {
      media.setLandscape(true);
    });

    await waitFor(() => {
      expect(result.current.isExpanded).toBe(true);
    });
  });

  it('does not expand when disabled', async () => {
    const { result } = renderHook(() =>
      useLandscapeExpanded({ hasStarted: true, disabled: true }),
    );

    act(() => {
      media.setLandscape(true);
    });

    await waitFor(() => {
      expect(result.current.isExpanded).toBe(false);
    });
  });

  it('does not expand when finished', async () => {
    const { result } = renderHook(() =>
      useLandscapeExpanded({ hasStarted: true, isFinished: true }),
    );

    act(() => {
      media.setLandscape(true);
    });

    await waitFor(() => {
      expect(result.current.isExpanded).toBe(false);
    });
  });

  it('allows manual dismiss until returning to portrait', async () => {
    const { result } = renderHook(() =>
      useLandscapeExpanded({ hasStarted: true }),
    );

    act(() => {
      media.setLandscape(true);
    });

    await waitFor(() => {
      expect(result.current.isExpanded).toBe(true);
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isExpanded).toBe(false);

    act(() => {
      media.setLandscape(true);
    });

    expect(result.current.isExpanded).toBe(false);

    act(() => {
      media.setLandscape(false);
    });

    act(() => {
      media.setLandscape(true);
    });

    await waitFor(() => {
      expect(result.current.isExpanded).toBe(true);
    });
  });
});
