import { render, screen } from '@testing-library/react';
import RoutineProgress from './RoutineProgress';

describe('RoutineProgress', () => {
  const sequence = [
    { type: 'round' as const, round: 1 },
    { type: 'rest' as const, round: 1 },
    { type: 'round' as const, round: 2 },
  ];

  it('shows current step and active segment label', () => {
    render(<RoutineProgress sequence={sequence} currentCard={0} />);

    expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('shows rest label when the active step is rest', () => {
    render(<RoutineProgress sequence={sequence} currentCard={1} />);

    expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument();
    expect(screen.getByText('Descanso')).toBeInTheDocument();
  });

  it('shows second round label on the final step', () => {
    render(<RoutineProgress sequence={sequence} currentCard={2} />);

    expect(screen.getByText(/Paso 3 de 3/)).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('shows Ciclo N instead of Round N when cycleNumber is set (HIIT)', () => {
    render(<RoutineProgress sequence={sequence} currentCard={0} cycleNumber={2} />);

    expect(screen.getByText('Ciclo 2')).toBeInTheDocument();
    expect(screen.queryByText('Round 1')).not.toBeInTheDocument();
  });

  it('keeps Descanso label during rest even with cycleNumber (HIIT)', () => {
    render(<RoutineProgress sequence={sequence} currentCard={1} cycleNumber={3} />);

    expect(screen.getByText('Descanso')).toBeInTheDocument();
    expect(screen.queryByText('Ciclo 3')).not.toBeInTheDocument();
  });
});
