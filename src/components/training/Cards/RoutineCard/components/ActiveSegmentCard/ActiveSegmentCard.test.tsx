import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActiveSegmentCard from './ActiveSegmentCard';

const training = {
  training_title: 'Heavy Bag',
  duration_seconds: 12,
  rest_seconds: 5,
};

function getMainTimerInSegment(segmentType: 'round' | 'rest') {
  const segment = document.querySelector(
    `[data-segment-type="${segmentType}"]`,
  ) as HTMLElement | null;

  expect(segment).not.toBeNull();

  const timer = segment!.querySelector('.text-4xl');
  expect(timer).not.toBeNull();

  return timer as HTMLElement;
}

async function advanceTimer(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}

describe('ActiveSegmentCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('render', () => {
    it('muestra el tiempo inicial del round', () => {
      render(
        <ActiveSegmentCard
          training={{ ...training, duration_seconds: 125 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={false}
        />,
      );

      expect(getMainTimerInSegment('round')).toHaveTextContent('2:05');
    });

    it('muestra título de descanso en segmento rest', () => {
      render(
        <ActiveSegmentCard
          training={training}
          type="rest"
          currentRound={1}
          totalRounds={2}
          cardKey={1}
          hasStarted={true}
        />,
      );

      expect(
        screen.getByText(/Descanso · después del round 1/i),
      ).toBeInTheDocument();
    });

    it('muestra error cuando la duración es cero', () => {
      render(
        <ActiveSegmentCard
          training={{ ...training, duration_seconds: 0 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={false}
        />,
      );

      expect(screen.getByText(/duración no válida/i)).toBeInTheDocument();
    });

    it('muestra error cuando el descanso es cero en segmento rest', () => {
      render(
        <ActiveSegmentCard
          training={{ ...training, rest_seconds: 0 }}
          type="rest"
          currentRound={1}
          totalRounds={2}
          cardKey={1}
          hasStarted={true}
        />,
      );

      expect(screen.getByText(/duración no válida.*descanso/i)).toBeInTheDocument();
    });

    it('muestra stats de descanso próximo como guión cuando no hay descanso', () => {
      render(
        <ActiveSegmentCard
          training={{ ...training, rest_seconds: 0 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={false}
        />,
      );

      expect(screen.getByText('Descanso próximo')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('controles del timer', () => {
    it('muestra botón Empezar cuando no ha iniciado', () => {
      render(
        <ActiveSegmentCard
          training={training}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={false}
        />,
      );

      expect(screen.getByRole('button', { name: /empezar/i })).toBeInTheDocument();
    });

    it('llama onStart al empezar', async () => {
      const onStart = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <ActiveSegmentCard
          training={{ ...training, duration_seconds: 5 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={false}
          onStart={onStart}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));

      expect(onStart).toHaveBeenCalled();
    });

    it('llama onPause al pausar', async () => {
      const onPause = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <ActiveSegmentCard
          training={{ ...training, duration_seconds: 5 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={true}
          onPause={onPause}
        />,
      );

      await user.click(screen.getByRole('button', { name: /pausar/i }));

      expect(onPause).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /reanudar/i })).toBeInTheDocument();
    });

    it('resetea el timer local en el primer paso', async () => {
      const onReset = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <ActiveSegmentCard
          training={{ ...training, duration_seconds: 5 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={true}
          onReset={onReset}
        />,
      );

      await user.click(screen.getByRole('button', { name: /pausar/i }));
      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(onReset).toHaveBeenCalled();
      expect(getMainTimerInSegment('round')).toHaveTextContent('0:05');
    });
  });

  describe('callbacks de timer', () => {
    it('llama onPreFinish a los 10 segundos restantes en un round', async () => {
      const onPreFinish = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <ActiveSegmentCard
          training={{ ...training, duration_seconds: 12 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={false}
          onPreFinish={onPreFinish}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceTimer(2000);

      expect(onPreFinish).toHaveBeenCalled();
    });

    it('no llama onPreFinish si el round dura 10 segundos o menos', async () => {
      const onPreFinish = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <ActiveSegmentCard
          training={{ ...training, duration_seconds: 10 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={false}
          onPreFinish={onPreFinish}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceTimer(5000);

      expect(onPreFinish).not.toHaveBeenCalled();
    });

    it('llama onComplete al agotar el tiempo', async () => {
      const onComplete = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <ActiveSegmentCard
          training={{ ...training, duration_seconds: 2 }}
          type="round"
          currentRound={1}
          totalRounds={1}
          cardKey={0}
          hasStarted={false}
          onComplete={onComplete}
        />,
      );

      await user.click(screen.getByRole('button', { name: /empezar/i }));
      await advanceTimer(2000);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });
});
