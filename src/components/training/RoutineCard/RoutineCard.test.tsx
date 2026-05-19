import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoutineCard, { buildRoutineSegments } from './index';
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

describe('buildRoutineSegments', () => {
  it('returns empty array when there are no rounds', () => {
    expect(buildRoutineSegments(0, 30)).toEqual([]);
  });

  it('returns only rounds when rest is zero', () => {
    expect(buildRoutineSegments(3, 0)).toEqual([
      { type: 'round', round: 1 },
      { type: 'round', round: 2 },
      { type: 'round', round: 3 },
    ]);
  });

  it('inserts rest between rounds but not after the last one', () => {
    expect(buildRoutineSegments(2, 30)).toEqual([
      { type: 'round', round: 1 },
      { type: 'rest', round: 1 },
      { type: 'round', round: 2 },
    ]);
  });

  it('builds full sequence for multiple rounds with rest', () => {
    expect(buildRoutineSegments(3, 15)).toEqual([
      { type: 'round', round: 1 },
      { type: 'rest', round: 1 },
      { type: 'round', round: 2 },
      { type: 'rest', round: 2 },
      { type: 'round', round: 3 },
    ]);
  });
});

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

  describe('estados inválidos o vacíos', () => {
    it('muestra mensaje cuando no hay rounds configurados', () => {
      render(<RoutineCard training={createTraining({ round_number: 0 })} />);

      expect(
        screen.getByText(/no tiene rounds configurados/i),
      ).toBeInTheDocument();
    });
  });

  describe('render inicial', () => {
    it('muestra progreso, round activo y barra de pasos', () => {
      render(<RoutineCard training={createTraining()} />);

      expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument();
      expect(screen.getByText('Round 1/2')).toBeInTheDocument();
      expect(screen.getByRole('list', { name: /progreso de la rutina/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /empezar/i })).toBeInTheDocument();
    });

    it('muestra el tiempo inicial del round', () => {
      render(
        <RoutineCard
          training={createTraining({ duration_seconds: 125, rest_seconds: 0, round_number: 1 })}
        />,
      );

      expect(getMainTimerInSegment('round')).toHaveTextContent('2:05');
    });
  });

  describe('controles del timer', () => {
    it('reproduce la campana al empezar', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({ round_number: 1, rest_seconds: 0, duration_seconds: 5 })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));

      expect(mockPlay).toHaveBeenCalled();
      expect(getSoundSrc(0)).toBe('/sounds/boxing-bell-liviano.mp3');
      expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
    });

    it('detiene los sonidos al pausar', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({ round_number: 1, rest_seconds: 0, duration_seconds: 5 })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      mockPlay.mockClear();
      mockStop.mockClear();

      await user.click(screen.getByRole('button', { name: /pausar/i }));

      expect(mockStop).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /reanudar/i })).toBeInTheDocument();
    });

    it('vuelve a mostrar Empezar y permite campana tras reset en el primer paso', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({ round_number: 1, rest_seconds: 0, duration_seconds: 5 })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await user.click(screen.getByRole('button', { name: /pausar/i }));
      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(screen.getByRole('button', { name: /empezar/i })).toBeInTheDocument();

      expect(getMainTimerInSegment('round')).toHaveTextContent('0:05');

      mockPlay.mockClear();
      await user.click(screen.getByRole('button', { name: /empezar/i }));

      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe('avance de segmentos y sonidos', () => {
    it('reproduce maderas a los 10 segundos restantes en un round', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({ round_number: 1, rest_seconds: 0, duration_seconds: 12 })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      mockPlay.mockClear();

      await advanceRoutineTimer(2000);

      expect(mockPlay).toHaveBeenCalled();
      expect(getSoundSrc(1)).toBe('/sounds/maderas_pre_fin_round.mpeg');
    });

    it('no reproduce maderas si el round dura 10 segundos o menos', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({ round_number: 1, rest_seconds: 0, duration_seconds: 10 })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      (Sound as jest.Mock).mockClear();
      mockPlay.mockClear();

      await advanceRoutineTimer(5000);

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('avanza al descanso al completar un round', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<RoutineCard training={createTraining({ round_number: 2, duration_seconds: 2, rest_seconds: 3 })} />);

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceRoutineTimer(2000);

      await waitFor(() => {
        expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Descanso · después del round 1/i)).toBeInTheDocument();

      expect(getMainTimerInSegment('rest')).toHaveTextContent('0:03');
    });

    it('muestra mensaje de rutina completada al terminar todos los segmentos', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <RoutineCard
          training={createTraining({ round_number: 1, rest_seconds: 0, duration_seconds: 1 })}
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
          training={createTraining({ round_number: 1, rest_seconds: 0, duration_seconds: 1 })}
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
        expect(screen.getByRole('button', { name: /empezar/i })).toBeInTheDocument();
      });
    });
  });

  describe('barra de progreso', () => {
    it('marca el paso activo en la barra', () => {
      render(<RoutineCard training={createTraining({ round_number: 2, rest_seconds: 5 })} />);

      const progressList = screen.getByRole('list', { name: /progreso de la rutina/i });
      const steps = within(progressList).getAllByRole('listitem');

      expect(steps).toHaveLength(3);
      expect(steps[0]).toHaveAttribute('aria-current', 'step');
      expect(steps[1]).not.toHaveAttribute('aria-current');
    });
  });
});
