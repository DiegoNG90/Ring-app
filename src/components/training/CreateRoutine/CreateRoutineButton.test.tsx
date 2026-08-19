import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateRoutineButton } from './CreateRoutineButton';
import { MAX_USER_CREATED_ROUTINES } from '@/lib/routines/routine-limits';

jest.mock('./CreateRoutineModal', () => ({
  CreateRoutineModal: ({ open }: { open: boolean }) => (
    <div data-testid="create-routine-modal" data-open={open ? 'true' : 'false'} />
  ),
}));

describe('CreateRoutineButton', () => {
  it('is enabled and opens the modal while slots remain', async () => {
    const user = userEvent.setup();
    render(<CreateRoutineButton userCreatedCount={2} />);

    const button = screen.getByRole('button', { name: /nueva rutina/i });
    expect(button).toBeEnabled();
    expect(screen.getByTestId('create-routine-modal')).toHaveAttribute(
      'data-open',
      'false',
    );

    await user.click(button);

    expect(screen.getByTestId('create-routine-modal')).toHaveAttribute(
      'data-open',
      'true',
    );
  });

  it('reports the remaining slots', () => {
    render(<CreateRoutineButton userCreatedCount={2} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      `Te quedan ${MAX_USER_CREATED_ROUTINES - 2} de ${MAX_USER_CREATED_ROUTINES} rutinas propias`,
    );
  });

  it('disables the button when the maximum is reached', () => {
    render(
      <CreateRoutineButton userCreatedCount={MAX_USER_CREATED_ROUTINES} />,
    );

    expect(screen.getByRole('button', { name: /nueva rutina/i })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      /alcanzaste el máximo de 5 rutinas/i,
    );
  });

  it('does not open the modal when the limit is reached', async () => {
    const user = userEvent.setup();
    render(
      <CreateRoutineButton userCreatedCount={MAX_USER_CREATED_ROUTINES} />,
    );

    await user.click(screen.getByRole('button', { name: /nueva rutina/i }));

    expect(screen.getByTestId('create-routine-modal')).toHaveAttribute(
      'data-open',
      'false',
    );
  });
});
