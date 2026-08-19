import { render, screen, waitFor } from '@testing-library/react';

import {
  CREATION_SUCCESS_DESCRIPTION,
  CREATION_SUCCESS_TITLE,
  CreationSuccessDialog,
} from './CreationSuccessDialog';

describe('CreationSuccessDialog', () => {
  it('shows the success message with a green check icon when open', async () => {
    render(<CreationSuccessDialog open />);

    await waitFor(() => {
      expect(screen.getByTestId('creation-success-dialog')).toHaveAttribute(
        'open',
      );
    });

    expect(
      screen.getByRole('heading', { name: CREATION_SUCCESS_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByText(CREATION_SUCCESS_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByTestId('status-dialog-icon-success')).toBeInTheDocument();
  });

  it('stays closed when open is false', () => {
    render(<CreationSuccessDialog open={false} />);

    expect(screen.getByTestId('creation-success-dialog')).not.toHaveAttribute(
      'open',
    );
  });

  it('has no dismiss button so the redirect is not interrupted', () => {
    render(<CreationSuccessDialog open />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
