import { act, renderHook, waitFor } from '@testing-library/react';
import { useSegmentTimer } from './useSegmentTimer';

async function advanceTimer(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}

describe('useSegmentTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('inicializa con el tiempo total', () => {
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 30,
        type: 'round',
        cardKey: 0,
        hasStarted: false,
      }),
    );

    expect(result.current.timeLeft).toBe(30);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('cuenta regresivamente cuando está corriendo', async () => {
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 5,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
      }),
    );

    expect(result.current.isRunning).toBe(true);

    await advanceTimer(2000);

    expect(result.current.timeLeft).toBe(3);
    expect(result.current.progress).toBe(40);
  });

  it('pausa el conteo al pausar', async () => {
    const onPause = jest.fn();
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 5,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
        onPause,
      }),
    );

    await advanceTimer(1000);

    act(() => {
      result.current.toggleTimer();
    });

    expect(onPause).toHaveBeenCalled();
    expect(result.current.isPaused).toBe(true);

    const timeBeforePause = result.current.timeLeft;
    await advanceTimer(3000);

    expect(result.current.timeLeft).toBe(timeBeforePause);
  });

  it('reanuda el conteo tras pausar', async () => {
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 5,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
      }),
    );

    act(() => {
      result.current.toggleTimer();
    });

    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.toggleTimer();
    });

    expect(result.current.isPaused).toBe(false);
    expect(result.current.isRunning).toBe(true);

    await advanceTimer(1000);
    expect(result.current.timeLeft).toBe(4);
  });

  it('llama onStart al empezar en el primer paso', () => {
    const onStart = jest.fn();
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 5,
        type: 'round',
        cardKey: 0,
        hasStarted: false,
        onStart,
      }),
    );

    act(() => {
      result.current.toggleTimer();
    });

    expect(onStart).toHaveBeenCalled();
    expect(result.current.isRunning).toBe(true);
  });

  it('llama onPreFinish a los 10 segundos restantes en un round largo', async () => {
    const onPreFinish = jest.fn();
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 12,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
        onPreFinish,
      }),
    );

    await advanceTimer(2000);

    expect(onPreFinish).toHaveBeenCalledTimes(1);
    expect(result.current.timeLeft).toBe(10);
  });

  it('no llama onPreFinish en segmentos rest', async () => {
    const onPreFinish = jest.fn();
    renderHook(() =>
      useSegmentTimer({
        totalTime: 15,
        type: 'rest',
        cardKey: 1,
        hasStarted: true,
        onPreFinish,
      }),
    );

    await advanceTimer(5000);

    expect(onPreFinish).not.toHaveBeenCalled();
  });

  it('no llama onPreFinish si el round dura 10 segundos o menos', async () => {
    const onPreFinish = jest.fn();
    renderHook(() =>
      useSegmentTimer({
        totalTime: 10,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
        onPreFinish,
      }),
    );

    await advanceTimer(5000);

    expect(onPreFinish).not.toHaveBeenCalled();
  });

  it('llama onComplete al llegar a cero', async () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 2,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
        onComplete,
      }),
    );

    await advanceTimer(2000);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.progress).toBe(100);
  });

  it('no dispara onComplete más de una vez', async () => {
    const onComplete = jest.fn();
    renderHook(() =>
      useSegmentTimer({
        totalTime: 1,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
        onComplete,
      }),
    );

    await advanceTimer(3000);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('resetea el timer local en el primer paso', () => {
    const onReset = jest.fn();
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 5,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
        onReset,
      }),
    );

    act(() => {
      result.current.toggleTimer();
    });

    act(() => {
      result.current.resetTimer();
    });

    expect(onReset).toHaveBeenCalled();
    expect(result.current.timeLeft).toBe(5);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('solo delega onReset sin resetear local cuando cardKey > 0', async () => {
    const onReset = jest.fn();
    const { result, rerender } = renderHook(
      (props: { cardKey: number }) =>
        useSegmentTimer({
          totalTime: 3,
          type: 'rest',
          cardKey: props.cardKey,
          hasStarted: true,
          onReset,
        }),
      { initialProps: { cardKey: 1 } },
    );

    await advanceTimer(1000);
    const timeBeforeReset = result.current.timeLeft;

    act(() => {
      result.current.resetTimer();
    });

    expect(onReset).toHaveBeenCalled();
    expect(result.current.timeLeft).toBe(timeBeforeReset);

    rerender({ cardKey: 2 });

    expect(result.current.timeLeft).toBe(3);
    expect(result.current.isRunning).toBe(true);
  });

  it('reinicia refs y tiempo al cambiar cardKey', () => {
    const onPreFinish = jest.fn();
    const { result, rerender } = renderHook(
      (props: { cardKey: number; totalTime: number; type: 'round' | 'rest' }) =>
        useSegmentTimer({
          totalTime: props.totalTime,
          type: props.type,
          cardKey: props.cardKey,
          hasStarted: true,
          onPreFinish,
        }),
      {
        initialProps: { cardKey: 0, totalTime: 12, type: 'round' as const },
      },
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onPreFinish).toHaveBeenCalledTimes(1);

    rerender({ cardKey: 1, totalTime: 5, type: 'rest' });

    expect(result.current.timeLeft).toBe(5);
    expect(onPreFinish).toHaveBeenCalledTimes(1);
  });

  it('auto-inicia cuando hasStarted pasa a true en un segmento nuevo', () => {
    const { result, rerender } = renderHook(
      (props: { hasStarted: boolean; cardKey: number }) =>
        useSegmentTimer({
          totalTime: 5,
          type: 'round',
          cardKey: props.cardKey,
          hasStarted: props.hasStarted,
        }),
      { initialProps: { hasStarted: false, cardKey: 0 } },
    );

    expect(result.current.isRunning).toBe(false);

    rerender({ hasStarted: true, cardKey: 1 });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('no permite toggle cuando el segmento ya completó', async () => {
    const onPause = jest.fn();
    const { result } = renderHook(() =>
      useSegmentTimer({
        totalTime: 1,
        type: 'round',
        cardKey: 0,
        hasStarted: true,
        onPause,
      }),
    );

    await advanceTimer(1000);

    act(() => {
      result.current.toggleTimer();
    });

    expect(onPause).not.toHaveBeenCalled();
  });
});
