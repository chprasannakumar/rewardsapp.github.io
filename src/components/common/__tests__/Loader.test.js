import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from '../Loader';

test('renders loading text', () => {
  render(<Loader />);
  expect(screen.getByText(/Loading rewards data/i)).toBeInTheDocument();
});

test('renders a spinner', () => {
  const { container } = render(<Loader />);
  expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
});
