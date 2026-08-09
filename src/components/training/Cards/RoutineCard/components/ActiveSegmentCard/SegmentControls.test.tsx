import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SegmentControls from './SegmentControls';

describe('SegmentControls', () => {
  it('shows Start before the first step begins', () => {
    render(
      <SegmentControls
        type="round"
        hasStarted={false}
        cardKey={0}
        isRunning={false}
        isPaused={false}
        onPause={jest.fn()}
        onStartOrResume={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /^empezar$/i })).toBeInTheDocument();
  });

  it('shows Pause when the timer is running', () => {
    render(
      <SegmentControls
        type="round"
        hasStarted={true}
        cardKey={0}
        isRunning={true}
        isPaused={false}
        onPause={jest.fn()}
        onStartOrResume={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
  });

  it('shows Resume when the timer is paused', () => {
    render(
      <SegmentControls
        type="rest"
        hasStarted={true}
        cardKey={1}
        isRunning={true}
        isPaused={true}
        onPause={jest.fn()}
        onStartOrResume={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /^reanudar$/i })).toBeInTheDocument();
  });

  it('starts with screen on from the primary action', async () => {
    const onStartOrResume = jest.fn();
    const user = userEvent.setup();

    render(
      <SegmentControls
        type="round"
        hasStarted={false}
        cardKey={0}
        isRunning={false}
        isPaused={false}
        preferredKeepScreenOn={true}
        onPause={jest.fn()}
        onStartOrResume={onStartOrResume}
        onReset={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /^empezar$/i }));

    expect(onStartOrResume).toHaveBeenCalledWith(true);
  });

  it('starts in pocket mode from the primary action when that is the saved preference', async () => {
    const onStartOrResume = jest.fn();
    const user = userEvent.setup();

    render(
      <SegmentControls
        type="round"
        hasStarted={false}
        cardKey={0}
        isRunning={false}
        isPaused={false}
        preferredKeepScreenOn={false}
        onPause={jest.fn()}
        onStartOrResume={onStartOrResume}
        onReset={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /^empezar$/i }));

    expect(onStartOrResume).toHaveBeenCalledWith(false);
  });

  it('shows pocket mode option in the dropdown', async () => {
    const user = userEvent.setup();

    render(
      <SegmentControls
        type="round"
        hasStarted={false}
        cardKey={0}
        isRunning={false}
        isPaused={false}
        onPause={jest.fn()}
        onStartOrResume={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /más opciones para empezar/i }),
    );

    expect(screen.getByRole('menuitem', { name: /modo bolsillo/i })).toBeInTheDocument();
  });

  it('shows screen lock indicator when active', () => {
    render(
      <SegmentControls
        type="round"
        hasStarted={true}
        cardKey={0}
        isRunning={true}
        isPaused={false}
        screenLockActive={true}
        onPause={jest.fn()}
        onStartOrResume={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByText(/pantalla activa/i)).toBeInTheDocument();
  });

  it('shows primary action tooltip on hover', async () => {
    const user = userEvent.setup();

    render(
      <SegmentControls
        type="round"
        hasStarted={false}
        cardKey={0}
        isRunning={false}
        isPaused={false}
        onPause={jest.fn()}
        onStartOrResume={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    await user.hover(screen.getByRole('button', { name: /^empezar$/i }));

    expect(
      screen.getByRole('tooltip', {
        name: /mantiene la pantalla encendida mientras corre el timer/i,
      }),
    ).toBeInTheDocument();
  });

  it('starts without screen lock from the battery saver option', async () => {
    const onStartOrResume = jest.fn();
    const user = userEvent.setup();

    render(
      <SegmentControls
        type="round"
        hasStarted={false}
        cardKey={0}
        isRunning={false}
        isPaused={false}
        onPause={jest.fn()}
        onStartOrResume={onStartOrResume}
        onReset={jest.fn()}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /más opciones para empezar/i }),
    );
    await user.click(
      screen.getByRole('menuitem', { name: /modo bolsillo/i }),
    );

    expect(onStartOrResume).toHaveBeenCalledWith(false);
  });

  it('fires pause and reset callbacks', async () => {
    const onPause = jest.fn();
    const onReset = jest.fn();
    const user = userEvent.setup();

    render(
      <SegmentControls
        type="round"
        hasStarted={true}
        cardKey={0}
        isRunning={true}
        isPaused={false}
        onPause={onPause}
        onStartOrResume={jest.fn()}
        onReset={onReset}
      />,
    );

    await user.click(screen.getByRole('button', { name: /pausar/i }));
    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
