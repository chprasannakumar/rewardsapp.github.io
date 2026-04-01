import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

test('renders RewardsPlatform brand name', () => {
  render(<Header />);
  expect(screen.getByText(/Rewards/i)).toBeInTheDocument();
});

test('renders Admin greeting', () => {
  render(<Header />);
  expect(screen.getByText(/Admin/i)).toBeInTheDocument();
});
