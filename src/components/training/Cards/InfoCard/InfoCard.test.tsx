import { render, screen, within } from '@testing-library/react';
import InfoCard from './InfoCard';

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const mockResult = {
  training_id: 42,
  training_title: 'Light Spar',
  training_description: 'Rutina corta de sparring',
  round_id: 1,
  round_number: 3,
  duration_seconds: 125,
  rest_seconds: 30,
  repetitions: 0,
};

describe('InfoCard', () => {
  it('renders training title, description and stats', () => {
    render(<InfoCard result={mockResult} timesUsed={5} lastUsed="2024-06-10" />);

    expect(screen.getByText('Light Spar')).toBeInTheDocument();
    expect(screen.getByText('Rutina corta de sparring')).toBeInTheDocument();
    expect(screen.getByText('Usado 5 veces')).toBeInTheDocument();

    const roundsRow = screen.getByText('Rounds').parentElement;
    expect(roundsRow).not.toBeNull();
    expect(within(roundsRow!).getByText('3')).toBeInTheDocument();

    const durationRow = screen.getByText('Duración').parentElement;
    expect(within(durationRow!).getByText('2:05')).toBeInTheDocument();
  });

  it('links to the training detail page with a slugified title', () => {
    render(<InfoCard result={mockResult} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/training/light-spar-42');
  });
});
