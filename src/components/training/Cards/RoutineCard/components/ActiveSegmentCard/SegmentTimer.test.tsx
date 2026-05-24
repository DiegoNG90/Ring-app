import { render, screen } from '@testing-library/react';
import SegmentTimer from './SegmentTimer';

describe('SegmentTimer', () => {
  it('shows formatted time and progress in an active round', () => {
    const { container } = render(
      <SegmentTimer type="round" timeLeft={125} progress={50} isCompleted={false} />,
    );

    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('2:05')).toHaveClass('text-emerald-400');

    const progressBar = container.querySelector('.bg-emerald-500');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('uses rest styles when the segment is rest', () => {
    const { container } = render(
      <SegmentTimer type="rest" timeLeft={30} progress={25} isCompleted={false} />,
    );

    expect(screen.getByText('0:30')).toHaveClass('text-orange-400');
    expect(container.querySelector('.bg-orange-500')).toBeInTheDocument();
  });

  it('clamps progress to 100% and applies completed style', () => {
    const { container } = render(
      <SegmentTimer type="round" timeLeft={0} progress={150} isCompleted={true} />,
    );

    expect(screen.getByText('0:00')).toHaveClass('text-zinc-500');

    const progressBar = container.querySelector('.bg-emerald-500');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });
});
