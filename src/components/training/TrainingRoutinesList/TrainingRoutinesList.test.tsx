import { render, screen } from '@testing-library/react';
import TrainingRoutinesList from './TrainingRoutinesList';
import type { Training } from '@/types/Trainings';

jest.mock('@/components/training/Cards/InfoCard', () => {
  return function MockInfoCard({ result }: { result: Training }) {
    return <div data-testid="info-card">{result.training_title}</div>;
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
  },
];

describe('TrainingRoutinesList', () => {
  it('shows heading and cards when there are routines', () => {
    render(<TrainingRoutinesList trainings={mockTrainings} />);

    expect(
      screen.getByRole('heading', { name: /listado de rutinas/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('info-card')).toHaveLength(2);
    expect(screen.getByText('Light Spar')).toBeInTheDocument();
    expect(screen.getByText('Heavy Bag')).toBeInTheDocument();
  });

  it('shows empty state when there are no routines', () => {
    render(<TrainingRoutinesList trainings={[]} />);

    expect(
      screen.getByText(/todavia no hay rutinas, crea una!/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /listado de rutinas/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('info-card')).not.toBeInTheDocument();
  });
});
