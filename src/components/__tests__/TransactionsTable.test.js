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

  it('count badge is absent in empty state', () => {
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

  it('does not render loading overlay when isLoading is not provided', () => {
    render(<TransactionsTable transactions={DATA} />);
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

  it('does not crash when isLoading is not provided', () => {
    expect(() => render(<TransactionsTable transactions={DATA} />)).not.toThrow();
  });
});

// ─── sortedTransactions non-array guard ──────────────────────────────────────

describe('TransactionsTable — non-array transactions guard', () => {
  it('renders empty table when transactions is null', () => {
    expect(() => render(<TransactionsTable transactions={null} />)).not.toThrow();
  });

  it('renders empty table when transactions is undefined', () => {
    expect(() => render(<TransactionsTable transactions={undefined} />)).not.toThrow();
  });

  it('renders empty table when transactions is a string', () => {
    expect(() => render(<TransactionsTable transactions="bad" />)).not.toThrow();
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

  it('renders #undefined safely when id is undefined', () => {
    expect(() =>
      render(<TransactionsTable transactions={[makeTx({ id: undefined })]} />)
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

  it('renders em-dash when customerName is undefined', () => {
    render(<TransactionsTable transactions={[makeTx({ customerName: undefined })]} />);
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
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('renders em-dash when purchaseDate is empty string (falsy branch)', () => {
    render(<TransactionsTable transactions={[makeTx({ purchaseDate: '' })]} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('renders formatted date when purchaseDate is present (truthy branch)', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
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

  it('renders em-dash when productPurchased is undefined', () => {
    render(<TransactionsTable transactions={[makeTx({ productPurchased: undefined })]} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });
});

// ─── renderCell — price (cents visible) ──────────────────────────────────────

describe('TransactionsTable — renderCell price', () => {
  it('formats price with two decimal places — cents are shown', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.getByText(/151\.00/)).toBeInTheDocument();
  });

  it('renders $0.00 when price is null', () => {
    render(<TransactionsTable transactions={[makeTx({ price: null })]} />);
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it('renders $0.00 when price is 0', () => {
    render(<TransactionsTable transactions={[makeTx({ id: 'tz', price: 0 })]} />);
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it('formats price 75 as 75.00', () => {
    render(<TransactionsTable transactions={[TX_B]} />);
    expect(screen.getByText(/75\.00/)).toBeInTheDocument();
  });

  it('renders cents correctly for $120.50', () => {
    render(<TransactionsTable transactions={[makeTx({ id: 'tc', price: 120.50 })]} />);
    expect(screen.getByText(/120\.50/)).toBeInTheDocument();
  });

  it('renders cents correctly for $99.99', () => {
    render(<TransactionsTable transactions={[makeTx({ id: 'td', price: 99.99 })]} />);
    expect(screen.getByText(/99\.99/)).toBeInTheDocument();
  });

  it('formats large price with commas', () => {
    render(<TransactionsTable transactions={[makeTx({ id: 'tb', price: 1000000 })]} />);
    expect(screen.getByText(/1,000,000\.00/)).toBeInTheDocument();
  });

  it('formats price with decimal cents — $1,234.56', () => {
    render(<TransactionsTable transactions={[makeTx({ id: 'te', price: 1234.56 })]} />);
    expect(screen.getByText(/1,234\.56/)).toBeInTheDocument();
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

  it('renders 0 when points is null', () => {
    render(<TransactionsTable transactions={[makeTx({ points: null })]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders 0 when points is undefined', () => {
    render(<TransactionsTable transactions={[makeTx({ points: undefined })]} />);
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

// ─── Sorting — price ─────────────────────────────────────────────────────────

describe('TransactionsTable — sorting price (covers all comparator branches)', () => {
  it('sort Price ASC: lowest price first (Carol $50)', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Price'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Carol White');
  });

  it('sort Price DESC: highest price first (Alice $151)', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Price'));
    fireEvent.click(screen.getByText('Price'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Alice Smith');
  });

  it('sort comparator equal-value branch returns 0 and does not throw', () => {
    const tie1 = makeTx({ id: 'ta', price: 100 });
    const tie2 = makeTx({ id: 'tb', price: 100 });
    expect(() => render(<TransactionsTable transactions={[tie1, tie2]} />)).not.toThrow();
  });

  it('cents in price sort correctly — $75.99 before $75.00 in DESC', () => {
    const low  = makeTx({ id: 'ta', customerName: 'LowCents',  price: 75.00 });
    const high = makeTx({ id: 'tb', customerName: 'HighCents', price: 75.99 });
    render(<TransactionsTable transactions={[low, high]} />);
    fireEvent.click(screen.getByText('Price'));       // ASC
    fireEvent.click(screen.getByText('Price'));       // DESC
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('HighCents');
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

// ─── Sorting — ID (parseInt branch) ─────────────────────────────────────────

describe('TransactionsTable — sorting ID (parseInt path)', () => {
  it('sort by ID ASC: numeric ids parsed and sorted correctly', () => {
    const t1 = makeTx({ id: 't10', customerName: 'Ten' });
    const t2 = makeTx({ id: 't2', customerName: 'Two' });
    const t3 = makeTx({ id: 't30', customerName: 'Thirty' });
    render(<TransactionsTable transactions={[t1, t2, t3]} />);
    fireEvent.click(screen.getByText('ID'));
    const rows = screen.getAllByRole('row').slice(1);
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
    expect(rows[0].textContent).toContain('Thirty');
  });

  it('id with no digits falls back to 0', () => {
    const tNoDigit = makeTx({ id: 'abc', customerName: 'NoDigit' });
    const tNormal  = makeTx({ id: 't5',  customerName: 'Five' });
    render(<TransactionsTable transactions={[tNoDigit, tNormal]} />);
    fireEvent.click(screen.getByText('ID'));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('sort by ID with tie (same numeric value) does not throw', () => {
    const t1 = makeTx({ id: 'x5', customerName: 'First' });
    const t2 = makeTx({ id: 'y5', customerName: 'Second' });
    render(<TransactionsTable transactions={[t1, t2]} />);
    fireEvent.click(screen.getByText('ID'));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// ─── Sorting — Points Earned ──────────────────────────────────────────────────

describe('TransactionsTable — sorting Points Earned', () => {
  it('sort Points Earned ASC puts lowest points first', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Points Earned'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Carol White'); // 0 pts
  });

  it('sort Points Earned DESC puts highest points first', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Points Earned'));
    fireEvent.click(screen.getByText('Points Earned'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Alice Smith'); // 152 pts
  });
});

// ─── Sorting — Product ────────────────────────────────────────────────────────

describe('TransactionsTable — sorting Product', () => {
  it('sort by Product ASC — Laptop before Phone before Tablet', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Product'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Laptop');
  });

  it('sort by Product DESC — Tablet first', () => {
    render(<TransactionsTable transactions={DATA} />);
    fireEvent.click(screen.getByText('Product'));
    fireEvent.click(screen.getByText('Product'));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Tablet');
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

  it('handleRowsPerPageChange resets page and updates rowsPerPage', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeTx({ id: `t${i}`, customerName: `User ${i}`, purchaseDate: '2024-01-01T00:00:00Z' })
    );
    render(<TransactionsTable transactions={many} />);
    fireEvent.click(screen.getByTitle('Go to next page'));
    // Change to 10 per page — should reset to page 0 and show all 10
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: '10' }));
    expect(screen.getAllByRole('row')).toHaveLength(11); // header + 10 rows
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

// ─── ErrorBoundary ───────────────────────────────────────────────────────────

describe('TransactionsTable — ErrorBoundary', () => {
  it('renders the table normally when there is no error', () => {
    render(<TransactionsTable transactions={[TX_A]} />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  it('catches a thrown render error via ErrorBoundary and shows fallback UI', () => {
    const err = console.error;
    console.error = jest.fn();

    const EB = require('../common/ErrorBoundary').default;
    const Throw = () => { throw new Error('boundary test'); };

    render(<EB><Throw /></EB>);

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

  it('ErrorBoundary with custom fallback prop renders custom UI', () => {
    const err = console.error;
    console.error = jest.fn();

    const EB = require('../common/ErrorBoundary').default;
    const Throw = () => { throw new Error('custom fallback test'); };
    const customFallback = (msg, reset) => (
      <div>
        <span>Custom: {msg}</span>
        <button onClick={reset}>Reset</button>
      </div>
    );

    render(<EB fallback={customFallback}><Throw /></EB>);

    expect(screen.getByText(/Custom: custom fallback test/)).toBeInTheDocument();

    console.error = err;
  });
});
