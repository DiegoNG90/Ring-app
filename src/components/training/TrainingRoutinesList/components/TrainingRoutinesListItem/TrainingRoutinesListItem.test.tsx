import { render, screen } from '@testing-library/react';
import TrainingRoutinesListItem from './TrainingRoutinesListItem';
import type { Training } from '@/types/Trainings';

jest.mock('@/components/training/Cards/InfoCard', () => {
  return function MockInfoCard({
    result,
    lastUsed,
    timesUsed,
  }: {
    result: Training;
    lastUsed?: string;
    timesUsed?: number;
  }) {
    return (
      <div data-testid="info-card">
        <span>{result.training_title}</span>
        <span data-testid="last-used">{lastUsed}</span>
        <span data-testid="times-used">{timesUsed}</span>
      </div>
    );
  };
});

const mockTraining: Training = {
  training_id: 1,
  training_title: 'Light Spar',
  training_description: 'Sparring liviano',
  round_id: 10,
  round_number: 3,
  duration_seconds: 180,
  rest_seconds: 60,
  repetitions: 0,
  interval_seconds: 0,
};

describe('TrainingRoutinesListItem', () => {
  it('renders a list item with InfoCard', () => {
    const { container } = render(
      <ul>
        <TrainingRoutinesListItem training={mockTraining} />
      </ul>,
    );

    const item = container.querySelector('li');
    expect(item).not.toBeNull();
    expect(screen.getByTestId('info-card')).toBeInTheDocument();
    expect(screen.getByText('Light Spar')).toBeInTheDocument();
  });

  it('passes lastUsed and timesUsed to InfoCard', () => {
    render(
      <TrainingRoutinesListItem
        training={mockTraining}
        lastUsed="2024-06-10"
        timesUsed={5}
      />,
    );

    expect(screen.getByTestId('last-used')).toHaveTextContent('2024-06-10');
    expect(screen.getByTestId('times-used')).toHaveTextContent('5');
  });
});
