import { render, screen } from '@testing-library/react';
import InfoCardUsageMeta from './InfoCardUsageMeta';

describe('InfoCardUsageMeta', () => {
  it('muestra veces usado y última fecha', () => {
    render(<InfoCardUsageMeta timesUsed={5} lastUsed="2024-06-10" />);

    expect(screen.getByText('Usado 5 veces')).toBeInTheDocument();
    expect(
      screen.getByText(new Date('2024-06-10').toLocaleDateString()),
    ).toBeInTheDocument();
  });
});
