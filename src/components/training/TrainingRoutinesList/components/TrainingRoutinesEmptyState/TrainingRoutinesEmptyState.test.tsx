import { render, screen } from '@testing-library/react';
import TrainingRoutinesEmptyState from './TrainingRoutinesEmptyState';

describe('TrainingRoutinesEmptyState', () => {
  it('renderiza el mensaje por defecto', () => {
    render(<TrainingRoutinesEmptyState />);

    expect(
      screen.getByText(/todavia no hay rutinas, crea una!/i),
    ).toBeInTheDocument();
  });

  it('permite personalizar el mensaje', () => {
    render(<TrainingRoutinesEmptyState message="Sin rutinas todavía" />);

    expect(screen.getByText('Sin rutinas todavía')).toBeInTheDocument();
  });
});
