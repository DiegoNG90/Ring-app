import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InfoCardDeleteButton from './InfoCardDeleteButton';

describe('InfoCardDeleteButton', () => {
  it('renders an accessible delete button', () => {
    render(
      <InfoCardDeleteButton trainingTitle="Light Spar" onClick={jest.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: /eliminar rutina light spar/i }),
    ).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <InfoCardDeleteButton trainingTitle="Light Spar" onClick={onClick} />,
    );

    await user.click(
      screen.getByRole('button', { name: /eliminar rutina light spar/i }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
