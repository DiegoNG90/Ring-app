import { render, screen } from '@testing-library/react';
import SegmentTimer from './SegmentTimer';

describe('SegmentTimer', () => {
  it('muestra el tiempo formateado y progreso en un round activo', () => {
    const { container } = render(
      <SegmentTimer type="round" timeLeft={125} progress={50} isCompleted={false} />,
    );

    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('2:05')).toHaveClass('text-emerald-400');

    const progressBar = container.querySelector('.bg-emerald-500');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('usa estilos de descanso cuando el segmento es rest', () => {
    const { container } = render(
      <SegmentTimer type="rest" timeLeft={30} progress={25} isCompleted={false} />,
    );

    expect(screen.getByText('0:30')).toHaveClass('text-orange-400');
    expect(container.querySelector('.bg-orange-500')).toBeInTheDocument();
  });

  it('limita el progreso al 100% y aplica estilo completado', () => {
    const { container } = render(
      <SegmentTimer type="round" timeLeft={0} progress={150} isCompleted={true} />,
    );

    expect(screen.getByText('0:00')).toHaveClass('text-zinc-500');

    const progressBar = container.querySelector('.bg-emerald-500');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });
});
