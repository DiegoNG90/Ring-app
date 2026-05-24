import { render, screen } from '@testing-library/react';
import SegmentHeader from './SegmentHeader';

describe('SegmentHeader', () => {
  it('renders title and routine name in a round', () => {
    render(
      <SegmentHeader
        type="round"
        segmentTitle="Round 1/3"
        trainingTitle="Heavy Bag"
        currentRound={1}
        totalRounds={3}
      />,
    );

    expect(screen.getByText('Round 1/3')).toBeInTheDocument();
    expect(screen.getByText('Heavy Bag')).toBeInTheDocument();
    expect(screen.queryByText('Descanso')).not.toBeInTheDocument();
  });

  it('renders badge, icon and next round in rest', () => {
    render(
      <SegmentHeader
        type="rest"
        segmentTitle="Descanso · después del round 1"
        trainingTitle="Heavy Bag"
        currentRound={1}
        totalRounds={3}
      />,
    );

    expect(screen.getByText('Descanso')).toBeInTheDocument();
    expect(
      screen.getByText(/Descanso · después del round 1/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Heavy Bag.*Siguiente: round 2\/3/i),
    ).toBeInTheDocument();
  });
});
