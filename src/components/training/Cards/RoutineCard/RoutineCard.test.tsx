import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoutineCard from './RoutineCard';
import type { Training } from '@/types/Trainings';
import { Sound } from '@/lib/utils/sound';

const mockPlay = jest.fn();
const mockStop = jest.fn();

jest.mock('@/lib/utils/sound', () => ({
  Sound: jest.fn(() => ({
    play: mockPlay,
    stop: mockStop,
    pause: jest.fn(),
  })),
}));

function createTraining(overrides: Partial<Training> = {}): Training {
  return {
    training_id: 1,
    training_title: 'Heavy Bag',
    training_description: 'Rutina de prueba',
    round_id: 1,
    round_number: 2,
    duration_seconds: 12,
    rest_seconds: 5,
    repetitions: 0,
    ...overrides,
  };
}

function getSoundSrc(callIndex: number): string | undefined {
  return (Sound as jest.Mock).mock.calls[callIndex]?.[0];
}

async function advanceRoutineTimer(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}

function getMainTimerInSegment(segmentType: 'round' | 'rest') {
  const segment = document.querySelector(
    `[data-segment-type="${segmentType}"]`,
  ) as HTMLElement | null;

  expect(segment).not.toBeNull();

  const timer = segment!.querySelector('.text-4xl');
  expect(timer).not.toBeNull();

  return timer as HTMLElement;
}

describe('RoutineCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('invalid or empty states', () => {
    it('shows message when no rounds are configured', () => {
      render(<RoutineCard training={createTraining({ round_number: 0 })} />);

      expect(
        screen.getByText(/no tiene rounds configurados/i),
      ).toBeInTheDocument();
    });
  });

  describe('initial render', () => {
    it('shows progress, active round and step bar', () => {
      render(<RoutineCard training={createTraining()} />);

      expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument();
      expect(screen.getByText('Round 1/2')).toBeInTheDocument();
      expect(
        screen.getByRole('list', { name: /progreso de la rutina/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /empezar/i }),
      ).toBeInTheDocument();
    });
  });

  describe('timer controls', () => {
    it('reproduce la campana al empezar', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 5,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));

      expect(mockPlay).toHaveBeenCalled();
      expect(getSoundSrc(0)).toBe('/sounds/boxing-bell-liviano.mp3');
      expect(
        screen.getByRole('button', { name: /pausar/i }),
      ).toBeInTheDocument();
    });

    it('detiene los sonidos al pausar', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 5,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      mockPlay.mockClear();
      mockStop.mockClear();

      await user.click(screen.getByRole('button', { name: /pausar/i }));

      expect(mockStop).toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: /reanudar/i }),
      ).toBeInTheDocument();
    });

    it('goes back to the first round when resetting during rest', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 2,
            duration_seconds: 2,
            rest_seconds: 3,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(2000);

      await waitFor(() => {
        expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument();
      expect(screen.getByText('Round 1/2')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /empezar/i }),
      ).toBeInTheDocument();
      expect(getMainTimerInSegment('round')).toHaveTextContent('0:02');
    });

    it('goes back to the first round when resetting on the second round', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 2,
            duration_seconds: 2,
            rest_seconds: 3,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(2000);

      await waitFor(() => {
        expect(
          screen.getByText(/Descanso · después del round 1/i),
        ).toBeInTheDocument();
      });

      await advanceRoutineTimer(3000);

      await waitFor(() => {
        expect(screen.getByText(/Paso 3 de 3/)).toBeInTheDocument();
        expect(screen.getByText('Round 2/2')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument();
      expect(screen.getByText('Round 1/2')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /empezar/i }),
      ).toBeInTheDocument();
    });

    it('shows Start again and allows the bell after reset on the first step', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 5,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await user.click(screen.getByRole('button', { name: /pausar/i }));
      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(
        screen.getByRole('button', { name: /empezar/i }),
      ).toBeInTheDocument();

      expect(getMainTimerInSegment('round')).toHaveTextContent('0:05');

      mockPlay.mockClear();
      await user.click(screen.getByRole('button', { name: /empezar/i }));

      expect(mockPlay).toHaveBeenCalled();
    });

    it('pausa el conteo y permite reanudar', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 5,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(1000);

      expect(getMainTimerInSegment('round')).toHaveTextContent('0:04');

      await user.click(screen.getByRole('button', { name: /pausar/i }));
      await advanceRoutineTimer(2000);

      expect(getMainTimerInSegment('round')).toHaveTextContent('0:04');

      await user.click(screen.getByRole('button', { name: /reanudar/i }));
      await advanceRoutineTimer(1000);

      expect(getMainTimerInSegment('round')).toHaveTextContent('0:03');
    });
  });

  describe('segment advance and sounds', () => {
    it('reproduce maderas a los 10 segundos restantes en un round', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 12,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      mockPlay.mockClear();

      await advanceRoutineTimer(2000);

      expect(mockPlay).toHaveBeenCalled();
      expect(getSoundSrc(1)).toBe('/sounds/maderas_pre_fin_round.mpeg');
    });

    it('avanza al descanso al completar un round', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 2,
            duration_seconds: 2,
            rest_seconds: 3,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(2000);

      await waitFor(() => {
        expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Descanso · después del round 1/i),
      ).toBeInTheDocument();

      expect(getMainTimerInSegment('rest')).toHaveTextContent('0:03');
    });

    it('muestra mensaje de rutina completada al terminar todos los segmentos', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 1,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(1000);

      await waitFor(() => {
        expect(screen.getByText(/rutina completada/i)).toBeInTheDocument();
      });
    });

    it('reinicia la rutina tras completarla', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 1,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(1000);

      await waitFor(() => {
        expect(screen.getByText(/rutina completada/i)).toBeInTheDocument();
      });

      await advanceRoutineTimer(2000);

      await waitFor(() => {
        expect(screen.getByText(/Paso 1 de 1/)).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /empezar/i }),
        ).toBeInTheDocument();
      });
    });

    it('reproduce campana al completar un segmento', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({
            round_number: 2,
            duration_seconds: 1,
            rest_seconds: 1,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      mockPlay.mockClear();

      await advanceRoutineTimer(1000);

      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    it('renderiza solo rounds cuando no hay descanso configurado', () => {
      render(
        <RoutineCard
          training={createTraining({
            round_number: 3,
            rest_seconds: 0,
          })}
        />,
      );

      expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument();
      expect(screen.queryByText('Descanso')).not.toBeInTheDocument();
    });
  });

  describe('HIIT mode', () => {
    function createHiitTraining(overrides: Partial<Training> = {}): Training {
      return createTraining({
        round_number: 4,
        duration_seconds: 2,
        rest_seconds: 1,
        repetitions: 3,
        ...overrides,
      });
    }

    it('shows Ciclo N in RoutineProgress when cycleNumber is set', () => {
      render(
        <RoutineCard
          training={createHiitTraining()}
          cycleNumber={2}
        />,
      );

      expect(screen.getByText('Ciclo 2')).toBeInTheDocument();
      expect(screen.queryByText(/^Round 1$/)).not.toBeInTheDocument();
      expect(screen.getByText('Round 1/4')).toBeInTheDocument();
    });

    it('shows Round N in RoutineProgress without cycleNumber', () => {
      render(<RoutineCard training={createHiitTraining()} />);

      expect(screen.getByText('Round 1')).toBeInTheDocument();
      expect(screen.queryByText(/^Ciclo 1$/)).not.toBeInTheDocument();
    });

    it('shows Descanso in RoutineProgress during rest even with cycleNumber', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createHiitTraining({ round_number: 2 })}
          cycleNumber={1}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(2000);

      await waitFor(() => {
        const progress = screen.getByText(/Paso 2 de 3/).parentElement;
        expect(progress).not.toBeNull();
        expect(within(progress!).getByText('Descanso')).toBeInTheDocument();
        expect(within(progress!).queryByText('Ciclo 1')).not.toBeInTheDocument();
      });
    });

    it('renders disabled preview with aria-disabled and Ciclo label', () => {
      render(
        <RoutineCard
          training={createHiitTraining()}
          disabled
          cycleNumber={3}
        />,
      );

      expect(screen.getByText('Ciclo 3')).toBeInTheDocument();
      const wrapper = document.querySelector('[aria-disabled="true"]');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('pointer-events-none');
    });

    it('calls onComplete instead of auto-reset when cycle finishes (controlled)', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onComplete = jest.fn();

      render(
        <RoutineCard
          training={createHiitTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 1,
          })}
          onComplete={onComplete}
          cycleNumber={1}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(1000);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      expect(screen.queryByText(/rutina completada/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/reiniciando/i)).not.toBeInTheDocument();
    });

    it('auto-starts timer and plays bell without pressing Empezar', async () => {
      render(
        <RoutineCard
          training={createHiitTraining({
            round_number: 1,
            rest_seconds: 0,
            duration_seconds: 3,
          })}
          autoStart
          cycleNumber={2}
        />,
      );

      expect(mockPlay).toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: /pausar/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /empezar/i }),
      ).not.toBeInTheDocument();

      await advanceRoutineTimer(1000);
      expect(getMainTimerInSegment('round')).toHaveTextContent('0:02');
    });

    it('does not auto-start when autoStart is false', () => {
      render(
        <RoutineCard
          training={createHiitTraining({ round_number: 1, rest_seconds: 0 })}
          cycleNumber={1}
        />,
      );

      expect(
        screen.getByRole('button', { name: /empezar/i }),
      ).toBeInTheDocument();
      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('stops sounds when becoming disabled', () => {
      const { rerender } = render(
        <RoutineCard
          training={createHiitTraining({ round_number: 1, rest_seconds: 0 })}
          cycleNumber={1}
        />,
      );

      mockStop.mockClear();

      rerender(
        <RoutineCard
          training={createHiitTraining({ round_number: 1, rest_seconds: 0 })}
          disabled
          cycleNumber={1}
        />,
      );

      expect(mockStop).toHaveBeenCalled();
    });
  });
});
