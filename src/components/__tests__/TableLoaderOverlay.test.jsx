import React from 'react';
import { render, screen } from '@testing-library/react';
import TableLoaderOverlay from '../TableLoaderOverlay';

test('renders nothing when loading is false', () => {
  const { container } = render(<TableLoaderOverlay loading={false} />);
  expect(container.firstChild).toBeNull();
});

test('renders spinner and default message when loading is true', () => {
  render(<TableLoaderOverlay loading={true} />);
  expect(screen.getByText(/Recalculating points/i)).toBeInTheDocument();
});

test('renders custom message when provided', () => {
  render(<TableLoaderOverlay loading={true} message="Custom loading..." />);
  expect(screen.getByText(/Custom loading/i)).toBeInTheDocument();
});
