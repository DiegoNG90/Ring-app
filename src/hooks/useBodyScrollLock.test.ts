import { renderHook } from '@testing-library/react';
import { useBodyScrollLock } from './useBodyScrollLock';

describe('useBodyScrollLock', () => {
  afterEach(() => {
    document.body.style.overflow = '';
    delete document.body.dataset.trainingExpanded;
  });

  it('locks body scroll and marks training as expanded', () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.dataset.trainingExpanded).toBe('true');
  });

  it('restores body scroll and clears training expanded flag on unlock', () => {
    document.body.style.overflow = 'auto';

    const { rerender } = renderHook(
      ({ locked }) => useBodyScrollLock(locked),
      { initialProps: { locked: true } },
    );

    rerender({ locked: false });

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.dataset.trainingExpanded).toBeUndefined();
  });

  it('cleans up on unmount', () => {
    document.body.style.overflow = 'auto';

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    unmount();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.dataset.trainingExpanded).toBeUndefined();
  });
});
