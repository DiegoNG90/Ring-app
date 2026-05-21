import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SegmentControls from './SegmentControls';

describe('SegmentControls', () => {
  it('muestra Empezar antes de iniciar el primer paso', () => {
    render(
      <SegmentControls
        type="round"
        hasStarted={false}
        cardKey={0}
        isRunning={false}
        isPaused={false}
        onToggle={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /empezar/i })).toBeInTheDocument();
  });

  it('muestra Pausar cuando el timer está corriendo', () => {
    render(
      <SegmentControls
        type="round"
        hasStarted={true}
        cardKey={0}
        isRunning={true}
        isPaused={false}
        onToggle={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
  });

  it('muestra Reanudar cuando el timer está pausado', () => {
    render(
      <SegmentControls
        type="rest"
        hasStarted={true}
        cardKey={1}
        isRunning={true}
        isPaused={true}
        onToggle={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /reanudar/i })).toBeInTheDocument();
  });

  it('dispara callbacks de toggle y reset', async () => {
    const onToggle = jest.fn();
    const onReset = jest.fn();
    const user = userEvent.setup();

    render(
      <SegmentControls
        type="round"
        hasStarted={false}
        cardKey={0}
        isRunning={false}
        isPaused={false}
        onToggle={onToggle}
        onReset={onReset}
      />,
    );

    await user.click(screen.getByRole('button', { name: /empezar/i }));
    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
