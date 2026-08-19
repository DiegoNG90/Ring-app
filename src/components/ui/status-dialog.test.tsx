import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StatusDialog } from './status-dialog';

const defaultProps = {
  open: true,
  variant: 'success' as const,
  title: 'Todo salió bien',
  description: 'La operación terminó correctamente.',
};

function renderDialog(overrides: Partial<typeof defaultProps> & {
  detail?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
} = {}) {
  const props = { ...defaultProps, ...overrides };
  return {
    ...render(<StatusDialog {...props} />),
    props,
  };
}

describe('StatusDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description', () => {
    renderDialog();

    expect(
      screen.getByRole('heading', { name: /todo salió bien/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La operación terminó correctamente.'),
    ).toBeInTheDocument();
  });

  it('opens the native dialog when open is true', async () => {
    renderDialog({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId('status-dialog')).toHaveAttribute('open');
    });
  });

  it('keeps the dialog closed when open is false', () => {
    renderDialog({ open: false });

    expect(screen.getByTestId('status-dialog')).not.toHaveAttribute('open');
  });

  it('shows the green check icon for the success variant', () => {
    renderDialog({ variant: 'success' });

    expect(screen.getByTestId('status-dialog')).toHaveAttribute(
      'data-variant',
      'success',
    );
    expect(screen.getByTestId('status-dialog-icon-success')).toBeInTheDocument();
  });

  it('shows the red cross icon for the error variant', () => {
    renderDialog({ variant: 'error' });

    expect(screen.getByTestId('status-dialog')).toHaveAttribute(
      'data-variant',
      'error',
    );
    expect(screen.getByTestId('status-dialog-icon-error')).toBeInTheDocument();
  });

  it('renders an optional detail message', () => {
    renderDialog({ detail: 'Detalle específico del problema' });

    expect(screen.getByRole('note')).toHaveTextContent(
      'Detalle específico del problema',
    );
  });

  it('does not render a detail message when it is null', () => {
    renderDialog({ detail: null });

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('renders no action button when actionLabel is missing', () => {
    renderDialog();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onAction when the action button is clicked', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    renderDialog({ actionLabel: 'Entendido', onAction });

    await user.click(screen.getByRole('button', { name: /entendido/i }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('calls onAction when dismissed with Escape and dismissible is true', async () => {
    const onAction = jest.fn();
    renderDialog({ actionLabel: 'Entendido', onAction, dismissible: true });

    fireEvent(
      screen.getByTestId('status-dialog'),
      new Event('cancel', { bubbles: true, cancelable: true }),
    );

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape when dismissible is false', () => {
    const onAction = jest.fn();
    renderDialog({ onAction, dismissible: false });

    fireEvent(
      screen.getByTestId('status-dialog'),
      new Event('cancel', { bubbles: true, cancelable: true }),
    );

    expect(onAction).not.toHaveBeenCalled();
  });

  it('supports a custom test id', () => {
    renderDialog({ testId: 'my-dialog' } as never);

    expect(screen.getByTestId('my-dialog')).toBeInTheDocument();
  });
});
