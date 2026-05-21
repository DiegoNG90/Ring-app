import { render, screen } from '@testing-library/react';
import TrainingRoutinesListHeader from './TrainingRoutinesListHeader';

describe('TrainingRoutinesListHeader', () => {
  it('renderiza el título por defecto', () => {
    render(<TrainingRoutinesListHeader />);

    expect(
      screen.getByRole('heading', { name: /listado de rutinas/i }),
    ).toBeInTheDocument();
  });

  it('permite personalizar el título', () => {
    render(<TrainingRoutinesListHeader title="Mis rutinas" />);

    expect(
      screen.getByRole('heading', { name: /mis rutinas/i }),
    ).toBeInTheDocument();
  });
});
