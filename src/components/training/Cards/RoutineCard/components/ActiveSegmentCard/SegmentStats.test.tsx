import { render, screen } from '@testing-library/react';
import SegmentStats from './SegmentStats';

describe('SegmentStats', () => {
  it('muestra duración del round y descanso próximo', () => {
    render(
      <SegmentStats type="round" durationSeconds={180} restSeconds={60} />,
    );

    expect(screen.getByText('Este round')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
    expect(screen.getByText('Descanso próximo')).toBeInTheDocument();
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('muestra guión cuando no hay descanso configurado en round', () => {
    render(
      <SegmentStats type="round" durationSeconds={60} restSeconds={0} />,
    );

    expect(screen.getByText('Descanso próximo')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('muestra stats de descanso y siguiente round', () => {
    render(
      <SegmentStats type="rest" durationSeconds={180} restSeconds={45} />,
    );

    expect(screen.getByText('Este descanso')).toBeInTheDocument();
    expect(screen.getByText('0:45')).toBeInTheDocument();
    expect(screen.getByText('Siguiente round')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
  });
});
