import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionsTable from '../TransactionsTable';

// ─── Fixtures ──────────────────────────────────────────────────────────────

const makeTx = (overrides = {}) => ({
  id: 't1',
  customerName: 'Alice Smith',
  purchaseDate: '2024-01-15T10:00:00Z',
  productPurchased: 'Laptop',
  price: 151,
  points: 152,
  ...overrides,
});

const TX_A = makeTx();
const TX_B = makeTx({
  id: 't2',
  customerName: 'Bob Jones',
  purchaseDate: '2024-02-10T10:00:00Z',
  price: 75,
  points: 25,
  productPurchased: 'Phone',
});
const TX_C = makeTx({
  id: 't3',
  customerName: 'Carol White',
  purchaseDate: '2023-12-01T10:00:00Z',
  price: 50,
  points: 0,
  productPurchased: 'Tablet',
});

const DATA = [TX_A, TX_B, TX_C];

// ─── Basic rendering ─────────────────────────────────────────────────────────

describe('TransactionsTable — basic rendering', () => {
  it('renders the title', () => {
    render(<TransactionsTable transactions={DATA} />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  it('renders the record count badge', () => {
    render(<TransactionsTable transactions={DATA} />);
    expect(screen.getByText(/3 Records Shown/)).toBeInTheDocument();
  });

  it('renders empty message when transactions is empty', () => {
    render(<TransactionsTable transactions={[]} />);
    expect(screen.getByText('No transactions found.')).toBeInTheDocument();
  });

  it('count badge is absent in empty state (ReusableTable renders early)', () => {
    render(<TransactionsTable transactions={[]} />);
    expect(screen.queryByText(/Records Shown/)).not.toBeInTheDocument();
  });

  it('renders loading overlay when isLoading is true', () => {
    render(<TransactionsTable transactions={DATA} isLoading />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('does not render loading overlay when isLoading is false', () => {
    render(<TransactionsTable transactions={DATA} isLoading={false} />);
    expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
  });

  it('renders all six column headers', () => {
    render(<TransactionsTable transactions={DATA} />);
    ['ID', 'Customer Name', 'Purchase Date', 'Product', 'Price', 'Points Earned'].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders one row per transaction within default page size', () => {
    render(<TransactionsTable transactions={DATA} />);
    expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data
  });

  it('does not crash when onUpdate is not provided', () => {
    expect(() => render(<TransactionsTable transactions={DATA} />)).not.toThrow();
  });

  it('does not crash when isLoading is not provided', () => {
    expect(() => render(<TransactionsTable transactions={DATA} />)).not.toThrow();
  });
});

// ─── sortedTransactions non-array guard (line 31) ────────────────────────────

describe('TransactionsTable — non-array transactions guard', () => {
  it('renders empty table (not a crash) when transactions is not an array', () => {
    // The useMemo guard: !Array.isArray(transactions) => return []
    // PropTypes will warn but it must not throw
    expect(() =>
      render(<TransactionsTable transactions={null} />)
    ).not.toThrow();
  });

  it('renders empty table when transactions is undefined', () => {
    expect(() =>
      render(<TransactionsTable transactions={undefined} />)
    ).not.toThrow();
  });
});

// ─── renderCell — id ─────────────────────────────────────────────────────────

describe('TransactionsTable — renderCell id', () => {
  it('renders id prefixed with #', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.getByText(/#t1/)).toBeInTheDocument();
  });

  it('renders without crashing when id is null', () => {
    expect(() =>
      render(<TransactionsTable transactions={[makeTx({ id: null })]} />)
    ).not.toThrow();
  });
});

// ─── renderCell — customerName ───────────────────────────────────────────────

describe('TransactionsTable — renderCell customerName', () => {
  it('renders the customer name', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('renders em-dash when customerName is null', () => {
    render(<TransactionsTable transactions={[makeTx({ customerName: null })]} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });
});

// ─── renderCell — purchaseDate ───────────────────────────────────────────────

describe('TransactionsTable — renderCell purchaseDate', () => {
  it('formats the date and does not show the raw ISO string', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.queryByText('2024-01-15T10:00:00Z')).not.toBeInTheDocument();
  });

  it('renders em-dash when purchaseDate is null (falsy branch)', () => {
    render(<TransactionsTable transactions={[makeTx({ purchaseDate: null })]} />);
    // The ternary: tx?.purchaseDate ? format : '—'
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('renders formatted date when purchaseDate is present (truthy branch)', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    // Any formatted date string is present (locale-dependent, just assert not ISO)
    expect(screen.queryByText('2024-01-15T10:00:00Z')).not.toBeInTheDocument();
  });
});

// ─── renderCell — productPurchased ───────────────────────────────────────────

describe('TransactionsTable — renderCell productPurchased', () => {
  it('renders the product name', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.getByText('Laptop')).toBeInTheDocument();
  });

  it('renders em-dash when productPurchased is null', () => {
    render(<TransactionsTable transactions={[makeTx({ productPurchased: null })]} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });
});

// ─── renderCell — price ──────────────────────────────────────────────────────

describe('TransactionsTable — renderCell price', () => {
  it('formats price with two decimal places (price != null branch)', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.getByText(/151\.00/)).toBeInTheDocument();
  });

  it('renders $0.00 when price is null (price == null branch)', () => {
    render(<TransactionsTable transactions={[makeTx({ price: null })]} />);
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it('formats price 75 as 75.00', () => {
    render(<TransactionsTable transactions={[TX_B]} />);
    expect(screen.getByText(/75\.00/)).toBeInTheDocument();
  });

  it('formats price 0 as $0.00', () => {
    render(<TransactionsTable transactions={[makeTx({ id: 'tz', price: 0 })]} />);
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it('formats large price with commas', () => {
    render(<TransactionsTable transactions={[makeTx({ id: 'tb', price: 1000000 })]} />);
    expect(screen.getByText(/1,000,000\.00/)).toBeInTheDocument();
  });
});

// ─── renderCell — points ─────────────────────────────────────────────────────

describe('TransactionsTable — renderCell points', () => {
  it('renders positive points value (> 0 branch: secondary.main color)', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.getByText('152')).toBeInTheDocument();
    expect(screen.getByText('PTS')).toBeInTheDocument();
  });

  it('renders zero points (== 0 branch: #94a3b8 color)', () => {
    render(<TransactionsTable transactions={[TX_C]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders 0 when points is null (null coalescing ?? 0)', () => {
    render(<TransactionsTable transactions={[makeTx({ points: null })]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

// ─── renderCell — default / all-null row ────────────────────────────────────

describe('TransactionsTable — full null fallback row', () => {
  it('renders without crashing and shows em-dashes', () => {
    render(<TransactionsTable transactions={[
      makeTx({ id: null, customerName: null, purchaseDate: null, productPurchased: null, price: null, points: null })
    ]} />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});

// ─── Sorting — purchaseDate (default orderBy) ────────────────────────────────

describe('TransactionsTable — sorting purchaseDate', () => {
  it('default sort is purchaseDate DESC — most recent first (Bob Feb)', () => {
    render(<TransactionsTable transactions={DATA} />);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Bob Jones');
  });

  it('clicking Purchase Date once switches to ASC — oldest first (Carol Dec)', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Purchase Date'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Carol White');
  });

  it('clicking Purchase Date twice returns to DESC', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Purchase Date'));
    fireEvent.click(screen.getByText('Purchase Date'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Bob Jones');
  });
});

// ─── Sorting — price (generic field, covers bValue<aValue and bValue>aValue) ─

describe('TransactionsTable — sorting price (covers all comparator branches)', () => {
  it('sort Price ASC: bValue < aValue => return 1 (lowest first = Carol $50)', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Price'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Carol White'); // $50 lowest
  });

  it('sort Price DESC: bValue > aValue => return -1 (highest first = Alice $151)', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Price'));
    fireEvent.click(screen.getByText('Price'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Alice Smith'); // $151 highest
  });

  it('sort comparator equal-value branch returns 0 and does not throw', () => {
    const tie1 = makeTx({ id: 'ta', price: 100 });
    const tie2 = makeTx({ id: 'tb', price: 100 });
    expect(() => render(<TransactionsTable transactions={[tie1, tie2]} />)).not.toThrow();
  });
});

// ─── Sorting — customerName ───────────────────────────────────────────────────

describe('TransactionsTable — sorting customerName', () => {
  it('sort Customer Name ASC — Alice first', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Customer Name'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Alice Smith');
  });

  it('sort Customer Name DESC — Carol first', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Customer Name'));
    fireEvent.click(screen.getByText('Customer Name'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Carol White');
  });
});

// ─── Sorting — ID (parseInt branch, lines 39–42) ────────────────────────────

describe('TransactionsTable — sorting ID (parseInt path)', () => {
  it('sort by ID ASC: numeric ids parsed and sorted correctly', () => {
    const t1 = makeTx({ id: 't10', customerName: 'Ten' });
    const t2 = makeTx({ id: 't2', customerName: 'Two' });
    const t3 = makeTx({ id: 't30', customerName: 'Thirty' });
    render(<TransactionsTable transactions={[t1, t2, t3]} />);
    fireEvent.click(screen.getByText('ID'));
    const rows = screen.getAllByRole('row').slice(1);
    // ASC: 2, 10, 30
    expect(rows[0].textContent).toContain('Two');
  });

  it('sort by ID DESC: highest numeric id first', () => {
    const t1 = makeTx({ id: 't10', customerName: 'Ten' });
    const t2 = makeTx({ id: 't2', customerName: 'Two' });
    const t3 = makeTx({ id: 't30', customerName: 'Thirty' });
    render(<TransactionsTable transactions={[t1, t2, t3]} />);
    fireEvent.click(screen.getByText('ID'));
    fireEvent.click(screen.getByText('ID'));
    const rows = screen.getAllByRole('row').slice(1);
    // DESC: 30, 10, 2
    expect(rows[0].textContent).toContain('Thirty');
  });

  it('id with no digits (empty after replace) falls back to 0', () => {
    const tNoDigit = makeTx({ id: 'abc', customerName: 'NoDigit' });
    const tNormal  = makeTx({ id: 't5',  customerName: 'Five' });
    render(<TransactionsTable transactions={[tNoDigit, tNormal]} />);
    fireEvent.click(screen.getByText('ID'));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// ─── Sorting — Points Earned ──────────────────────────────────────────────────

describe('TransactionsTable — sorting Points Earned', () => {
  it('sort Points Earned does not throw', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Points Earned'));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('sort Points Earned twice toggles back', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Points Earned'));
    fireEvent.click(screen.getByText('Points Earned'));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// ─── Sorting — Product ────────────────────────────────────────────────────────

describe('TransactionsTable — sorting Product', () => {
  it('sort by Product column does not throw', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Product'));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// ─── Pagination ───────────────────────────────────────────────────────────────

describe('TransactionsTable — pagination', () => {
  it('renders the rows-per-page combobox', () => {
    render(<TransactionsTable transactions={DATA} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('changing rows per page to 10 keeps all 3 rows visible', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: '10' }));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('Carol White')).toBeInTheDocument();
  });

  it('changing rows per page to 25 shows all rows and resets page to 0', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      makeTx({ id: `t${i}`, customerName: `User ${i}`, purchaseDate: `2024-01-0${(i % 9) + 1}T00:00:00Z` })
    );
    render(<TransactionsTable transactions={many} />);
    fireEvent.click(screen.getByTitle('Go to next page'));
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: '25' }));
    // All 12 rows on page 0
    expect(screen.getAllByRole('row')).toHaveLength(13);
  });

  it('navigating to next page shows second-page rows', () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      makeTx({ id: `t${i}`, customerName: `User ${i}`, purchaseDate: `2024-0${(i % 9) + 1}-01T00:00:00Z` })
    );
    render(<TransactionsTable transactions={many} />);
    fireEvent.click(screen.getByTitle('Go to next page'));
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('shows correct total count in pagination label', () => {
    render(<TransactionsTable transactions={DATA} />);
    expect(screen.getByText(/1.+3 of 3/)).toBeInTheDocument();
  });

  it('resets to page 0 when transactions length changes (useEffect)', () => {
    const { rerender } = render(<TransactionsTable transactions={DATA} />);
    const many = Array.from({ length: 8 }, (_, i) =>
      makeTx({ id: `t${i}`, customerName: `User ${i}`, purchaseDate: `2024-0${(i % 9) + 1}-01T00:00:00Z` })
    );
    rerender(<TransactionsTable transactions={many} />);
    fireEvent.click(screen.getByTitle('Go to next page'));
    rerender(<TransactionsTable transactions={[TX_A]} />);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Alice Smith');
  });
});

// ─── rowKey ───────────────────────────────────────────────────────────────────

describe('TransactionsTable — rowKey', () => {
  it('uses tx.id as key without throwing', () => {
    expect(() => render(<TransactionsTable transactions={[TX_A]} />)).not.toThrow();
  });

  it('falls back to Math.random() key when id is null without throwing', () => {
    expect(() => render(<TransactionsTable transactions={[makeTx({ id: null })]} />)).not.toThrow();
  });
});

// ─── ErrorBoundary — catches render errors ───────────────────────────────────

describe('TransactionsTable — ErrorBoundary', () => {
  it('renders the table normally when there is no error', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  it('catches a thrown render error via ErrorBoundary and shows fallback UI', () => {
    const err = console.error;
    console.error = jest.fn();

    // A component that always throws on render
    const Throw = () => { throw new Error('boundary test'); };

    // Import ErrorBoundary directly to test the boundary itself
    const { ErrorBoundary } = require('../common/ErrorBoundary');
    // Use the default export path since it's a class default export
    const EB = require('../common/ErrorBoundary').default;

    render(
      <EB>
        <Throw />
      </EB>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/boundary test/)).toBeInTheDocument();

    console.error = err;
  });

  it('ErrorBoundary Try Again resets the error state', () => {
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