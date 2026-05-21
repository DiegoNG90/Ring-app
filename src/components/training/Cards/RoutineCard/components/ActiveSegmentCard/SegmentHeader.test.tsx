import { render, screen } from '@testing-library/react';
import SegmentHeader from './SegmentHeader';

describe('SegmentHeader', () => {
  it('renderiza título y nombre de la rutina en un round', () => {
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

  it('renderiza badge, icono y siguiente round en descanso', () => {
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
