import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RepeatedRoutine from './RepeatedRoutine';
import type { Training } from '@/types/Trainings';
import { Sound } from '@/lib/utils/sound';

const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockStop = jest.fn();

jest.mock('@/lib/utils/sound', () => ({
  Sound: jest.fn(() => ({
    play: mockPlay,
    stop: mockStop,
    pause: jest.fn(),
  })),
}));

function getInteractiveStartButtons() {
  return screen
    .getAllByRole('button', { name: /^empezar$/i })
    .filter((btn) => !btn.closest('[aria-disabled="true"]'));
}

function createHiitTraining(overrides: Partial<Training> = {}): Training {
  return {
    training_id: 6,
    training_title: 'Functional 3 laps light',
    training_description: 'HIIT funcional, 3 vueltas',
    round_id: 1,
    round_number: 4,
    duration_seconds: 1,
    rest_seconds: 0,
    repetitions: 3,
    interval_seconds: 0,
    ...overrides,
  };
}

async function advanceMs(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}

describe('RepeatedRoutine', () => {
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

  it('renders a single RoutineCard when repetitions <= 1', () => {
    render(<RepeatedRoutine training={createHiitTraining({ repetitions: 0 })} />);

    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.queryByText(/^Ciclo 1$/)).not.toBeInTheDocument();
  });

  it('stacks N cards showing Ciclo 1..N labels for HIIT', () => {
    render(<RepeatedRoutine training={createHiitTraining({ repetitions: 3 })} />);

    expect(screen.getByText('Ciclo 1')).toBeInTheDocument();
    expect(screen.getByText('Ciclo 2')).toBeInTheDocument();
    expect(screen.getByText('Ciclo 3')).toBeInTheDocument();
    expect(screen.getAllByText('Round 1/4')).toHaveLength(3);
  });

  it('only the first cycle card is interactive', () => {
    render(<RepeatedRoutine training={createHiitTraining({ repetitions: 3 })} />);

    const disabledWrappers = document.querySelectorAll('[aria-disabled="true"]');
    expect(disabledWrappers).toHaveLength(2);

    expect(getInteractiveStartButtons()).toHaveLength(1);
  });

  it('auto-starts the second cycle after the first completes', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <RepeatedRoutine
        training={createHiitTraining({
          repetitions: 2,
          round_number: 1,
          duration_seconds: 1,
        })}
      />,
    );

    await user.click(getInteractiveStartButtons()[0]);
    mockPlay.mockClear();

    await advanceMs(1000);

    await waitFor(() => {
      expect(screen.queryByText('Ciclo 1')).not.toBeInTheDocument();
    });

    await advanceMs(500);

    expect(screen.getByText('Ciclo 2')).toBeInTheDocument();
    expect(mockPlay).toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: /pausar/i }),
    ).toBeInTheDocument();
  });

  it('removes completed cycle card from the stack after exit animation', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <RepeatedRoutine
        training={createHiitTraining({
          repetitions: 3,
          round_number: 1,
          duration_seconds: 1,
        })}
      />,
    );

    expect(screen.getAllByText(/^Ciclo \d$/)).toHaveLength(3);

    await user.click(getInteractiveStartButtons()[0]);
    await advanceMs(1000);

    await waitFor(() => {
      expect(screen.queryByText('Ciclo 1')).not.toBeInTheDocument();
    });

    expect(screen.getAllByText(/^Ciclo \d$/)).toHaveLength(2);
    expect(screen.getByText('Ciclo 2')).toBeInTheDocument();
    expect(screen.getByText('Ciclo 3')).toBeInTheDocument();
  });

  it('shows congratulations after all cycles complete', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <RepeatedRoutine
        training={createHiitTraining({
          repetitions: 2,
          round_number: 1,
          duration_seconds: 1,
        })}
      />,
    );

    await user.click(getInteractiveStartButtons()[0]);
    await advanceMs(1000);
    await advanceMs(500);

    await waitFor(() => {
      expect(screen.getByText('Ciclo 2')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /pausar/i }),
      ).toBeInTheDocument();
    });

    await advanceMs(1000);

    await waitFor(
      () => {
        expect(
          screen.getByText(/felicidades, has terminado la rutina/i),
        ).toBeInTheDocument();
      },
      { advanceTimers: jest.advanceTimersByTime },
    );

    expect(screen.queryByText('Ciclo 2')).not.toBeInTheDocument();
  });

  it('uses Sound instances per RoutineCard (bell on start)', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <RepeatedRoutine
        training={createHiitTraining({
          repetitions: 2,
          round_number: 1,
          duration_seconds: 1,
        })}
      />,
    );

    await user.click(getInteractiveStartButtons()[0]);
    expect(mockPlay).toHaveBeenCalled();
    expect(Sound).toHaveBeenCalled();
  });

  it('non-last cycles end with a trailing rest (4 rounds → 8 steps)', () => {
    render(
      <RepeatedRoutine
        training={createHiitTraining({
          repetitions: 3,
          round_number: 4,
          rest_seconds: 10,
        })}
      />,
    );

    const cycle1 = screen.getByText('Ciclo 1').closest('.space-y-6');
    const cycle2 = screen.getByText('Ciclo 2').closest('.space-y-6');
    const cycle3 = screen.getByText('Ciclo 3').closest('.space-y-6');

    expect(cycle1).not.toBeNull();
    expect(cycle2).not.toBeNull();
    expect(cycle3).not.toBeNull();

    expect(within(cycle1!).getByText(/Paso 1 de 8/)).toBeInTheDocument();
    expect(within(cycle2!).getByText(/Paso 1 de 8/)).toBeInTheDocument();
    expect(within(cycle3!).getByText(/Paso 1 de 7/)).toBeInTheDocument();
  });

  it('completes the first cycle only after the trailing rest', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <RepeatedRoutine
        training={createHiitTraining({
          repetitions: 3,
          round_number: 2,
          rest_seconds: 1,
          duration_seconds: 1,
        })}
      />,
    );

    await user.click(getInteractiveStartButtons()[0]);

    await advanceMs(3000);
    expect(screen.getByText('Ciclo 1')).toBeInTheDocument();

    await advanceMs(1000);

    await waitFor(() => {
      expect(screen.queryByText('Ciclo 1')).not.toBeInTheDocument();
    });
  });

  it('single-cycle routine (repetitions <= 1) ends with a round, not a rest', () => {
    render(
      <RepeatedRoutine
        training={createHiitTraining({
          repetitions: 1,
          round_number: 2,
          rest_seconds: 60,
          duration_seconds: 120,
        })}
      />,
    );

    expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument();
    expect(screen.queryByText(/^Ciclo 1$/)).not.toBeInTheDocument();
  });
});
