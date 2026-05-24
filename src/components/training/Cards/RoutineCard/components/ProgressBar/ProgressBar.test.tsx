import { render, screen, within } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  const sequence = [
    { type: 'round' as const, round: 1 },
    { type: 'rest' as const, round: 1 },
    { type: 'round' as const, round: 2 },
  ];

  it('marks the active step in the bar', () => {
    render(<ProgressBar sequence={sequence} currentCard={0} />);

    const progressList = screen.getByRole('list', {
      name: /progreso de la rutina/i,
    });
    const steps = within(progressList).getAllByRole('listitem');

    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveAttribute('aria-current', 'step');
    expect(steps[1]).not.toHaveAttribute('aria-current');
  });

  it('updates the active step when currentCard changes', () => {
    render(<ProgressBar sequence={sequence} currentCard={1} />);

    const progressList = screen.getByRole('list', {
      name: /progreso de la rutina/i,
    });
    const steps = within(progressList).getAllByRole('listitem');

    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[0]).not.toHaveAttribute('aria-current');
  });

  it('exposes accessible titles on round and rest steps', () => {
    render(<ProgressBar sequence={sequence} currentCard={0} />);

    const progressList = screen.getByRole('list', {
      name: /progreso de la rutina/i,
    });
    const steps = within(progressList).getAllByRole('listitem');

    expect(steps[0]).toHaveAttribute('title', 'Round 1');
    expect(steps[1]).toHaveAttribute('title', 'Descanso');
    expect(steps[2]).toHaveAttribute('title', 'Round 2');
  });
});
