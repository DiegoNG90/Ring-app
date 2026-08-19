import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  CREATION_ERROR_DESCRIPTION,
  CREATION_ERROR_TITLE,
  CreationErrorDialog,
} from './CreationErrorDialog';

describe('CreationErrorDialog', () => {
  it('shows the error message with a red cross icon when open', async () => {
    render(<CreationErrorDialog open onDismiss={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('creation-error-dialog')).toHaveAttribute(
        'open',
      );
    });

    expect(
      screen.getByRole('heading', { name: CREATION_ERROR_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByText(CREATION_ERROR_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByTestId('status-dialog-icon-error')).toBeInTheDocument();
  });

  it('stays closed when open is false', () => {
    render(<CreationErrorDialog open={false} onDismiss={jest.fn()} />);

    expect(screen.getByTestId('creation-error-dialog')).not.toHaveAttribute(
      'open',
    );
  });

  it('renders the specific detail when provided', () => {
    render(
      <CreationErrorDialog
        open
        detail="Ya tenés una rutina con ese nombre y tipo"
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByRole('note')).toHaveTextContent(
      'Ya tenés una rutina con ese nombre y tipo',
    );
  });

  it('calls onDismiss when Entendido is clicked', async () => {
    const onDismiss = jest.fn();
    const user = userEvent.setup();
    render(<CreationErrorDialog open onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: /entendido/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
