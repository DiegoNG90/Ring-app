import { render, screen } from '@testing-library/react';
import RoutineProgress from './RoutineProgress';

describe('RoutineProgress', () => {
  const sequence = [
    { type: 'round' as const, round: 1 },
    { type: 'rest' as const, round: 1 },
    { type: 'round' as const, round: 2 },
  ];

  it('muestra paso actual y label del segmento activo', () => {
    render(<RoutineProgress sequence={sequence} currentCard={0} />);

    expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('muestra label de descanso cuando el paso activo es rest', () => {
    render(<RoutineProgress sequence={sequence} currentCard={1} />);

    expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument();
    expect(screen.getByText('Descanso')).toBeInTheDocument();
  });

  it('muestra label del segundo round en el paso final', () => {
    render(<RoutineProgress sequence={sequence} currentCard={2} />);

    expect(screen.getByText(/Paso 3 de 3/)).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });
});
