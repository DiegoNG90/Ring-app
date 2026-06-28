import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth/auth';
import { getAllTrainingsByUserId } from '@/lib/repositories/trainings';
import type { Training } from '@/types/Trainings';
import TrainingPage from './page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

jest.mock('@/lib/auth/auth', () => ({
  verifyAuth: jest.fn(),
}));

jest.mock('@/lib/repositories/trainings', () => ({
  getAllTrainingsByUserId: jest.fn(),
}));

jest.mock('@/components/training/TrainingRoutinesList', () => {
  return function MockTrainingRoutinesList({
    trainings,
  }: {
    trainings: Training[];
  }) {
    if (trainings.length === 0) {
      return <span>Todavia no hay rutinas, crea una!</span>;
    }

    return (
      <div data-testid="training-routines-list">
        <h1>Listado de rutinas</h1>
        <ul>
          {trainings.map((training) => (
            <li key={training.training_id}>{training.training_title}</li>
          ))}
        </ul>
      </div>
    );
  };
});

const mockTrainings: Training[] = [
  {
    training_id: 1,
    training_title: 'Light Spar',
    training_description: 'Sparring liviano',
    round_id: 10,
    round_number: 3,
    duration_seconds: 180,
    rest_seconds: 60,
    repetitions: 0,
    interval_seconds: 0,
  },
  {
    training_id: 2,
    training_title: 'Heavy Bag',
    training_description: 'Sacos pesados',
    round_id: 20,
    round_number: 5,
    duration_seconds: 120,
    rest_seconds: 30,
    repetitions: 0,
    interval_seconds: 0,
  },
];

async function renderTrainingPage() {
  const ui = await TrainingPage();
  return render(ui);
}

describe('TrainingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to home if the user is not authenticated', async () => {
    (verifyAuth as jest.Mock).mockResolvedValue({ user: null, session: null });

    await expect(TrainingPage()).rejects.toThrow('NEXT_REDIRECT:/');
    expect(redirect).toHaveBeenCalledWith('/');
    expect(getAllTrainingsByUserId).not.toHaveBeenCalled();
  });

  it('fetches routines for the authenticated user', async () => {
    (verifyAuth as jest.Mock).mockResolvedValue({
      user: { id: '42' },
      session: { id: 'session-1' },
    });
    (getAllTrainingsByUserId as jest.Mock).mockReturnValue(mockTrainings);

    await renderTrainingPage();

    expect(getAllTrainingsByUserId).toHaveBeenCalledWith(42);
  });

  it('renders the disabled Nueva rutina button', async () => {
    (verifyAuth as jest.Mock).mockResolvedValue({
      user: { id: '1' },
      session: { id: 'session-1' },
    });
    (getAllTrainingsByUserId as jest.Mock).mockReturnValue(mockTrainings);

    await renderTrainingPage();

    expect(screen.getByRole('button', { name: /nueva rutina/i })).toBeDisabled();
  });

  it('shows the training routines list when there are trainings', async () => {
    (verifyAuth as jest.Mock).mockResolvedValue({
      user: { id: '1' },
      session: { id: 'session-1' },
    });
    (getAllTrainingsByUserId as jest.Mock).mockReturnValue(mockTrainings);

    await renderTrainingPage();

    expect(screen.getByTestId('training-routines-list')).toBeInTheDocument();
    expect(screen.getByText('Listado de rutinas')).toBeInTheDocument();
    expect(screen.getByText('Light Spar')).toBeInTheDocument();
    expect(screen.getByText('Heavy Bag')).toBeInTheDocument();
  });

  it('shows empty state message when there are no routines', async () => {
    (verifyAuth as jest.Mock).mockResolvedValue({
      user: { id: '1' },
      session: { id: 'session-1' },
    });
    (getAllTrainingsByUserId as jest.Mock).mockReturnValue([]);

    await renderTrainingPage();

    expect(
      screen.getByText(/todavia no hay rutinas, crea una!/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('training-routines-list')).not.toBeInTheDocument();
  });
});
