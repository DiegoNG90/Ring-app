import { render, screen } from '@testing-library/react';
import TrainingRoutinesListHeader from './TrainingRoutinesListHeader';

describe('TrainingRoutinesListHeader', () => {
  it('renders the default title', () => {
    render(<TrainingRoutinesListHeader />);

    expect(
      screen.getByRole('heading', { name: /listado de rutinas/i }),
    ).toBeInTheDocument();
  });

  it('allows customizing the title', () => {
    render(<TrainingRoutinesListHeader title="Mis rutinas" />);

    expect(
      screen.getByRole('heading', { name: /mis rutinas/i }),
    ).toBeInTheDocument();
  });
});
