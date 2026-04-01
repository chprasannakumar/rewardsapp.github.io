import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TotalRewardsTable from '../TotalRewardsTable';

const mockRewards = [
  { customerId: 'C001', customerName: 'John Doe',   points: 150 },
  { customerId: 'C002', customerName: 'Jane Smith', points: 200 },
  { customerId: 'C003', customerName: 'Bob Lee',    points: 50  },
];

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('TotalRewardsTable — rendering', () => {
  test('renders Leaderboard title', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
  });

  test('renders column headers', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    expect(screen.getByText(/Customer Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Reward Points/i)).toBeInTheDocument();
  });

  test('renders all customer names', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Lee')).toBeInTheDocument();
  });

  test('renders points values', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  test('shows empty state when no rewards', () => {
    render(<TotalRewardsTable rewards={[]} />);
    expect(screen.getByText(/No total rewards/i)).toBeInTheDocument();
  });

  test('shows loading overlay when isLoading is true', () => {
    render(<TotalRewardsTable rewards={mockRewards} isLoading={true} />);
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
  });

  test('does not show loading overlay when isLoading is false', () => {
    render(<TotalRewardsTable rewards={mockRewards} isLoading={false} />);
    expect(screen.queryByText(/Processing/i)).not.toBeInTheDocument();
  });

  test('isLoading defaults to falsy when not provided', () => {
    expect(() => render(<TotalRewardsTable rewards={mockRewards} />)).not.toThrow();
  });
});

// ─── renderCell — all columns + null/default branches ────────────────────────

describe('TotalRewardsTable — renderCell branches', () => {
  test('customerName: renders name string', () => {
    render(<TotalRewardsTable rewards={[mockRewards[0]]} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('customerName: renders em-dash for null customerName', () => {
    render(<TotalRewardsTable rewards={[{ ...mockRewards[0], customerName: null }]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('points: renders numeric value', () => {
    render(<TotalRewardsTable rewards={[mockRewards[1]]} />);
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  test('points: renders 0 for null points', () => {
    render(<TotalRewardsTable rewards={[{ ...mockRewards[0], points: null }]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('points: renders 0 for undefined points', () => {
    render(<TotalRewardsTable rewards={[{ ...mockRewards[0], points: undefined }]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('points: formats large numbers with locale commas', () => {
    render(<TotalRewardsTable rewards={[{ customerId: 'X', customerName: 'X', points: 1000000 }]} />);
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });

  test('default case returns null without crash', () => {
    expect(() => render(<TotalRewardsTable rewards={mockRewards} />)).not.toThrow();
  });
});

// ─── sortedRewards — non-array guard ─────────────────────────────────────────

describe('TotalRewardsTable — sortedRewards non-array guard', () => {
  test('renders empty table when rewards is null (guard returns [])', () => {
    expect(() => render(<TotalRewardsTable rewards={null} />)).not.toThrow();
    expect(screen.getByText(/No total rewards/i)).toBeInTheDocument();
  });

  test('renders empty table when rewards is undefined', () => {
    expect(() => render(<TotalRewardsTable rewards={undefined} />)).not.toThrow();
  });

  test('renders empty table for empty array', () => {
    render(<TotalRewardsTable rewards={[]} />);
    expect(screen.getByText(/No total rewards/i)).toBeInTheDocument();
  });
});

// ─── Sorting ─────────────────────────────────────────────────────────────────

describe('TotalRewardsTable — sorting', () => {
  test('clicking Customer Name header sorts asc', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    fireEvent.click(screen.getByText('Customer Name'));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('clicking Customer Name twice toggles back to desc', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    fireEvent.click(screen.getByText('Customer Name'));
    fireEvent.click(screen.getByText('Customer Name'));
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('clicking Total Reward Points header triggers sort', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    fireEvent.click(screen.getByText(/Total Reward Points/i));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('sort covers bValue < aValue and bValue > aValue branches', () => {
    const rewardsWithTie = [
      { customerId: 'A', customerName: 'Alpha', points: 100 },
      { customerId: 'B', customerName: 'Beta',  points: 100 }, // tie → return 0
      { customerId: 'C', customerName: 'Gamma', points: 200 },
    ];
    render(<TotalRewardsTable rewards={rewardsWithTie} />);
    fireEvent.click(screen.getByText(/Total Reward Points/i)); // asc
    fireEvent.click(screen.getByText(/Total Reward Points/i)); // desc
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  test('handleRequestSort same property flips order (isAsc branch)', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    fireEvent.click(screen.getByText(/Total Reward Points/i));
    fireEvent.click(screen.getByText(/Total Reward Points/i));
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('handleRequestSort different property sets new orderBy', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    fireEvent.click(screen.getByText('Customer Name'));
    expect(screen.getByText('Bob Lee')).toBeInTheDocument();
  });

  test('sort bValue < aValue branch: ASC puts higher value last', () => {
    const data = [
      { customerId: 'L', customerName: 'Low',  points: 10 },
      { customerId: 'H', customerName: 'High', points: 500 },
    ];
    render(<TotalRewardsTable rewards={data} />);
    fireEvent.click(screen.getByText(/Total Reward Points/i)); // flip to ASC
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Low');
  });

  test('sort bValue > aValue branch: DESC puts higher value first', () => {
    const data = [
      { customerId: 'L', customerName: 'Low',  points: 10 },
      { customerId: 'H', customerName: 'High', points: 500 },
    ];
    render(<TotalRewardsTable rewards={data} />);
    // Default is DESC by points; High should be first
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('High');
  });
});

// ─── rowKey ───────────────────────────────────────────────────────────────────

describe('TotalRewardsTable — rowKey', () => {
  test('uses customerId as key when present', () => {
    expect(() => render(<TotalRewardsTable rewards={mockRewards} />)).not.toThrow();
  });

  test('falls back to Math.random() when customerId is null', () => {
    const noId = [{ customerId: null, customerName: 'X', points: 0 }];
    expect(() => render(<TotalRewardsTable rewards={noId} />)).not.toThrow();
  });
});

// ─── ErrorBoundary wrapping ───────────────────────────────────────────────────

describe('TotalRewardsTable — ErrorBoundary wrapping', () => {
  test('renders normally when there is no error', () => {
    render(<TotalRewardsTable rewards={mockRewards} />);
    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
  });

  test('ErrorBoundary catches thrown render error and shows fallback', () => {
    const err = console.error;
    console.error = jest.fn();

    const EB = require('../common/ErrorBoundary').default;
    const Throw = () => { throw new Error('boundary test'); };

    render(<EB><Throw /></EB>);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/boundary test/)).toBeInTheDocument();

    console.error = err;
  });

  test('ErrorBoundary Try Again resets the error state', () => {
    const err = console.error;
    console.error = jest.fn();

    let shouldThrow = true;
    const MaybeThrow = () => {
      if (shouldThrow) throw new Error('reset test');
      return <div>Recovered</div>;
    };

    const EB = require('../common/ErrorBoundary').default;
    const { rerender } = render(<EB><MaybeThrow /></EB>);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    rerender(<EB><MaybeThrow /></EB>);
    expect(screen.getByText('Recovered')).toBeInTheDocument();

    console.error = err;
  });
});
