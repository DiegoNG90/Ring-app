import { render, screen } from '@testing-library/react';
import TrainingRoutinesEmptyState from './TrainingRoutinesEmptyState';

describe('TrainingRoutinesEmptyState', () => {
  it('renders the default message', () => {
    render(<TrainingRoutinesEmptyState />);

    expect(
      screen.getByText(/todavia no hay rutinas, crea una!/i),
    ).toBeInTheDocument();
  });

  it('allows customizing the message', () => {
    render(<TrainingRoutinesEmptyState message="Sin rutinas todavía" />);

    expect(screen.getByText('Sin rutinas todavía')).toBeInTheDocument();
  });
});
