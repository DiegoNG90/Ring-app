import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  title: '¿Eliminar rutina?',
  description: 'Esta acción no se puede deshacer.',
  onConfirm: jest.fn(),
};

function renderDialog(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  return {
    ...render(<ConfirmDialog {...props} />),
    props,
  };
}

describe('ConfirmDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description', () => {
    renderDialog();

    expect(
      screen.getByRole('heading', { name: /¿eliminar rutina\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Esta acción no se puede deshacer.'),
    ).toBeInTheDocument();
  });

  it('opens the native dialog when open is true', async () => {
    renderDialog({ open: true });

    await waitFor(() => {
      expect(document.querySelector('dialog')).toHaveAttribute('open');
    });
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('keeps the dialog closed when open is false', () => {
    renderDialog({ open: false });

    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('closes when open changes from true to false', async () => {
    const { rerender } = renderDialog({ open: true });

    await waitFor(() => {
      expect(document.querySelector('dialog')).toHaveAttribute('open');
    });

    rerender(<ConfirmDialog {...defaultProps} open={false} />);

    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toHaveAttribute('open');
    });
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('calls onOpenChange(false) when cancel is clicked', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();
    renderDialog({ onOpenChange });

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onConfirm when confirm is clicked', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    renderDialog({ onConfirm, confirmLabel: 'Eliminar' });

    await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('uses custom button labels', () => {
    renderDialog({
      confirmLabel: 'Sí, borrar',
      cancelLabel: 'No, volver',
    });

    expect(
      screen.getByRole('button', { name: /sí, borrar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /no, volver/i }),
    ).toBeInTheDocument();
  });

  it('displays an error message when error is provided', () => {
    renderDialog({ error: 'No se pudo eliminar la rutina' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo eliminar la rutina',
    );
  });

  it('does not render an alert when error is null', () => {
    renderDialog({ error: null });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables actions and shows loading label while pending', () => {
    renderDialog({
      isLoading: true,
      confirmLabel: 'Eliminar',
    });

    const confirmButton = screen.getByRole('button', { name: /eliminando/i });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
  });

  it('calls onOpenChange(false) when the dialog is closed', async () => {
    const onOpenChange = jest.fn();
    renderDialog({ onOpenChange });

    const dialog = document.querySelector('dialog');
    expect(dialog).not.toBeNull();

    await waitFor(() => {
      expect(dialog).toHaveAttribute('open');
    });

    fireEvent(
      dialog!,
      new Event('close', { bubbles: true }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
