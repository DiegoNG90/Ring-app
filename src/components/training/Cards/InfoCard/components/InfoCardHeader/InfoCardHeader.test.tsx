import { render, screen } from '@testing-library/react';
import InfoCardHeader from './InfoCardHeader';

describe('InfoCardHeader', () => {
  it('renders the routine title and description', () => {
    render(
      <InfoCardHeader
        title="Light Spar"
        description="Rutina corta de sparring"
      />,
    );

    expect(screen.getByText('Light Spar')).toBeInTheDocument();
    expect(screen.getByText('Rutina corta de sparring')).toBeInTheDocument();
  });
});
