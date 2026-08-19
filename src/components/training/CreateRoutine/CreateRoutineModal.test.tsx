import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import { createRoutineAction } from '@/actions/training-actions';
import { CreateRoutineModal } from '@/components/training/CreateRoutine/CreateRoutineModal';
import { SUCCESS_REDIRECT_DELAY_MS } from '@/components/training/CreateRoutine/helpers';
import { ROUTINE_LIMIT_REACHED_MESSAGE } from '@/lib/routines/routine-limits';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/actions/training-actions', () => ({
  createRoutineAction: jest.fn(),
}));

describe('CreateRoutineModal', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function setupUser() {
    return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  }

  function openModal() {
    render(<CreateRoutineModal open onOpenChange={jest.fn()} />);
  }

  async function completeHiitFlow(user: ReturnType<typeof setupUser>) {
    openModal();

    await user.type(screen.getByLabelText(/nombre de la rutina/i), 'Rutina HIIT');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.selectOptions(screen.getByLabelText(/tipo de rutina/i), 'HIIT');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('radio', { name: '30"' }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('radio', { name: '10"' }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('radio', { name: '4' }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
  }

  it('sends the HIIT payload built through the stepper', async () => {
    const user = setupUser();
    (createRoutineAction as jest.Mock).mockResolvedValue({
      success: true,
      href: '/training/rutina-hiit-9',
    });

    await completeHiitFlow(user);
    await user.click(screen.getByRole('button', { name: /guardar rutina/i }));

    await waitFor(() => {
      expect(createRoutineAction).toHaveBeenCalledWith({
        name: 'Rutina HIIT',
        trainingType: 'HIIT',
        segmentDuration: 30,
        restDuration: 10,
        rounds: 4,
      });
    });
  });

  it('shows the success dialog before redirecting', async () => {
    const user = setupUser();
    (createRoutineAction as jest.Mock).mockResolvedValue({
      success: true,
      href: '/training/rutina-hiit-9',
    });

    await completeHiitFlow(user);
    await user.click(screen.getByRole('button', { name: /guardar rutina/i }));

    await waitFor(() => {
      expect(screen.getByTestId('creation-success-dialog')).toHaveAttribute(
        'open',
      );
    });

    expect(
      screen.getByText(/la estamos preparando y en breve te llevaremos allí/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('status-dialog-icon-success')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(SUCCESS_REDIRECT_DELAY_MS);
    });

    expect(push).toHaveBeenCalledWith('/training/rutina-hiit-9');
  });

  it('preserves state when going back', async () => {
    const user = setupUser();
    await completeHiitFlow(user);

    await user.click(screen.getByRole('button', { name: /volver/i }));
    expect(screen.getByRole('radio', { name: '4' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await user.click(screen.getByRole('button', { name: /volver/i }));
    expect(screen.getByRole('radio', { name: '10"' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('shows discard confirmation when canceling with draft data', async () => {
    const user = setupUser();
    openModal();

    await user.type(screen.getByLabelText(/nombre de la rutina/i), 'Borrador');
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(
      screen.getByRole('heading', { name: /descartar la rutina/i }),
    ).toBeInTheDocument();
  });

  it('shows the error dialog and does not redirect when creation fails', async () => {
    const user = setupUser();
    (createRoutineAction as jest.Mock).mockResolvedValue({
      success: false,
      fieldErrors: { name: 'Ya tenés una rutina con ese nombre y tipo' },
    });

    await completeHiitFlow(user);
    await user.click(screen.getByRole('button', { name: /guardar rutina/i }));

    await waitFor(() => {
      expect(screen.getByTestId('creation-error-dialog')).toHaveAttribute(
        'open',
      );
    });

    expect(
      screen.getByText(/ha ocurrido un error y no hemos podido crear tu rutina/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('status-dialog-icon-error')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(
      'Ya tenés una rutina con ese nombre y tipo',
    );

    act(() => {
      jest.advanceTimersByTime(SUCCESS_REDIRECT_DELAY_MS * 2);
    });
    expect(push).not.toHaveBeenCalled();
  });

  it('closes the error dialog with Entendido and keeps the inline error', async () => {
    const user = setupUser();
    (createRoutineAction as jest.Mock).mockResolvedValue({
      success: false,
      fieldErrors: { name: 'Ya tenés una rutina con ese nombre y tipo' },
    });

    await completeHiitFlow(user);
    await user.click(screen.getByRole('button', { name: /guardar rutina/i }));

    await waitFor(() => {
      expect(screen.getByTestId('creation-error-dialog')).toHaveAttribute(
        'open',
      );
    });

    await user.click(screen.getByRole('button', { name: /entendido/i }));

    await waitFor(() => {
      expect(screen.getByTestId('creation-error-dialog')).not.toHaveAttribute(
        'open',
      );
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ya tenés una rutina con ese nombre y tipo',
    );
  });

  it('surfaces the routine limit message returned by the server', async () => {
    const user = setupUser();
    (createRoutineAction as jest.Mock).mockResolvedValue({
      success: false,
      limitReached: true,
      error: ROUTINE_LIMIT_REACHED_MESSAGE,
    });

    await completeHiitFlow(user);
    await user.click(screen.getByRole('button', { name: /guardar rutina/i }));

    await waitFor(() => {
      expect(screen.getByTestId('creation-error-dialog')).toHaveAttribute(
        'open',
      );
    });

    expect(screen.getByRole('note')).toHaveTextContent(
      /alcanzaste el máximo de 5 rutinas/i,
    );
    expect(push).not.toHaveBeenCalled();
  });
});
