import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { Button } from '@/design-system';

import { renderWithProviders } from '@tests/setup/render';

describe('Button', () => {
  it('is pressable with an accessible name', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Send interest" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Send interest' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire while loading or disabled and exposes the state', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Save" onPress={onPress} loading />);
    const btn = screen.getByRole('button', { name: 'Save' });
    fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
    expect(btn).toBeDisabled();
    expect(btn).toBeBusy();
  });

  it('renders in dark theme', async () => {
    await renderWithProviders(<Button label="Dark" onPress={() => undefined} />, { theme: 'dark' });
    expect(screen.getByText('Dark')).toBeOnTheScreen();
  });
});
