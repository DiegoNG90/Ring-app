import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InfoCard from './InfoCard';
import { deleteTrainingAction } from '@/actions/training-actions';

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

jest.mock('@/actions/training-actions', () => ({
  deleteTrainingAction: jest.fn(),
}));

const mockResult = {
  training_id: 42,
  training_title: 'Light Spar',
  training_description: 'Rutina corta de sparring',
  round_id: 1,
  round_number: 3,
  duration_seconds: 125,
  rest_seconds: 30,
  repetitions: 0,
};

describe('InfoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (deleteTrainingAction as jest.Mock).mockResolvedValue({ success: true });
  });

  it('renders training title, description and stats', () => {
    render(<InfoCard result={mockResult} timesUsed={5} lastUsed="2024-06-10" />);

    expect(screen.getByText('Light Spar')).toBeInTheDocument();
    expect(screen.getByText('Rutina corta de sparring')).toBeInTheDocument();
    expect(screen.getByText('Usado 5 veces')).toBeInTheDocument();

    const roundsRow = screen.getByText('Rounds').parentElement;
    expect(roundsRow).not.toBeNull();
    expect(within(roundsRow!).getByText('3')).toBeInTheDocument();

    const durationRow = screen.getByText('Duración').parentElement;
    expect(within(durationRow!).getByText('2:05')).toBeInTheDocument();
  });

  it('links to the training detail page with a slugified title', () => {
    render(<InfoCard result={mockResult} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/training/light-spar-42');
  });

  it('opens the delete confirmation dialog when trash is clicked', async () => {
    const user = userEvent.setup();
    render(<InfoCard result={mockResult} />);

    await user.click(
      screen.getByRole('button', { name: /eliminar rutina light spar/i }),
    );

    expect(
      screen.getByRole('heading', { name: /¿eliminar rutina\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/se eliminará "light spar"/i),
    ).toBeInTheDocument();
  });

  it('closes the dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<InfoCard result={mockResult} />);

    await user.click(
      screen.getByRole('button', { name: /eliminar rutina light spar/i }),
    );

    const dialog = document.querySelector('dialog');
    expect(dialog).toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toHaveAttribute('open');
    });
  });

  it('deletes the training and refreshes the list on confirm', async () => {
    const user = userEvent.setup();
    render(<InfoCard result={mockResult} />);

    await user.click(
      screen.getByRole('button', { name: /eliminar rutina light spar/i }),
    );
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

    await waitFor(() => {
      expect(deleteTrainingAction).toHaveBeenCalledWith(42);
      expect(mockRefresh).toHaveBeenCalled();
      expect(document.querySelector('dialog')).not.toHaveAttribute('open');
    });
  });

  it('shows an error when delete fails', async () => {
    (deleteTrainingAction as jest.Mock).mockResolvedValue({
      success: false,
      error: 'No se pudo eliminar la rutina',
    });

    const user = userEvent.setup();
    render(<InfoCard result={mockResult} />);

    await user.click(
      screen.getByRole('button', { name: /eliminar rutina light spar/i }),
    );
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudo eliminar la rutina',
      );
    });

    expect(mockRefresh).not.toHaveBeenCalled();
    expect(document.querySelector('dialog')).toHaveAttribute('open');
  });
});
