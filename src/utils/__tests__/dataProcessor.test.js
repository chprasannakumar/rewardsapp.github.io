import {
  calculatePoints,
  getMonthYear,
  processTransactions,
  sortTransactionsByDate,
  sortMonthlyRewards,
  sortTotalRewards,
} from '../dataProcessor';

// ─── calculatePoints ────────────────────────────────────────────────────────

describe('calculatePoints', () => {
  // Invalid inputs now throw rather than silently returning 0
  test('throws for null', () => {
    expect(() => calculatePoints(null)).toThrow('calculatePoints');
  });

  test('throws for undefined', () => {
    expect(() => calculatePoints(undefined)).toThrow('calculatePoints');
  });

  test('throws for NaN', () => {
    expect(() => calculatePoints(NaN)).toThrow('calculatePoints');
  });

  test('throws for string', () => {
    expect(() => calculatePoints('120')).toThrow('calculatePoints');
  });

  test('throws for object', () => {
    expect(() => calculatePoints({})).toThrow('calculatePoints');
  });

  test('returns 0 for purchases at or below $50', () => {
    expect(calculatePoints(0)).toBe(0);
    expect(calculatePoints(49.99)).toBe(0);
    expect(calculatePoints(50)).toBe(0);
    expect(calculatePoints(50.9)).toBe(0);
  });

  test('returns 1 pt per dollar between $50 and $100 (floor logic)', () => {
    expect(calculatePoints(51)).toBe(1);
    expect(calculatePoints(51.9)).toBe(1);
    expect(calculatePoints(75)).toBe(25);
    expect(calculatePoints(99.99)).toBe(49);
    expect(calculatePoints(100)).toBe(50);
    expect(calculatePoints(100.9)).toBe(50);
  });

  test('returns 2 pts per dollar over $100 plus 50 base (floor logic)', () => {
    expect(calculatePoints(101)).toBe(52);
    expect(calculatePoints(120)).toBe(90);
    expect(calculatePoints(120.1)).toBe(90);
    expect(calculatePoints(120.9)).toBe(90);
    expect(calculatePoints(200)).toBe(250);
  });
});

// ─── getMonthYear ────────────────────────────────────────────────────────────

describe('getMonthYear', () => {
  // Invalid inputs now throw rather than returning null
  test('throws for null', () => {
    expect(() => getMonthYear(null)).toThrow('getMonthYear');
  });

  test('throws for undefined', () => {
    expect(() => getMonthYear(undefined)).toThrow('getMonthYear');
  });

  test('throws for empty string', () => {
    expect(() => getMonthYear('')).toThrow('getMonthYear');
  });

  test('throws for unparseable date string', () => {
    expect(() => getMonthYear('not-a-date')).toThrow('getMonthYear');
  });

  test('throws for out-of-range month (2024-13-01)', () => {
    expect(() => getMonthYear('2024-13-01')).toThrow('getMonthYear');
  });

  test('returns correct month/year for December', () => {
    const result = getMonthYear('2023-12-05T10:00:00Z');
    expect(result.monthString).toBe('December');
    expect(result.monthIndex).toBe(11);
    expect(result.year).toBe(2023);
    expect(result.yearString).toBe('2023');
  });

  test('returns correct month/year for January', () => {
    const result = getMonthYear('2024-01-20T10:00:00Z');
    expect(result.monthString).toBe('January');
    expect(result.monthIndex).toBe(0);
    expect(result.year).toBe(2024);
  });

  test('returns correct values for February', () => {
    const result = getMonthYear('2024-02-14T00:00:00Z');
    expect(result.monthString).toBe('February');
    expect(result.monthIndex).toBe(1);
  });
});

// ─── sortTransactionsByDate ──────────────────────────────────────────────────

describe('sortTransactionsByDate', () => {
  // Invalid inputs now throw rather than returning []
  test('throws for null', () => {
    expect(() => sortTransactionsByDate(null)).toThrow('sortTransactionsByDate');
  });

  test('throws for undefined', () => {
    expect(() => sortTransactionsByDate(undefined)).toThrow('sortTransactionsByDate');
  });

  test('sorts descending by purchaseDate', () => {
    const txs = [
      { id: '1', purchaseDate: '2024-01-10T00:00:00Z' },
      { id: '2', purchaseDate: '2024-01-20T00:00:00Z' },
      { id: '3', purchaseDate: '2023-12-15T00:00:00Z' },
    ];
    const sorted = sortTransactionsByDate(txs);
    expect(sorted.map(t => t.id)).toEqual(['2', '1', '3']);
  });

  test('handles missing purchaseDate gracefully', () => {
    const txs = [{ id: '1', purchaseDate: '2024-01-10T00:00:00Z' }, { id: '2' }];
    expect(() => sortTransactionsByDate(txs)).not.toThrow();
  });
});

// ─── sortMonthlyRewards ──────────────────────────────────────────────────────

describe('sortMonthlyRewards', () => {
  test('throws for null', () => {
    expect(() => sortMonthlyRewards(null)).toThrow('sortMonthlyRewards');
  });

  test('throws for undefined', () => {
    expect(() => sortMonthlyRewards(undefined)).toThrow('sortMonthlyRewards');
  });

  test('sorts by year desc then month desc', () => {
    const rewards = [
      { customerId: 'c1', year: 2024, monthIndex: 0 },
      { customerId: 'c2', year: 2023, monthIndex: 11 },
      { customerId: 'c3', year: 2024, monthIndex: 1 },
    ];
    const sorted = sortMonthlyRewards(rewards);
    expect(sorted[0]).toMatchObject({ year: 2024, monthIndex: 1 });
    expect(sorted[1]).toMatchObject({ year: 2024, monthIndex: 0 });
    expect(sorted[2]).toMatchObject({ year: 2023, monthIndex: 11 });
  });

  test('handles missing year/monthIndex gracefully', () => {
    const rewards = [{ customerId: 'c1' }, { customerId: 'c2', year: 2024, monthIndex: 0 }];
    expect(() => sortMonthlyRewards(rewards)).not.toThrow();
  });
});

// ─── sortTotalRewards ────────────────────────────────────────────────────────

describe('sortTotalRewards', () => {
  test('throws for null', () => {
    expect(() => sortTotalRewards(null)).toThrow('sortTotalRewards');
  });

  test('throws for undefined', () => {
    expect(() => sortTotalRewards(undefined)).toThrow('sortTotalRewards');
  });

  test('sorts by points descending', () => {
    const rewards = [
      { customerId: 'a', points: 50 },
      { customerId: 'b', points: 200 },
      { customerId: 'c', points: 100 },
    ];
    const sorted = sortTotalRewards(rewards);
    expect(sorted.map(r => r.customerId)).toEqual(['b', 'c', 'a']);
  });

  test('handles missing points gracefully', () => {
    const rewards = [{ customerId: 'a' }, { customerId: 'b', points: 100 }];
    expect(() => sortTotalRewards(rewards)).not.toThrow();
  });
});

// ─── processTransactions ─────────────────────────────────────────────────────

describe('processTransactions', () => {
  test('returns empty structure for empty array', () => {
    expect(processTransactions([])).toEqual({ transactions: [], monthlyRewards: [], totalRewards: [] });
  });

  // processTransactions itself no longer returns empty for non-array; the outer
  // guard is: if (!Array.isArray || length===0) => empty. Non-array still returns empty.
  test('returns empty structure for null input', () => {
    expect(processTransactions(null)).toEqual({ transactions: [], monthlyRewards: [], totalRewards: [] });
  });

  test('returns empty structure for undefined input', () => {
    expect(processTransactions(undefined)).toEqual({ transactions: [], monthlyRewards: [], totalRewards: [] });
  });

  test('skips transactions missing id, customerId or purchaseDate', () => {
    const bad = [
      { customerName: 'No ID', purchaseDate: '2024-01-01T00:00:00Z', price: 120 },
      { id: 't1', customerName: 'No Customer', purchaseDate: '2024-01-01T00:00:00Z', price: 120 },
      { id: 't2', customerId: 'c1', customerName: 'No Date', price: 120 },
    ];
    const result = processTransactions(bad);
    expect(result.transactions).toHaveLength(0);
  });

  test('skips transactions with invalid purchaseDate (graceful per-row handling)', () => {
    const bad = [{ id: 't1', customerId: 'c1', customerName: 'A', purchaseDate: 'bad-date', price: 120 }];
    const result = processTransactions(bad);
    expect(result.transactions).toHaveLength(0);
  });

  test('skips transactions with invalid price (graceful per-row handling)', () => {
    const bad = [{ id: 't1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-01-01T00:00:00Z', price: 'not-a-number' }];
    const result = processTransactions(bad);
    expect(result.transactions).toHaveLength(0);
  });

  test('correctly groups transactions across year boundaries', () => {
    const mockData = [
      { id: '1', customerId: 'c1', customerName: 'User A', purchaseDate: '2023-12-15T00:00:00Z', price: 120 },
      { id: '2', customerId: 'c1', customerName: 'User A', purchaseDate: '2024-01-20T00:00:00Z', price: 120.5 },
      { id: '3', customerId: 'c2', customerName: 'User B', purchaseDate: '2024-01-10T00:00:00Z', price: 50.5 },
    ];

    const { transactions, monthlyRewards, totalRewards } = processTransactions(mockData);

    expect(transactions[0].id).toBe('2');
    expect(transactions[1].id).toBe('3');
    expect(transactions[2].id).toBe('1');

    expect(monthlyRewards).toHaveLength(3);

    const userA_Dec = monthlyRewards.find(r => r.customerId === 'c1' && r.month === 'December');
    expect(userA_Dec.points).toBe(90);

    const userA_Jan = monthlyRewards.find(r => r.customerId === 'c1' && r.month === 'January');
    expect(userA_Jan.points).toBe(90);

    const userB_Jan = monthlyRewards.find(r => r.customerId === 'c2' && r.month === 'January');
    expect(userB_Jan.points).toBe(0);

    expect(totalRewards.find(t => t.customerId === 'c1').points).toBe(180);
    expect(totalRewards.find(t => t.customerId === 'c2').points).toBe(0);
  });

  test('uses "Unknown" for missing customerName', () => {
    const mockData = [
      { id: 't1', customerId: 'c1', purchaseDate: '2024-01-10T00:00:00Z', price: 120 },
    ];
    const { transactions, totalRewards } = processTransactions(mockData);
    expect(transactions[0].customerName).toBeUndefined();
    expect(totalRewards[0].customerName).toBe('Unknown');
  });

  test('totalRewards are sorted by points descending', () => {
    const mockData = [
      { id: '1', customerId: 'c1', customerName: 'Low', purchaseDate: '2024-01-01T00:00:00Z', price: 60 },
      { id: '2', customerId: 'c2', customerName: 'High', purchaseDate: '2024-01-01T00:00:00Z', price: 200 },
    ];
    const { totalRewards } = processTransactions(mockData);
    expect(totalRewards[0].customerId).toBe('c2');
    expect(totalRewards[1].customerId).toBe('c1');
  });

  test('adds points, monthIndex and year to each transaction', () => {
    const mockData = [
      { id: 't1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-02-10T00:00:00Z', price: 150 },
    ];
    const { transactions } = processTransactions(mockData);
    expect(transactions[0].points).toBe(150);
    expect(transactions[0].monthIndex).toBe(1);
    expect(transactions[0].year).toBe(2024);
  });
});
