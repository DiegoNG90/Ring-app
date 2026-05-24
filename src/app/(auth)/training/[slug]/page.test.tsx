import { render, screen } from '@testing-library/react';
import { getTrainingById } from '@/lib/repositories/trainings';
import type { Training } from '@/types/Trainings';
import TrainingRutinePage from './page';

jest.mock('@/lib/repositories/trainings', () => ({
  getTrainingById: jest.fn(),
}));

jest.mock('@/components/training/Cards/RoutineCard', () => {
  return function MockRoutineCard({ training }: { training: Training }) {
    return (
      <div data-testid="routine-card">
        <span data-testid="routine-card-title">{training.training_title}</span>
        <span data-testid="routine-card-rounds">{training.round_number}</span>
      </div>
    );
  };
});

const mockTraining: Training = {
  training_id: 42,
  training_title: 'Light Spar',
  training_description: 'Sparring liviano',
  round_id: 10,
  round_number: 3,
  duration_seconds: 180,
  rest_seconds: 60,
  repetitions: 0,
};

async function renderTrainingDetailPage(slug: string) {
  const ui = await TrainingRutinePage({
    params: Promise.resolve({ slug }),
  });
  return render(ui);
}

describe('TrainingRutinePage (routine detail)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('invalid slug', () => {
    it('shows error when the slug id is not numeric', async () => {
      await renderTrainingDetailPage('solo-texto');

      expect(screen.getByText(/rutina no válida/i)).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /volver al listado/i }),
      ).toHaveAttribute('href', '/training');
      expect(getTrainingById).not.toHaveBeenCalled();
    });

    it('shows error when the id is less than 1', async () => {
      await renderTrainingDetailPage('light-spar-0');

      expect(screen.getByText(/rutina no válida/i)).toBeInTheDocument();
      expect(getTrainingById).not.toHaveBeenCalled();
    });
  });

  describe('routine not found', () => {
    it('shows message and link back to the list', async () => {
      (getTrainingById as jest.Mock).mockReturnValue(undefined);

      await renderTrainingDetailPage('light-spar-99');

      expect(getTrainingById).toHaveBeenCalledWith(99);
      expect(screen.getByText(/no se encontró la rutina/i)).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /volver al listado/i }),
      ).toHaveAttribute('href', '/training');
      expect(screen.queryByTestId('routine-card')).not.toBeInTheDocument();
    });
  });

  describe('valid detail', () => {
    beforeEach(() => {
      (getTrainingById as jest.Mock).mockReturnValue(mockTraining);
    });

    it('fetches the routine by id extracted from the slug', async () => {
      await renderTrainingDetailPage('light-spar-42');

      expect(getTrainingById).toHaveBeenCalledWith(42);
    });

    it('renders navigation and routine title', async () => {
      await renderTrainingDetailPage('light-spar-42');

      expect(screen.getByRole('link', { name: /volver/i })).toHaveAttribute(
        'href',
        '/training',
      );
      expect(
        screen.getByRole('heading', { name: /light spar/i }),
      ).toBeInTheDocument();
    });

    it('renders RoutineCard with training data', async () => {
      await renderTrainingDetailPage('light-spar-42');

      expect(screen.getByTestId('routine-card')).toBeInTheDocument();
      expect(screen.getByTestId('routine-card-title')).toHaveTextContent(
        'Light Spar',
      );
      expect(screen.getByTestId('routine-card-rounds')).toHaveTextContent('3');
    });

    it('contains the routine timer container', async () => {
      await renderTrainingDetailPage('light-spar-42');

      expect(document.getElementById('training-routine-card')).toBeInTheDocument();
    });
  });
});
