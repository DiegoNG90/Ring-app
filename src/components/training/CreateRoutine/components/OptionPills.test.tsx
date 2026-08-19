import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OptionPills } from '@/components/training/CreateRoutine/components/OptionPills';

describe('OptionPills', () => {
  it('renders options and selects one', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <OptionPills
        label="Duración"
        name="duration"
        options={[10, 15, 20]}
        value={10}
        onChange={onChange}
        formatOption={(value) => `${value}"`}
      />,
    );

    expect(screen.getByRole('radio', { name: '10"' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await user.click(screen.getByRole('radio', { name: '15"' }));

    expect(onChange).toHaveBeenCalledWith(15);
  });
});
