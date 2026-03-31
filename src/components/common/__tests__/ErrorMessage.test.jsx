import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  test('renders the error message', () => {
    render(<ErrorMessage message="Something broke" />);
    expect(screen.getByText(/Something broke/i)).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  test('renders retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    const btn = screen.getByRole('button', { name: /try again/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
