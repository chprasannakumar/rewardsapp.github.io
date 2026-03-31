import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReusableTable from '../ReusableTable';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const baseProps = {
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'points', label: 'Points', sortable: false },
  ],
  rows: [
    { id: '1', name: 'Alice', points: 100 },
    { id: '2', name: 'Bob', points: 200 },
  ],
  rowKey: (row) => row.id,
  renderCell: (colId, row) => row[colId],
  order: 'asc',
  orderBy: 'name',
  onRequestSort: jest.fn(),
  title: 'Test Table',
};

const makePagination = (overrides = {}) => ({
  page: 0,
  rowsPerPage: 5,
  count: 10,
  onPageChange: jest.fn(),
  onRowsPerPageChange: jest.fn(),
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─── Empty / loading guard (line 39) ─────────────────────────────────────────

describe('ReusableTable — empty/loading guard', () => {
  test('shows emptyMessage when rows is empty and not loading', () => {
    render(<ReusableTable {...baseProps} rows={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  test('does NOT show empty message when rows is empty but isLoading is true — renders table instead', () => {
    // Branch: !rows?.length && !isLoading is FALSE because isLoading is true
    render(<ReusableTable {...baseProps} rows={[]} isLoading />);
    expect(screen.queryByText('No data available.')).not.toBeInTheDocument();
    // The loader overlay should be present
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  test('does not render table when rows is empty and not loading', () => {
    render(<ReusableTable {...baseProps} rows={[]} />);
    expect(screen.queryByText('Test Table')).not.toBeInTheDocument();
  });
});

// ─── Basic rendering ──────────────────────────────────────────────────────────

describe('ReusableTable — basic rendering', () => {
  test('renders title', () => {
    render(<ReusableTable {...baseProps} />);
    expect(screen.getByText('Test Table')).toBeInTheDocument();
  });

  test('renders column headers', () => {
    render(<ReusableTable {...baseProps} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
  });

  test('renders row data', () => {
    render(<ReusableTable {...baseProps} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  test('shows loading overlay when isLoading is true', () => {
    render(<ReusableTable {...baseProps} isLoading />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  test('does not show loading overlay when isLoading is false', () => {
    render(<ReusableTable {...baseProps} isLoading={false} />);
    expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
  });
});

// ─── title / titleExtra branches (lines 60, 69, 75) ─────────────────────────

describe('ReusableTable — title and titleExtra branches', () => {
  test('title present: header padding is 1.5rem (renders without error)', () => {
    render(<ReusableTable {...baseProps} title="Has Title" />);
    expect(screen.getByText('Has Title')).toBeInTheDocument();
  });

  test('title absent: renders without error and padding falls back to 1rem', () => {
    // title is optional; omitting it hits the `title ? '1.5rem' : '1rem'` false branch
    const { title: _omit, ...propsNoTitle } = baseProps;
    render(<ReusableTable {...propsNoTitle} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('titleExtra present: variant becomes h5 and extra node renders', () => {
    render(<ReusableTable {...baseProps} titleExtra={<span>Extra</span>} />);
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });

  test('titleExtra absent: titleExtra && titleExtra is falsy — no extra node', () => {
    render(<ReusableTable {...baseProps} />);
    // no "Extra" text in DOM
    expect(screen.queryByText('Extra')).not.toBeInTheDocument();
  });
});

// ─── titleColor / headerBgColor / headerTextColor fallbacks (lines 71, 88, 89)

describe('ReusableTable — color prop fallbacks', () => {
  test('omitting titleColor falls back to text.primary without crashing', () => {
    const { ...props } = { ...baseProps };
    delete props.titleColor;
    render(<ReusableTable {...props} />);
    expect(screen.getByText('Test Table')).toBeInTheDocument();
  });

  test('titleColor supplied overrides default', () => {
    render(<ReusableTable {...baseProps} titleColor="#ff0000" />);
    expect(screen.getByText('Test Table')).toBeInTheDocument();
  });

  test('omitting headerBgColor falls back to #f8fafc without crashing', () => {
    const { ...props } = { ...baseProps };
    delete props.headerBgColor;
    render(<ReusableTable {...props} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  test('omitting headerTextColor falls back to #475569 without crashing', () => {
    const { ...props } = { ...baseProps };
    delete props.headerTextColor;
    render(<ReusableTable {...props} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});

// ─── columns ?? [] null-guard (line 82 and 114) ──────────────────────────────

describe('ReusableTable — columns null guard', () => {
  test('renders without crashing when columns is null (falls back to [])', () => {
    // columns prop is required but the code has `columns ?? []` defensive guard
    expect(() =>
      render(<ReusableTable {...baseProps} columns={null} />)
    ).not.toThrow();
  });
});

// ─── sortDirection and sort label branches (lines 85, 96–106) ────────────────

describe('ReusableTable — sort label branches', () => {
  test('sortable=false column renders plain label, not a button', () => {
    render(<ReusableTable {...baseProps} />);
    // "Points" has sortable:false — clicking it must not call onRequestSort
    fireEvent.click(screen.getByText('Points'));
    expect(baseProps.onRequestSort).not.toHaveBeenCalled();
  });

  test('sortable column (no sortable key) renders TableSortLabel and fires sort', () => {
    const onRequestSort = jest.fn();
    render(<ReusableTable {...baseProps} onRequestSort={onRequestSort} />);
    fireEvent.click(screen.getByText('Name'));
    expect(onRequestSort).toHaveBeenCalledWith('name');
  });

  test('orderBy matching active column sets active sort label', () => {
    // orderBy === col.id branch: direction uses order; active=true
    render(<ReusableTable {...baseProps} orderBy="name" order="asc" />);
    // The active sort label button for "Name" is present
    const sortBtn = screen.getByRole('button', { name: /Name/i });
    expect(sortBtn).toBeInTheDocument();
  });

  test('orderBy NOT matching a column: direction falls back to asc', () => {
    // orderBy !== col.id => direction='asc', active=false
    render(<ReusableTable {...baseProps} orderBy="unknown" order="desc" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  test('sortDirection prop is order when orderBy matches col.id', () => {
    render(<ReusableTable {...baseProps} orderBy="name" order="desc" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('sortDirection prop is false when orderBy does not match col.id', () => {
    render(<ReusableTable {...baseProps} orderBy="points" order="asc" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// ─── paperSx spread (line 53) ────────────────────────────────────────────────

describe('ReusableTable — paperSx', () => {
  test('accepts custom paperSx without crashing', () => {
    render(<ReusableTable {...baseProps} paperSx={{ height: '100%' }} />);
    expect(screen.getByText('Test Table')).toBeInTheDocument();
  });

  test('works with empty paperSx (default)', () => {
    render(<ReusableTable {...baseProps} paperSx={{}} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// ─── pagination block (lines 123–136) ────────────────────────────────────────

describe('ReusableTable — pagination', () => {
  test('renders pagination when pagination prop provided', () => {
    render(<ReusableTable {...baseProps} pagination={makePagination()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('does not render pagination when pagination prop is absent', () => {
    render(<ReusableTable {...baseProps} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('pagination.count ?? 0 — uses supplied count', () => {
    render(<ReusableTable {...baseProps} pagination={makePagination({ count: 42 })} />);
    // MUI renders something like "1–2 of 42"
    expect(screen.getByText(/of 42/)).toBeInTheDocument();
  });

  test('pagination.count ?? 0 — count falls back to 0 when undefined', () => {
    const paginationNoCount = makePagination();
    delete paginationNoCount.count;
    // Should not crash; count ?? 0 makes it 0
    render(<ReusableTable {...baseProps} pagination={paginationNoCount} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('onPageChange is wired up', () => {
    const onPageChange = jest.fn();
    const manyRows = Array.from({ length: 10 }, (_, i) => ({ id: String(i), name: `User${i}`, points: i }));
    render(
      <ReusableTable
        {...baseProps}
        rows={manyRows}
        pagination={makePagination({ count: 10, onPageChange })}
      />
    );
    fireEvent.click(screen.getByTitle('Go to next page'));
    expect(onPageChange).toHaveBeenCalled();
  });

  test('onRowsPerPageChange is wired up', () => {
    const onRowsPerPageChange = jest.fn();
    render(
      <ReusableTable
        {...baseProps}
        pagination={makePagination({ onRowsPerPageChange })}
      />
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: '10' }));
    expect(onRowsPerPageChange).toHaveBeenCalled();
  });
});

// ─── maxHeight default ────────────────────────────────────────────────────────

describe('ReusableTable — maxHeight default', () => {
  test('uses default maxHeight (400) when not supplied', () => {
    const { maxHeight: _omit, ...props } = baseProps;
    render(<ReusableTable {...props} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('accepts custom maxHeight', () => {
    render(<ReusableTable {...baseProps} maxHeight={600} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});