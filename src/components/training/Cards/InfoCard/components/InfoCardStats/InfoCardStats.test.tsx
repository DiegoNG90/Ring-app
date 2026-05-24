import { render, screen, within } from '@testing-library/react';
import InfoCardStats from './InfoCardStats';

describe('InfoCardStats', () => {
  it('shows rounds and formatted duration', () => {
    render(<InfoCardStats roundNumber={3} durationSeconds={125} />);

    const roundsRow = screen.getByText('Rounds').parentElement;
    expect(roundsRow).not.toBeNull();
    expect(within(roundsRow!).getByText('3')).toBeInTheDocument();

    const durationRow = screen.getByText('Duración').parentElement;
    expect(durationRow).not.toBeNull();
    expect(within(durationRow!).getByText('2:05')).toBeInTheDocument();
  });
});
